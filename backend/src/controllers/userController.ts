import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { db } from '../config/db';
import { AuthenticatedRequest, UserRole, ApiResponse, RoleHierarchy } from '../types/auth.types';

// Interface for user creation request
interface CreateUserRequest {
  name: string;
  email: string;
  phone?: string;
  nic_no: string;
  nic_dl_photo?: string;
  username: string;
  password: string;
  role: UserRole;
  branch_id?: string;
  hire_date?: string;
  salary?: number;
}

// Interface for guest registration request (public registration)
interface RegisterGuestRequest {
  name: string;
  email: string;
  phone?: string;
  nic_no: string;
  username: string;
  password: string;
  confirmPassword: string;
}

// Interface for database user row
interface DatabaseUserRow extends RowDataPacket {
  user_id: string;
  name: string;
  is_guest: number;
  email: string;
  phone?: string;
  nic_no: string;
  nic_dl_photo?: string;
  username: string;
  created_at: Date;
  updated_at: Date;
  role?: UserRole;
  branch_id?: string;
  branch_name?: string;
  staff_id?: string;
  hire_date?: Date;
  salary?: number;
  retired_date?: Date;
}

// Interface for branch validation
interface BranchRow extends RowDataPacket {
  branch_id: string;
  branch_name: string;
  manager_id?: string;
}

export class UserController {
  private connection: PoolConnection | null = null;

  // Initialize database connection
  private async initConnection(): Promise<void> {
    if (!this.connection) {
      this.connection = await db.getConnection();
    }
  }

  // Validate if user can create another user with specified role
  private canCreateUserRole(creatorRole: UserRole, targetRole: UserRole): boolean {
    const creatorLevel = RoleHierarchy[creatorRole];
    const targetLevel = RoleHierarchy[targetRole];

    // Admins can create any role
    if (creatorRole === UserRole.ADMIN) {
      return true;
    }

    // Managers can only create RECEPTIONIST and HOUSEKEEPING
    if (creatorRole === UserRole.MANAGER) {
      return targetRole === UserRole.RECEPTIONIST || targetRole === UserRole.HOUSEKEEPING;
    }

    // Other roles cannot create users
    return false;
  }

  // Validate branch ownership for managers
  private async validateBranchAccess(userId: string, branchId: string): Promise<boolean> {
    await this.initConnection();

    try {
      const [rows] = await this.connection!.execute<BranchRow[]>(
        `SELECT branch_id, manager_id FROM hotel_branches WHERE branch_id = ?`,
        [branchId]
      );

      if (rows.length === 0) {
        return false; // Branch doesn't exist
      }

      // Check if the user is the manager of this branch
      return rows[0]?.manager_id === userId;
    } catch (error) {
      console.error('Error validating branch access:', error);
      return false;
    }
  }

  // Check if username/email already exists
  private async checkUserExists(username: string, email: string, nicNo: string): Promise<boolean> {
    await this.initConnection();

    try {
      const [rows] = await this.connection!.execute<RowDataPacket[]>(
        `SELECT user_id FROM users WHERE username = ? OR email = ? OR nic_no = ?`,
        [username, email, nicNo]
      );

      return rows.length > 0;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return true; // Assume exists to prevent creation on error
    }
  }

  // Check if branch already has a manager
  private async checkBranchHasManager(branchId: string): Promise<boolean> {
    await this.initConnection();

    try {
      const [rows] = await this.connection!.execute<RowDataPacket[]>(
        `SELECT manager_id FROM hotel_branches WHERE branch_id = ? AND manager_id IS NOT NULL`,
        [branchId]
      );

      return rows.length > 0;
    } catch (error) {
      console.error('Error checking branch manager:', error);
      return true; // Assume has manager to prevent conflicts on error
    }
  }

  // Create a new user
  public createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const {
        name,
        email,
        phone,
        nic_no,
        nic_dl_photo,
        username,
        password,
        role,
        branch_id,
        hire_date,
        salary
      } = req.body as CreateUserRequest;

