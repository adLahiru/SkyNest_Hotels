import { Router } from 'express';
import userController from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
  canManageUsers, 
  validateRoleCreation, 
  validateBranchAccess, 
  validateUserAccess,
  requireMinimumRole
} from '../middleware/userManagementMiddleware';
import { UserRole } from '../types/auth.types';

const router: Router = Router();

// Public guest registration (no authentication required)
// POST /api/users/register
// Accessible by: Anyone (public endpoint)
router.post('/register', userController.registerGuest);

// Create a new user
// POST /api/users
// Accessible by: ADMIN (can create any role), MANAGER (can create RECEPTIONIST and HOUSEKEEPING in their branch)
router.post(
  '/',
  authenticateToken,
  canManageUsers,
  validateRoleCreation,
  validateBranchAccess,
  userController.createUser
);

// Get all users (with role-based filtering)
// GET /api/users
// Accessible by: ADMIN (all users), MANAGER (users in their branch + guests)
router.get(
  '/',
  authenticateToken,
  requireMinimumRole(UserRole.MANAGER),
  userController.getUsers
);

// Get user by ID
// GET /api/users/:userId
// Accessible by: ADMIN (any user), MANAGER (users in their branch + guests), Users (their own profile)
router.get(
  '/:userId',
  authenticateToken,
  validateUserAccess,
  userController.getUserById
);

// Update user profile (for logged-in users to update their own profile)
// PUT /api/users/profile
// Accessible by: Any authenticated user (can only update their own profile)
router.put(
  '/profile',
  authenticateToken,
  userController.updateProfile
);

// Change user password
// PUT /api/users/password
// Accessible by: Any authenticated user (can only change their own password)
router.put(
  '/password',
  authenticateToken,
  userController.changePassword
);

// Update user by ID (Admin/Manager only)
// PUT /api/users/:userId
// Accessible by: ADMIN (any user), MANAGER (users in their branch)
router.put(
  '/:userId',
  authenticateToken,
  canManageUsers,
  userController.updateUser
);

// Delete user by ID (Admin only)
// DELETE /api/users/:userId
// Accessible by: ADMIN only
router.delete(
  '/:userId',
  authenticateToken,
  canManageUsers,
  userController.deleteUser
);

export default router;