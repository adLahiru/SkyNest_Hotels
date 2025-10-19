import express, { Router } from 'express';
import { 
  addServiceToBooking,
  getBookingServices
} from '../controllers/serviceCatalogueController';
import { authenticateToken } from '../middleware/authMiddleware';

const router: Router = express.Router();

/**
 * Service Usage Routes
 * Base path: /api/service-usage
 * 
 * Access Control:
 * - Staff (Manager/Receptionist): Can add services to bookings in their branch
 * - All authenticated users: Can view services for their bookings
 */

// Add service to a booking
// POST /api/service-usage
router.post('/', authenticateToken, addServiceToBooking);

// Get all services for a specific booking
// GET /api/service-usage/booking/:booking_id
router.get('/booking/:booking_id', authenticateToken, getBookingServices);

export default router;
