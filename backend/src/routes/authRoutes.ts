import { Router } from 'express';
import authController from '../controllers/authController';
import { 
  authenticateToken, 
  requireAdmin, 
  requireManager,
  requireStaff,
  optionalAuth 
} from '../middleware/authMiddleware';

const router: Router = Router();

// ==================== Public Routes (No Authentication Required) ====================

/**
 * @route POST /api/auth/login
 * @desc User login with username/email and password
 * @access Public
 */
router.post('/login', authController.login.bind(authController));

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token using refresh token
 * @access Public (but requires valid refresh token)
 */
router.post('/refresh', authController.refreshToken.bind(authController));

// ==================== Protected Routes (Authentication Required) ====================

/**
 * @route POST /api/auth/logout
 * @desc Logout user and invalidate tokens
 * @access Private
 */
router.post('/logout', authenticateToken, authController.logout.bind(authController));

/**
 * @route GET /api/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', authenticateToken, authController.getProfile.bind(authController));

/**
 * @route GET /api/auth/me
 * @desc Alternative endpoint to get current user profile
 * @access Private
 */
router.get('/me', authenticateToken, authController.getProfile.bind(authController));

// ==================== Role-Based Protected Routes ====================

/**
 * @route GET /api/auth/admin-only
 * @desc Test endpoint for admin-only access
 * @access Private (Admin only)
 */
router.get('/admin-only', authenticateToken, requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome Admin! This is an admin-only endpoint.',
    data: {
      user: (req as any).user?.name,
      role: (req as any).user?.role
    }
  });
});

/**
 * @route GET /api/auth/manager-access
 * @desc Test endpoint for manager-level access and above
 * @access Private (Manager and Admin)
 */
router.get('/manager-access', authenticateToken, requireManager, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome Manager! This endpoint requires manager-level access.',
    data: {
      user: (req as any).user?.name,
      role: (req as any).user?.role
    }
  });
});

/**
 * @route GET /api/auth/staff-only
 * @desc Test endpoint for staff-only access (excludes guests)
 * @access Private (Staff only - ADMIN, MANAGER, RECEPTIONIST, HOUSEKEEPING)
 */
router.get('/staff-only', authenticateToken, requireStaff, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome Staff Member! This is a staff-only endpoint.',
    data: {
      user: (req as any).user?.name,
      role: (req as any).user?.role,
      branch_id: (req as any).user?.branch_id
    }
  });
});

/**
 * @route GET /api/auth/verify
 * @desc Verify if current token is valid
 * @access Private
 */
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: {
        user_id: (req as any).user?.user_id,
        name: (req as any).user?.name,
        username: (req as any).user?.username,
        email: (req as any).user?.email,
        role: (req as any).user?.role,
        branch_id: (req as any).user?.branch_id,
        is_guest: (req as any).user?.is_guest
      },
      session_id: (req as any).session_id
    }
  });
});

// ==================== Health Check Route ====================

/**
 * @route GET /api/auth/health
 * @desc Health check for auth service
 * @access Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is running',
    timestamp: new Date().toISOString(),
    service: 'Authentication API'
  });
});

export default router;