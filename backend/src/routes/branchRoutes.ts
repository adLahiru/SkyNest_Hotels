import { Router } from 'express';
import branchController from '../controllers/branchController';
import { authenticateToken } from '../middleware/authMiddleware';
import { canManageBranches, requireMinimumRole } from '../middleware/userManagementMiddleware';
import { UserRole } from '../types/auth.types';

const router: Router = Router();

// Get all branches (public access)
// GET /api/branches/public
router.get('/public', branchController.getBranches);

// Create a new branch
// POST /api/branches
// Accessible by: ADMIN only
router.post(
  '/',
  authenticateToken,
  canManageBranches,
  branchController.createBranch
);

// Get all branches
// GET /api/branches
// Accessible by: MANAGER and above (managers can see all branches but can only manage their own)
router.get(
  '/',
  authenticateToken,
  requireMinimumRole(UserRole.MANAGER),
  branchController.getBranches
);

// Get branch by ID
// GET /api/branches/:branchId
// Accessible by: MANAGER and above
router.get(
  '/:branchId',
  authenticateToken,
  requireMinimumRole(UserRole.MANAGER),
  branchController.getBranchById
);

// Update branch
// PUT /api/branches/:branchId
// Accessible by: ADMIN only
router.put(
  '/:branchId',
  authenticateToken,
  canManageBranches,
  branchController.updateBranch
);

// Delete branch
// DELETE /api/branches/:branchId
// Accessible by: ADMIN only
router.delete(
  '/:branchId',
  authenticateToken,
  canManageBranches,
  branchController.deleteBranch
);

export default router;