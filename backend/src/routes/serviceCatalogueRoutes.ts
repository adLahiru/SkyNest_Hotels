import express, { Router } from 'express';
import { 
  createService, 
  getServices, 
  getServiceById, 
  updateService, 
  deleteService,
  getServiceCategories
} from '../controllers/serviceCatalogueController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireMinimumRole } from '../middleware/userManagementMiddleware';
import { UserRole } from '../types/auth.types';

const router: Router = express.Router();

/**
 * Service Catalogue Routes
 * Base path: /api/services
 */

// Get all service categories (must be before :service_id routes)
// GET /api/services/categories/list
router.get('/categories/list', authenticateToken, getServiceCategories);

// Create a new service (admin only)
// POST /api/services
router.post('/', authenticateToken, requireMinimumRole(UserRole.ADMIN), createService);

// Get all services (authenticated users)
// GET /api/services
router.get('/', authenticateToken, getServices);

// Get service by ID (authenticated users)
// GET /api/services/:service_id
router.get('/:service_id', authenticateToken, getServiceById);

// Update service (admin only)
// PUT /api/services/:service_id
router.put('/:service_id', authenticateToken, requireMinimumRole(UserRole.ADMIN), updateService);

// Delete service (admin only)
// DELETE /api/services/:service_id
router.delete('/:service_id', authenticateToken, requireMinimumRole(UserRole.ADMIN), deleteService);

export default router;
