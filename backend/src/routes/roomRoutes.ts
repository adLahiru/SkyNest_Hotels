import express, { Router } from 'express';
import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getAvailableRooms
} from '../controllers/roomController';
import { authenticateToken } from '../middleware/authMiddleware';

const router: Router = express.Router();

/**
 * Room Routes
 * All routes require authentication
 * 
 * Access Control:
 * - Admin: Full access to all branches
 * - Manager: Can only manage rooms in their own branch
 * - Receptionist/Housekeeping/Guest: Read-only access
 */

// Get available rooms (public for authenticated users)
router.get('/available', authenticateToken, getAvailableRooms);

// Get all rooms with optional filters
router.get('/', authenticateToken, getRooms);

// Get specific room by ID
router.get('/:room_id', authenticateToken, getRoomById);

// Create new room (Admin or Manager)
router.post('/', authenticateToken, createRoom);

// Update room (Admin or Manager)
router.put('/:room_id', authenticateToken, updateRoom);

// Delete room (Admin or Manager)
router.delete('/:room_id', authenticateToken, deleteRoom);

export default router;
