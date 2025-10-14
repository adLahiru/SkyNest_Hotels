import { Router } from 'express';
import dashboardController from '../controllers/dashboardController';
import { 
  authenticateToken, 
  requireAdmin, 
  requireManager,
  requireStaff 
} from '../middleware/authMiddleware';

const router: Router = Router();

/**
 * @route GET /api/dashboard/admin
 * @desc Get admin dashboard statistics
 * @access Private (Admin only)
 */
router.get('/admin', authenticateToken, requireAdmin, dashboardController.getAdminStats.bind(dashboardController));

/**
 * @route GET /api/dashboard/manager
 * @desc Get manager dashboard statistics for their branch
 * @access Private (Manager only)
 */
router.get('/manager', authenticateToken, requireManager, dashboardController.getManagerStats.bind(dashboardController));

/**
 * @route GET /api/dashboard/receptionist
 * @desc Get receptionist dashboard statistics for their branch
 * @access Private (Staff only - Receptionist, Manager, Admin)
 */
router.get('/receptionist', authenticateToken, requireStaff, dashboardController.getReceptionistStats.bind(dashboardController));

export default router;
