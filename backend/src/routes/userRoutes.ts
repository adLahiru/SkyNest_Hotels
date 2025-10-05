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

export default router;