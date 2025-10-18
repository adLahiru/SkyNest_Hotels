import { Router } from 'express';
import roomTypeController from '../controllers/roomTypeController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireMinimumRole } from '../middleware/userManagementMiddleware';
import { UserRole } from '../types/auth.types';

const router: Router = Router();

// Public: Get all room types without authentication (for homepage display)
// GET /api/room-types/public
router.get('/public', roomTypeController.getRoomTypes);

// Public: Get room types for a specific branch that are available
// GET /api/room-types/public/branch/:branchId
router.get('/public/branch/:branchId', roomTypeController.getRoomTypesByBranch);

// Create a new room type
// POST /api/room-types
// Accessible by: ADMIN only
router.post(
  '/',
  authenticateToken,
  requireMinimumRole(UserRole.ADMIN),
  roomTypeController.createRoomType
);

// Get all room types
// GET /api/room-types
// Accessible by: All authenticated users (to view available room types)
router.get(
  '/',
  authenticateToken,
  roomTypeController.getRoomTypes
);

// Authenticated: Get room types by branch (available only)
// GET /api/room-types/branch/:branchId
router.get(
  '/branch/:branchId',
  authenticateToken,
  roomTypeController.getRoomTypesByBranch
);

// Get room type by ID
// GET /api/room-types/:roomTypeId
// Accessible by: All authenticated users
router.get(
  '/:roomTypeId',
  authenticateToken,
  roomTypeController.getRoomTypeById
);

// Update room type
// PUT /api/room-types/:roomTypeId
// Accessible by: ADMIN only
router.put(
  '/:roomTypeId',
  authenticateToken,
  requireMinimumRole(UserRole.ADMIN),
  roomTypeController.updateRoomType
);

// Delete room type
// DELETE /api/room-types/:roomTypeId
// Accessible by: ADMIN only
router.delete(
  '/:roomTypeId',
  authenticateToken,
  requireMinimumRole(UserRole.ADMIN),
  roomTypeController.deleteRoomType
);

export default router;