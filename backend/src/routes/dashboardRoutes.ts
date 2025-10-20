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

/**
 * @route GET /api/dashboard/housekeeping
 * @desc Get housekeeping dashboard statistics for their branch
 * @access Private (Staff only - Housekeeping, Manager, Admin)
 */
router.get('/housekeeping', authenticateToken, requireStaff, dashboardController.getHousekeepingStats.bind(dashboardController));

/**
 * @route GET /api/dashboard/reports/room-occupancy
 * @desc Get room occupancy report for a selected date range
 * @access Private (Admin only)
 */
router.get('/reports/room-occupancy', authenticateToken, requireAdmin, dashboardController.getRoomOccupancyReport.bind(dashboardController));

/**
 * @route GET /api/dashboard/reports/guest-billing
 * @desc Get guest billing summary with unpaid balances
 * @access Private (Admin and Manager)
 */
router.get('/reports/guest-billing', authenticateToken, requireStaff, dashboardController.getGuestBillingSummary.bind(dashboardController));

/**
 * @route GET /api/dashboard/reports/service-usage
 * @desc Get service usage breakdown report
 * @access Private (Admin and Manager)
 */
router.get('/reports/service-usage', authenticateToken, requireStaff, dashboardController.getServiceUsageBreakdown.bind(dashboardController));

/**
 * @route GET /api/dashboard/reports/monthly-revenue
 * @desc Get monthly revenue per branch report
 * @access Private (Admin and Manager)
 */
router.get('/reports/monthly-revenue', authenticateToken, requireStaff, dashboardController.getMonthlyRevenuePerBranch.bind(dashboardController));

/**
 * @route GET /api/dashboard/reports/top-services
 * @desc Get top-used services and customer preference trends
 * @access Private (Admin and Manager)
 */
router.get('/reports/top-services', authenticateToken, requireStaff, dashboardController.getTopUsedServices.bind(dashboardController));

export default router;
