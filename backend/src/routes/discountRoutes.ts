import express, { Router } from 'express';
import { 
  createDiscount, 
  getDiscounts, 
  getDiscountById, 
  updateDiscount, 
  deleteDiscount,
  getActiveDiscountsByCategory
} from '../controllers/discountController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireMinimumRole } from '../middleware/userManagementMiddleware';
import { UserRole } from '../types/auth.types';

const router: Router = express.Router();

/**
 * Discount Routes
 * Base path: /api/discounts
 */

// Get active discounts by category (must be before :discount_id routes)
// GET /api/discounts/active/:category
router.get('/active/:category', authenticateToken, getActiveDiscountsByCategory);

// Create a new discount (admin only)
// POST /api/discounts
router.post('/', authenticateToken, requireMinimumRole(UserRole.ADMIN), createDiscount);

// Get all discounts (authenticated users)
// GET /api/discounts
router.get('/', authenticateToken, getDiscounts);

// Get discount by ID (authenticated users)
// GET /api/discounts/:discount_id
router.get('/:discount_id', authenticateToken, getDiscountById);

// Update discount (admin only)
// PUT /api/discounts/:discount_id
router.put('/:discount_id', authenticateToken, requireMinimumRole(UserRole.ADMIN), updateDiscount);

// Delete discount (admin only)
// DELETE /api/discounts/:discount_id
router.delete('/:discount_id', authenticateToken, requireMinimumRole(UserRole.ADMIN), deleteDiscount);

export default router;
