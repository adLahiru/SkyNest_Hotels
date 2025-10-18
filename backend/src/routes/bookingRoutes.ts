import express, { Router } from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  getMyBookings,
  checkInGuest,
  checkOutGuest,
  validateCheckout
} from '../controllers/bookingController';
import { authenticateToken } from '../middleware/authMiddleware';

const router: Router = express.Router();

/**
 * Booking Routes
 * All routes require authentication
 * 
 * Access Control:
 * - All authenticated users: Can create bookings for themselves
 * - Users: Can view and manage their own bookings
 * - Staff (Manager/Receptionist): Can view and manage bookings in their branch
 * - Admin: Full access to all bookings
 */

// Get my bookings (user's own bookings)
router.get('/my-bookings', authenticateToken, getMyBookings);

// Get all bookings (access-controlled)
router.get('/', authenticateToken, getBookings);

// Get specific booking by ID
router.get('/:booking_id', authenticateToken, getBookingById);

// Create new booking (all authenticated users)
router.post('/', authenticateToken, (req: any, res, next) => {
  console.log('=== BOOKING ROUTE HIT ===');
  console.log('Body:', req.body);
  console.log('User:', req.user);
  next();
}, createBooking);

// Update booking (access-controlled)
router.put('/:booking_id', authenticateToken, updateBooking);

// Cancel booking (access-controlled)
router.delete('/:booking_id', authenticateToken, cancelBooking);

// Check-in guest (staff only)
router.patch('/:booking_id/checkin', authenticateToken, checkInGuest);

// Validate checkout eligibility
router.get('/:booking_id/checkout-validation', authenticateToken, validateCheckout);

// Check-out guest (staff only)
router.patch('/:booking_id/checkout', authenticateToken, checkOutGuest);

export default router;