      // Validate required fields
      if (!name || !email || !nic_no || !username || !password || !role) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: name, email, nic_no, username, password, role'
        } as ApiResponse);
        return;
      }

      // Validate role enum
      if (!Object.values(UserRole).includes(role)) {
        res.status(400).json({
          success: false,
          message: 'Invalid role provided'
        } as ApiResponse);
        return;
      }

      // Check if creator can create this role
      const creatorRole = req.user?.role;
      if (!creatorRole || !this.canCreateUserRole(creatorRole, role)) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions to create user with this role'
        } as ApiResponse);
        return;
      }

      // For managers, validate branch access and require branch_id
      if (creatorRole === UserRole.MANAGER) {
        if (!branch_id) {
          res.status(400).json({
            success: false,
            message: 'Branch ID is required when manager creates users'
          } as ApiResponse);
          return;
        }

        const canAccessBranch = await this.validateBranchAccess(req.user!.user_id, branch_id);
        if (!canAccessBranch) {
          res.status(403).json({
            success: false,
            message: 'Cannot create users in branches you do not manage'
          } as ApiResponse);
          return;
        }
      }

      // For non-guest roles, branch_id is required
      if (role !== UserRole.GUEST && !branch_id) {
        res.status(400).json({
          success: false,
          message: 'Branch ID is required for staff roles'
        } as ApiResponse);
        return;
      }

      // If creating a manager, check if branch already has a manager
      if (role === UserRole.MANAGER && branch_id) {
        const hasExistingManager = await this.checkBranchHasManager(branch_id);
        if (hasExistingManager) {
          res.status(409).json({
            success: false,
            message: 'Branch already has a manager assigned. Please remove the existing manager first.'
          } as ApiResponse);
          return;
        }
      }

      // Check if user already exists
      const userExists = await this.checkUserExists(username, email, nic_no);
      if (userExists) {
        res.status(409).json({
          success: false,
          message: 'User with this username, email, or NIC already exists'
        } as ApiResponse);
        return;
      }

      await this.initConnection();

      // Start transaction
      await this.connection!.beginTransaction();

      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        const userId = uuidv4();
        const isGuest = role === UserRole.GUEST ? 1 : 0;

        // Insert user
        await this.connection!.execute(
          `INSERT INTO users (user_id, name, is_guest, email, phone, nic_no, nic_dl_photo, username, password)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, name, isGuest, email, phone || null, nic_no, nic_dl_photo || null, username, hashedPassword]
        );

        // Insert staff record if not guest
        if (role !== UserRole.GUEST) {
          await this.connection!.execute(
            `INSERT INTO staff (staff_id, branch_id, role, hire_date, salary)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, branch_id, role, hire_date || null, salary || null]
          );

          // If creating a manager, update the branch table to assign this manager
          if (role === UserRole.MANAGER && branch_id) {
            await this.connection!.execute(
              `UPDATE hotel_branches SET manager_id = ? WHERE branch_id = ?`,
              [userId, branch_id]
            );
            
            console.log(`✅ Manager ${userId} assigned to branch ${branch_id}`);
          }
        }

        // Commit transaction
        await this.connection!.commit();

        // Fetch created user details
        const [userRows] = await this.connection!.execute<DatabaseUserRow[]>(
          `SELECT u.user_id, u.name, u.email, u.username, u.is_guest, u.created_at,
                  s.role, s.branch_id, s.hire_date, s.salary
           FROM users u
           LEFT JOIN staff s ON u.user_id = s.staff_id
           WHERE u.user_id = ?`,
          [userId]
        );

        const newUser = userRows[0];

        if (!newUser) {
          throw new Error('Failed to retrieve created user');
        }

        res.status(201).json({
          success: true,
          message: 'User created successfully',
          data: {
            user_id: newUser.user_id,
            name: newUser.name,
            email: newUser.email,
            username: newUser.username,
            role: newUser.role || UserRole.GUEST,
            branch_id: newUser.branch_id,
            is_guest: newUser.is_guest === 1,
            hire_date: newUser.hire_date,
            salary: newUser.salary,
            created_at: newUser.created_at
          }
        } as ApiResponse);

      } catch (error) {
        // Rollback transaction
        await this.connection!.rollback();
        throw error;
      }

    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating user'
      } as ApiResponse);
    }
  };

  // Get all users (with role-based filtering)
  public getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      await this.initConnection();

      const creatorRole = req.user?.role;
      const creatorUserId = req.user?.user_id;
      const creatorBranchId = req.user?.branch_id;

      let query = `
        SELECT u.user_id, u.name, u.email, u.username, u.is_guest, u.phone, u.nic_no, u.created_at,
               s.role, s.branch_id, s.hire_date, s.salary, s.retired_date,
               hb.branch_name
        FROM users u
        LEFT JOIN staff s ON u.user_id = s.staff_id
        LEFT JOIN hotel_branches hb ON s.branch_id = hb.branch_id
      `;

      const queryParams: any[] = [];

      // Apply role-based filtering
      if (creatorRole === UserRole.MANAGER && creatorBranchId) {
        // Managers can only see users in their branch
        query += ` WHERE s.branch_id = ? OR u.is_guest = 1`;
        queryParams.push(creatorBranchId);
      } else if (creatorRole !== UserRole.ADMIN) {
        // Non-admins and non-managers can't see user list
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions to view users'
        } as ApiResponse);
        return;
      }

      query += ` ORDER BY u.created_at DESC`;

      const [rows] = await this.connection!.execute<DatabaseUserRow[]>(query, queryParams);

      const users = rows.map(row => ({
        user_id: row.user_id,
        name: row.name,
        email: row.email,
        username: row.username,
        role: row.role || UserRole.GUEST,
        branch_id: row.branch_id,
        branch_name: row.branch_name,
        is_guest: row.is_guest === 1,
        phone: row.phone,
        nic_no: row.nic_no,
        hire_date: row.hire_date,
        salary: row.salary,
        retired_date: row.retired_date,
        created_at: row.created_at
      }));

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users
      } as ApiResponse);

    } catch (error) {
      console.error('Error retrieving users:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving users'
      } as ApiResponse);
    }
  };

  // Get user by ID
  public getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required'
        } as ApiResponse);
        return;
      }

      await this.initConnection();

      const creatorRole = req.user?.role;
      const creatorBranchId = req.user?.branch_id;

      let query = `
        SELECT u.user_id, u.name, u.email, u.username, u.is_guest, u.phone, u.nic_no, u.created_at,
               s.role, s.branch_id, s.hire_date, s.salary, s.retired_date,
               hb.branch_name
        FROM users u
        LEFT JOIN staff s ON u.user_id = s.staff_id
        LEFT JOIN hotel_branches hb ON s.branch_id = hb.branch_id
        WHERE u.user_id = ?
      `;

      const [rows] = await this.connection!.execute<DatabaseUserRow[]>(query, [userId]);

      const user = rows[0];

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        } as ApiResponse);
        return;
      }

      // Check access permissions
      if (creatorRole === UserRole.MANAGER) {
        // Managers can only see users in their branch or guests
        if (user.branch_id !== creatorBranchId && user.is_guest !== 1) {
          res.status(403).json({
            success: false,
            message: 'Insufficient permissions to view this user'
          } as ApiResponse);
          return;
        }
      } else if (creatorRole !== UserRole.ADMIN) {
        // Other roles can only see their own profile
        if (user.user_id !== req.user?.user_id) {
          res.status(403).json({
            success: false,
            message: 'Insufficient permissions to view this user'
          } as ApiResponse);
          return;
        }
      }

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role || UserRole.GUEST,
          branch_id: user.branch_id,
          branch_name: user.branch_name,
          is_guest: user.is_guest === 1,
          phone: user.phone,
          nic_no: user.nic_no,
          hire_date: user.hire_date,
          salary: user.salary,
          retired_date: user.retired_date,
          created_at: user.created_at
        }
      } as ApiResponse);

    } catch (error) {
      console.error('Error retrieving user:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving user'
      } as ApiResponse);
    }
  };

  // Public guest registration (no authentication required)
  public registerGuest = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        name,
        email,
        phone,
        nic_no,
        username,
        password,
        confirmPassword
      } = req.body as RegisterGuestRequest;

      // Validate required fields
      if (!name || !email || !nic_no || !username || !password || !confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: name, email, nic_no, username, password, confirmPassword'
        } as ApiResponse);
        return;
      }

      // Validate password confirmation
      if (password !== confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'Passwords do not match'
        } as ApiResponse);
        return;
      }

      // Validate password strength (minimum 8 characters)
      if (password.length < 8) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long'
        } as ApiResponse);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        } as ApiResponse);
        return;
      }

      // Check if user already exists
      const userExists = await this.checkUserExists(username, email, nic_no);
      if (userExists) {
        res.status(409).json({
          success: false,
          message: 'User with this username, email, or NIC already exists'
        } as ApiResponse);
        return;
      }

      await this.initConnection();

      // Start transaction
      await this.connection!.beginTransaction();

      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        const userId = uuidv4();

        // Insert guest user (is_guest = 1, no staff record needed)
        await this.connection!.execute(
          `INSERT INTO users (user_id, name, is_guest, email, phone, nic_no, username, password)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, name, 1, email, phone || null, nic_no, username, hashedPassword]
        );

        // Commit transaction
        await this.connection!.commit();

        // Fetch created user details (without sensitive information)
        const [userRows] = await this.connection!.execute<DatabaseUserRow[]>(
          `SELECT user_id, name, email, username, is_guest, phone, created_at
           FROM users
           WHERE user_id = ?`,
          [userId]
        );

        const newUser = userRows[0];

        if (!newUser) {
          throw new Error('Failed to retrieve registered user');
        }

        res.status(201).json({
          success: true,
          message: 'Guest registration successful! You can now log in.',
          data: {
            user_id: newUser.user_id,
            name: newUser.name,
            email: newUser.email,
            username: newUser.username,
            is_guest: newUser.is_guest === 1,
            phone: newUser.phone,
            created_at: newUser.created_at
          }
        } as ApiResponse);

      } catch (error) {
        // Rollback transaction
        await this.connection!.rollback();
        throw error;
      }

    } catch (error) {
      console.error('Error registering guest:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration'
      } as ApiResponse);
    }
  };

  // Update user profile (for logged-in users to update their own profile)
  public updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.user_id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        } as ApiResponse);
        return;
      }

      const {
        name,
        email,
        phone,
        nic_no,
        username
      } = req.body;

      // Validate required fields
      if (!name || !email || !username) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: name, email, username'
        } as ApiResponse);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        } as ApiResponse);
        return;
      }

      await this.initConnection();

      // Check if email or username is already taken by another user
      const [existingUsers] = await this.connection!.execute<RowDataPacket[]>(
        `SELECT user_id FROM users WHERE (email = ? OR username = ?) AND user_id != ?`,
        [email, username, userId]
      );

      if (existingUsers.length > 0) {
        res.status(409).json({
          success: false,
          message: 'Email or username is already taken by another user'
        } as ApiResponse);
        return;
      }

      // Check if NIC is already taken by another user (if provided)
      if (nic_no) {
        const [existingNic] = await this.connection!.execute<RowDataPacket[]>(
          `SELECT user_id FROM users WHERE nic_no = ? AND user_id != ?`,
          [nic_no, userId]
        );

        if (existingNic.length > 0) {
          res.status(409).json({
            success: false,
            message: 'NIC number is already registered to another user'
          } as ApiResponse);
          return;
        }
      }

      // Update user profile
      await this.connection!.execute(
        `UPDATE users 
         SET name = ?, email = ?, phone = ?, username = ?, nic_no = ?
         WHERE user_id = ?`,
        [name, email, phone || null, username, nic_no || null, userId]
      );

      // Fetch updated user data
      const [userRows] = await this.connection!.execute<DatabaseUserRow[]>(
        `SELECT u.user_id, u.name, u.email, u.username, u.phone, u.nic_no, u.is_guest, u.created_at,
                s.role, s.branch_id
         FROM users u
         LEFT JOIN staff s ON u.user_id = s.staff_id
         WHERE u.user_id = ?`,
        [userId]
      );

      const updatedUser = userRows[0];

      if (!updatedUser) {
        throw new Error('Failed to retrieve updated user');
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user_id: updatedUser.user_id,
          name: updatedUser.name,
          email: updatedUser.email,
          username: updatedUser.username,
          phone: updatedUser.phone,
          nic_no: updatedUser.nic_no,
          role: updatedUser.role || UserRole.GUEST,
          branch_id: updatedUser.branch_id,
          is_guest: updatedUser.is_guest === 1,
          created_at: updatedUser.created_at
        }
      } as ApiResponse);

    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating profile'
      } as ApiResponse);
    }
  };

  // Change user password (for logged-in users to change their own password)
  public changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.user_id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        } as ApiResponse);
        return;
      }

      const {
        currentPassword,
        newPassword,
        confirmPassword
      } = req.body;

      // Validate required fields
      if (!currentPassword || !newPassword || !confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: currentPassword, newPassword, confirmPassword'
        } as ApiResponse);
        return;
      }

      // Validate password match
      if (newPassword !== confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'New password and confirmation do not match'
        } as ApiResponse);
        return;
      }

      // Validate password strength
      if (newPassword.length < 8) {
        res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long'
        } as ApiResponse);
        return;
      }

      await this.initConnection();

      // Get current user password
      const [userRows] = await this.connection!.execute<RowDataPacket[]>(
        `SELECT password FROM users WHERE user_id = ?`,
        [userId]
      );

      if (userRows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        } as ApiResponse);
        return;
      }

      const user = userRows[0];
      const currentHashedPassword = user?.password;

      if (!currentHashedPassword) {
        res.status(500).json({
          success: false,
          message: 'User password not found'
        } as ApiResponse);
        return;
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, currentHashedPassword);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        } as ApiResponse);
        return;
      }

      // Hash new password
      const newHashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await this.connection!.execute(
        `UPDATE users SET password = ? WHERE user_id = ?`,
        [newHashedPassword, userId]
      );

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      } as ApiResponse);

    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while changing password'
      } as ApiResponse);
    }
  };
}

export default new UserController();