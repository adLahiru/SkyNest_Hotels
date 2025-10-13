import { Router } from 'express';
import roomTypeController from '../controllers/roomTypeController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireMinimumRole } from '../middleware/userManagementMiddleware';
import { UserRole } from '../types/auth.types';

const router: Router = Router();

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