import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole, ApiResponse, RoleHierarchy } from '../types/auth.types';

// Middleware to check if user can manage other users
export const canManageUsers = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const userRole = req.user?.role;

    if (!userRole) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
      return;
    }

    // Only admins and managers can manage users
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions to manage users'
      } as ApiResponse);
      return;
    }

    next();
  } catch (error) {
    console.error('Error in canManageUsers middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

// Middleware to check if user can manage branches (admin only)
export const canManageBranches = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const userRole = req.user?.role;

    if (!userRole) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
      return;
    }

    // Only admins can manage branches
    if (userRole !== UserRole.ADMIN) {
      res.status(403).json({
        success: false,
        message: 'Only administrators can manage branches'
      } as ApiResponse);
      return;
    }

    next();
  } catch (error) {
    console.error('Error in canManageBranches middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

// Middleware to validate role hierarchy for user creation
export const validateRoleCreation = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const creatorRole = req.user?.role;
    const { role: targetRole } = req.body;

    if (!creatorRole || !targetRole) {
      res.status(400).json({
        success: false,
        message: 'Missing creator role or target role'
      } as ApiResponse);
      return;
    }

    // Validate target role is a valid UserRole
    if (!Object.values(UserRole).includes(targetRole)) {
      res.status(400).json({
        success: false,
        message: 'Invalid target role specified'
      } as ApiResponse);
      return;
    }

    // Validate if creator can create the target role
    const creatorLevel = RoleHierarchy[creatorRole];
    const targetLevel = RoleHierarchy[targetRole as UserRole];

    // Admins can create any role
    if (creatorRole === UserRole.ADMIN) {
      next();
      return;
    }

    // Managers can only create RECEPTIONIST and HOUSEKEEPING
    if (creatorRole === UserRole.MANAGER) {
      if (targetRole === UserRole.RECEPTIONIST || targetRole === UserRole.HOUSEKEEPING) {
        next();
        return;
      }
    }

    // If we reach here, the role creation is not allowed
    res.status(403).json({
      success: false,
      message: `${creatorRole}s cannot create ${targetRole} roles`
    } as ApiResponse);

  } catch (error) {
    console.error('Error in validateRoleCreation middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

// Middleware to validate branch access for managers
export const validateBranchAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const userRole = req.user?.role;
    const userBranchId = req.user?.branch_id;
    const { branch_id: targetBranchId } = req.body;

    // Admins can access any branch
    if (userRole === UserRole.ADMIN) {
      next();
      return;
    }

    // For managers, validate branch access
    if (userRole === UserRole.MANAGER) {
      if (!targetBranchId) {
        res.status(400).json({
          success: false,
          message: 'Branch ID is required for user creation'
        } as ApiResponse);
        return;
      }

      if (userBranchId !== targetBranchId) {
        res.status(403).json({
          success: false,
          message: 'Cannot create users in branches you do not manage'
        } as ApiResponse);
        return;
      }

      next();
      return;
    }

    // Other roles cannot create users
    res.status(403).json({
      success: false,
      message: 'Insufficient permissions to create users'
    } as ApiResponse);

  } catch (error) {
    console.error('Error in validateBranchAccess middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

// Middleware to validate user access (for viewing user profiles)
export const validateUserAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const userRole = req.user?.role;
    const currentUserId = req.user?.user_id;
    const currentUserBranchId = req.user?.branch_id;
    const { userId: targetUserId } = req.params;

    if (!userRole || !currentUserId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
      return;
    }

    // Admins can access any user
    if (userRole === UserRole.ADMIN) {
      next();
      return;
    }

    // Users can always access their own profile
    if (currentUserId === targetUserId) {
      next();
      return;
    }

    // Managers can access users in their branch (will be validated at controller level)
    if (userRole === UserRole.MANAGER && currentUserBranchId) {
      next();
      return;
    }

    // Other roles cannot access other user profiles
    res.status(403).json({
      success: false,
      message: 'Insufficient permissions to access this user profile'
    } as ApiResponse);

  } catch (error) {
    console.error('Error in validateUserAccess middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

// Middleware to require minimum role level
export const requireMinimumRole = (minimumRole: UserRole) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        } as ApiResponse);
        return;
      }

      const userLevel = RoleHierarchy[userRole];
      const requiredLevel = RoleHierarchy[minimumRole];

      if (userLevel < requiredLevel) {
        res.status(403).json({
          success: false,
          message: `Minimum role required: ${minimumRole}`
        } as ApiResponse);
        return;
      }

      next();
    } catch (error) {
      console.error('Error in requireMinimumRole middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  };
};

export default {
  canManageUsers,
  canManageBranches,
  validateRoleCreation,
  validateBranchAccess,
  validateUserAccess,
  requireMinimumRole
};