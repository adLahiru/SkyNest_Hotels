import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2/promise';
import { db } from '../config/db';
import { AuthenticatedRequest, UserRole, ApiResponse } from '../types/auth.types';

// Interface for branch creation request
interface CreateBranchRequest {
  branch_name: string;
  address: string;
  email?: string;
  phone?: string;
  manager_id?: string;
  photo?: string; // Base64 encoded image string
}

// Interface for branch update request
interface UpdateBranchRequest {
  branch_name?: string;
  address?: string;
  email?: string;
  phone?: string;
  manager_id?: string;
  photo?: string; // Base64 encoded image string
}

// Interface for database branch row
interface DatabaseBranchRow extends RowDataPacket {
  branch_id: string;
  branch_name: string;
  address: string;
  email?: string;
  phone?: string;
  manager_id?: string;
  photo?: Buffer; // BLOB data from database
  created_at: Date;
  updated_at: Date;
  manager_name?: string;
  manager_username?: string;
}

export class BranchController {
  // Validate if user is admin
  private validateAdminAccess(req: AuthenticatedRequest, res: Response): boolean {
    if (req.user?.role !== UserRole.ADMIN) {
      res.status(403).json({
        success: false,
        message: 'Only administrators can perform this action'
      } as ApiResponse);
      return false;
    }
    return true;
  }

