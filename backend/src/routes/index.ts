import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import branchRoutes from './branchRoutes';

const router: Router = Router();

// Mount authentication routes
router.use('/auth', authRoutes);

// Mount user management routes
router.use('/users', userRoutes);

// Mount branch management routes
router.use('/branches', branchRoutes);

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
      branches: 'Available at /api/branches'
    }
  });
});

export default router;