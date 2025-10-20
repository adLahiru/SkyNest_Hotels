import express, { Router } from 'express';
import {
  submitContactForm,
  getAllContactMessages,
  getContactMessageById,
  updateContactStatus,
  deleteContactMessage
} from '../controllers/contactController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireMinimumRole } from '../middleware/userManagementMiddleware';
import { UserRole } from '../types/auth.types';

const router: Router = express.Router();

/**
 * Public route - Anyone can submit contact form
 * POST /api/contact
 */
router.post('/', submitContactForm);

/**
 * Admin routes - Protected
 */
router.get('/', authenticateToken, requireMinimumRole(UserRole.ADMIN), getAllContactMessages);
router.get('/:contact_id', authenticateToken, requireMinimumRole(UserRole.ADMIN), getContactMessageById);
router.patch('/:contact_id/status', authenticateToken, requireMinimumRole(UserRole.ADMIN), updateContactStatus);
router.delete('/:contact_id', authenticateToken, requireMinimumRole(UserRole.ADMIN), deleteContactMessage);

export default router;