  // Validate manager exists and has manager role
  private async validateManager(managerId: string): Promise<boolean> {
    try {
      const connection = await db.getConnection();

      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT u.user_id, s.role 
         FROM users u 
         INNER JOIN staff s ON u.user_id = s.staff_id 
         WHERE u.user_id = ? AND s.role = ?`,
        [managerId, UserRole.MANAGER]
      );

      connection.release();
      return rows.length > 0;
    } catch (error) {
      console.error('Error validating manager:', error);
      return false;
    }
  }

  // Create a new branch
  public createBranch = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Validate admin access
      if (!this.validateAdminAccess(req, res)) {
        return;
      }

      const {
        branch_name,
        address,
        email,
        phone,
        manager_id,
        photo
      } = req.body as CreateBranchRequest;

      // Validate required fields
      if (!branch_name || !address) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: branch_name, address'
        } as ApiResponse);
        return;
      }

      // Convert Base64 photo to Buffer if provided
      let photoBuffer: Buffer | null = null;
      if (photo && photo.trim() !== '') {
        try {
          // Remove data:image/...;base64, prefix if present
          const base64Data = photo.replace(/^data:image\/\w+;base64,/, '');
          photoBuffer = Buffer.from(base64Data, 'base64');
        } catch (error) {
          res.status(400).json({
            success: false,
            message: 'Invalid photo format'
          } as ApiResponse);
          return;
        }
      }

      // Validate manager if provided
      if (manager_id) {
        const isValidManager = await this.validateManager(manager_id);
        if (!isValidManager) {
          res.status(400).json({
            success: false,
            message: 'Invalid manager ID or user is not a manager'
          } as ApiResponse);
          return;
        }
      }

      const connection = await db.getConnection();

      try {
        // Check if branch name already exists
        const [existingBranch] = await connection.execute<RowDataPacket[]>(
          `SELECT branch_id FROM hotel_branches WHERE branch_name = ?`,
          [branch_name]
        );

        if (existingBranch.length > 0) {
          res.status(409).json({
            success: false,
            message: 'Branch with this name already exists'
          } as ApiResponse);
          return;
        }

        // Create branch
        const branchId = uuidv4();
        await connection.execute(
          `INSERT INTO hotel_branches (branch_id, branch_name, address, email, phone, manager_id, photo)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [branchId, branch_name, address, email || null, phone || null, manager_id || null, photoBuffer]
        );

        // If manager is assigned, update staff table branch_id
        if (manager_id) {
          await connection.execute(
            `UPDATE staff SET branch_id = ? WHERE staff_id = ?`,
            [branchId, manager_id]
          );
        }

        // Fetch created branch with manager details
        const [branchRows] = await connection.execute<DatabaseBranchRow[]>(
          `SELECT hb.branch_id, hb.branch_name, hb.address, hb.email, hb.phone, 
                  hb.manager_id, hb.photo, hb.created_at, hb.updated_at,
                  u.name as manager_name, u.username as manager_username
           FROM hotel_branches hb
           LEFT JOIN users u ON hb.manager_id = u.user_id
           WHERE hb.branch_id = ?`,
          [branchId]
        );

        const newBranch = branchRows[0];

        if (!newBranch) {
          throw new Error('Failed to retrieve created branch');
        }

        // Convert photo Buffer to Base64 for response
        const photoBase64 = newBranch.photo 
          ? `data:image/jpeg;base64,${newBranch.photo.toString('base64')}`
          : null;

        res.status(201).json({
          success: true,
          message: 'Branch created successfully',
          data: {
            branch_id: newBranch.branch_id,
            branch_name: newBranch.branch_name,
            address: newBranch.address,
            email: newBranch.email,
            phone: newBranch.phone,
            manager_id: newBranch.manager_id,
            manager_name: newBranch.manager_name,
            manager_username: newBranch.manager_username,
            photo: photoBase64,
            created_at: newBranch.created_at,
            updated_at: newBranch.updated_at
          }
        } as ApiResponse);

      } finally {
        connection.release();
      }

    } catch (error) {
      console.error('Error creating branch:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating branch'
      } as ApiResponse);
    }
  };

  // Get all branches
  public getBranches = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('Attempting to get database connection...');
      const connection = await db.getConnection();
      console.log('Database connection obtained successfully');

      try {
        console.log('Executing query to fetch branches...');
        const [rows] = await connection.execute<DatabaseBranchRow[]>(
          `SELECT hb.branch_id, hb.branch_name, hb.address, hb.email, hb.phone, 
                  hb.manager_id, hb.photo, hb.created_at, hb.updated_at,
                  u.name as manager_name, u.username as manager_username
           FROM hotel_branches hb
           LEFT JOIN users u ON hb.manager_id = u.user_id
           ORDER BY hb.created_at DESC`
        );

        console.log('Query executed successfully, processing results...');
        const branches = rows.map(branch => ({
          branch_id: branch.branch_id,
          branch_name: branch.branch_name,
          address: branch.address,
          email: branch.email,
          phone: branch.phone,
          manager_id: branch.manager_id,
          created_at: branch.created_at,
          updated_at: branch.updated_at
        }));

        res.status(200).json({
          success: true,
          message: 'Branches retrieved successfully',
          data: branches
        } as ApiResponse);

      } finally {
        connection.release();
      }

    } catch (error) {
      console.error('Error retrieving branches:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving branches',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  // Get branch by ID
  public getBranchById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { branchId } = req.params;

      if (!branchId) {
        res.status(400).json({
          success: false,
          message: 'Branch ID is required'
        } as ApiResponse);
        return;
      }

      const connection = await db.getConnection();

      try {
        const [rows] = await connection.execute<DatabaseBranchRow[]>(
          `SELECT hb.branch_id, hb.branch_name, hb.address, hb.email, hb.phone, 
                  hb.manager_id, hb.photo, hb.created_at, hb.updated_at,
                  u.name as manager_name, u.username as manager_username
           FROM hotel_branches hb
           LEFT JOIN users u ON hb.manager_id = u.user_id
           WHERE hb.branch_id = ?`,
          [branchId]
        );

        const branch = rows[0];

        if (!branch) {
          res.status(404).json({
            success: false,
            message: 'Branch not found'
          } as ApiResponse);
          return;
        }

        res.status(200).json({
          success: true,
          message: 'Branch retrieved successfully',
          data: {
            branch_id: branch.branch_id,
            branch_name: branch.branch_name,
            address: branch.address,
            email: branch.email,
            phone: branch.phone,
            manager_id: branch.manager_id,
            manager_name: branch.manager_name,
            manager_username: branch.manager_username,
            photo: branch.photo 
              ? `data:image/jpeg;base64,${branch.photo.toString('base64')}`
              : null,
            created_at: branch.created_at,
            updated_at: branch.updated_at
          }
        } as ApiResponse);

      } finally {
        connection.release();
      }

    } catch (error) {
      console.error('Error retrieving branch:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving branch'
      } as ApiResponse);
    }
  };

  // Update branch
  public updateBranch = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Validate admin access
      if (!this.validateAdminAccess(req, res)) {
        return;
      }

      const { branchId } = req.params;
      const {
        branch_name,
        address,
        email,
        phone,
        manager_id,
        photo
      } = req.body as UpdateBranchRequest;

      if (!branchId) {
        res.status(400).json({
          success: false,
          message: 'Branch ID is required'
        } as ApiResponse);
        return;
      }

      // Convert Base64 photo to Buffer if provided
      let photoBuffer: Buffer | null = null;
      if (photo !== undefined) {
        if (photo && photo.trim() !== '') {
          try {
            // Remove data:image/...;base64, prefix if present
            const base64Data = photo.replace(/^data:image\/\w+;base64,/, '');
            photoBuffer = Buffer.from(base64Data, 'base64');
          } catch (error) {
            res.status(400).json({
              success: false,
              message: 'Invalid photo format'
            } as ApiResponse);
            return;
          }
        }
      }

      // Validate manager if provided
      if (manager_id) {
        const isValidManager = await this.validateManager(manager_id);
        if (!isValidManager) {
          res.status(400).json({
            success: false,
            message: 'Invalid manager ID or user is not a manager'
          } as ApiResponse);
          return;
        }
      }

      const connection = await db.getConnection();

      try {
        // Check if branch exists
        const [existingBranch] = await connection.execute<RowDataPacket[]>(
          `SELECT branch_id, manager_id FROM hotel_branches WHERE branch_id = ?`,
          [branchId]
        );

        if (existingBranch.length === 0) {
          res.status(404).json({
            success: false,
            message: 'Branch not found'
          } as ApiResponse);
          return;
        }

        const currentManagerId = existingBranch[0]?.manager_id;

        // Build dynamic update query
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (branch_name !== undefined) {
          updateFields.push('branch_name = ?');
          updateValues.push(branch_name);
        }
        if (address !== undefined) {
          updateFields.push('address = ?');
          updateValues.push(address);
        }
        if (email !== undefined) {
          updateFields.push('email = ?');
          updateValues.push(email);
        }
        if (phone !== undefined) {
          updateFields.push('phone = ?');
          updateValues.push(phone);
        }
        if (manager_id !== undefined) {
          updateFields.push('manager_id = ?');
          updateValues.push(manager_id);
        }
        if (photo !== undefined) {
          updateFields.push('photo = ?');
          updateValues.push(photoBuffer);
        }

        if (updateFields.length === 0) {
          res.status(400).json({
            success: false,
            message: 'No fields to update'
          } as ApiResponse);
          return;
        }

        // Add updated_at and branch_id for WHERE clause
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(branchId);

        // Update branch
        await connection.execute(
          `UPDATE hotel_branches SET ${updateFields.join(', ')} WHERE branch_id = ?`,
          updateValues
        );

        // Handle manager assignment changes
        if (manager_id !== undefined && manager_id !== currentManagerId) {
          // Remove previous manager from branch (if any)
          if (currentManagerId) {
            await connection.execute(
              `UPDATE staff SET branch_id = NULL WHERE staff_id = ?`,
              [currentManagerId]
            );
          }

          // Assign new manager to branch (if any)
          if (manager_id) {
            await connection.execute(
              `UPDATE staff SET branch_id = ? WHERE staff_id = ?`,
              [branchId, manager_id]
            );
          }
        }

        // Fetch updated branch with manager details
        const [branchRows] = await connection.execute<DatabaseBranchRow[]>(
          `SELECT hb.branch_id, hb.branch_name, hb.address, hb.email, hb.phone, 
                  hb.manager_id, hb.photo, hb.created_at, hb.updated_at,
                  u.name as manager_name, u.username as manager_username
           FROM hotel_branches hb
           LEFT JOIN users u ON hb.manager_id = u.user_id
           WHERE hb.branch_id = ?`,
          [branchId]
        );

        const updatedBranch = branchRows[0];

        if (!updatedBranch) {
          throw new Error('Failed to retrieve updated branch');
        }

        res.status(200).json({
          success: true,
          message: 'Branch updated successfully',
          data: {
            branch_id: updatedBranch.branch_id,
            branch_name: updatedBranch.branch_name,
            address: updatedBranch.address,
            email: updatedBranch.email,
            phone: updatedBranch.phone,
            manager_id: updatedBranch.manager_id,
            manager_name: updatedBranch.manager_name,
            manager_username: updatedBranch.manager_username,
            photo: updatedBranch.photo 
              ? `data:image/jpeg;base64,${updatedBranch.photo.toString('base64')}`
              : null,
            created_at: updatedBranch.created_at,
            updated_at: updatedBranch.updated_at
          }
        } as ApiResponse);

      } finally {
        connection.release();
      }

    } catch (error) {
      console.error('Error updating branch:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating branch'
      } as ApiResponse);
    }
  };

  // Delete branch
  public deleteBranch = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Validate admin access
      if (!this.validateAdminAccess(req, res)) {
        return;
      }

      const { branchId } = req.params;

      if (!branchId) {
        res.status(400).json({
          success: false,
          message: 'Branch ID is required'
        } as ApiResponse);
        return;
      }

      const connection = await db.getConnection();

      try {
        // Check if branch exists
        const [existingBranch] = await connection.execute<RowDataPacket[]>(
          `SELECT branch_id, manager_id FROM hotel_branches WHERE branch_id = ?`,
          [branchId]
        );

        if (existingBranch.length === 0) {
          res.status(404).json({
            success: false,
            message: 'Branch not found'
          } as ApiResponse);
          return;
        }

        // Check if branch has active staff (excluding manager)
        const [activeStaff] = await connection.execute<RowDataPacket[]>(
          `SELECT COUNT(*) as staff_count FROM staff WHERE branch_id = ? AND retired_date IS NULL`,
          [branchId]
        );

        const staffCount = activeStaff[0]?.staff_count || 0;

        if (staffCount > 1 || (staffCount === 1 && !existingBranch[0]?.manager_id)) {
          res.status(400).json({
            success: false,
            message: 'Cannot delete branch with active staff. Please reassign or retire staff first.'
          } as ApiResponse);
          return;
        }

        const currentManagerId = existingBranch[0]?.manager_id;

        // Start transaction
        await connection.beginTransaction();

        try {
          // Remove manager assignment if exists
          if (currentManagerId) {
            await connection.execute(
              `UPDATE staff SET branch_id = NULL WHERE staff_id = ?`,
              [currentManagerId]
            );
          }

          // Delete branch
          await connection.execute(
            `DELETE FROM hotel_branches WHERE branch_id = ?`,
            [branchId]
          );

          // Commit transaction
          await connection.commit();

          res.status(200).json({
            success: true,
            message: 'Branch deleted successfully'
          } as ApiResponse);

        } catch (error) {
          // Rollback transaction
          await connection.rollback();
          throw error;
        }

      } finally {
        connection.release();
      }

    } catch (error) {
      console.error('Error deleting branch:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting branch'
      } as ApiResponse);
    }
  };
}

export default new BranchController();