import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import branchRoutes from './branchRoutes';
import roomTypeRoutes from './roomTypeRoutes';
import serviceCatalogueRoutes from './serviceCatalogueRoutes';
import discountRoutes from './discountRoutes';
import roomRoutes from './roomRoutes';
import bookingRoutes from './bookingRoutes';
import dashboardRoutes from './dashboardRoutes';
import paymentRoutes from './paymentRoutes';

const router: Router = Router();

// Mount authentication routes
router.use('/auth', authRoutes);

// Mount user management routes
router.use('/users', userRoutes);

// Mount branch management routes
router.use('/branches', branchRoutes);

// Mount room type management routes
router.use('/room-types', roomTypeRoutes);

// Mount room management routes
router.use('/rooms', roomRoutes);

// Mount booking routes
router.use('/bookings', bookingRoutes);

// Mount service catalogue routes
router.use('/services', serviceCatalogueRoutes);

// Mount discount routes
router.use('/discounts', discountRoutes);

// Mount dashboard routes
router.use('/dashboard', dashboardRoutes);

// Mount payment routes
router.use('/payments', paymentRoutes);

// Health check for the entire API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SkyNest Hotels API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      auth: 'Available at /api/auth',
      users: 'Available at /api/users',
      branches: 'Available at /api/branches',
      roomTypes: 'Available at /api/room-types',
      rooms: 'Available at /api/rooms',
      bookings: 'Available at /api/bookings',
      services: 'Available at /api/services',
      discounts: 'Available at /api/discounts',
      dashboard: 'Available at /api/dashboard',
      payments: 'Available at /api/payments'
    }
  });
});

export default router;