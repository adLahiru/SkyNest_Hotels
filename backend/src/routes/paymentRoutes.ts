import express, { Router } from 'express';
import {
  generateBill,
  getBillDetails,
  processPayment,
  getPaymentHistory,
  getOutstandingBalances,
  getPaymentStatistics
} from '../controllers/paymentController';
import { authenticateToken } from '../middleware/authMiddleware';

const router: Router = express.Router();

/**
 * Payment Routes
 * All routes require authentication
 * 
 * Access Control:
 * - Staff (Manager/Receptionist): Can process payments in their branch
 * - Admin: Full access to all payments
 */

// Generate bill for a booking
router.post('/generate-bill', authenticateToken, generateBill);

// Get detailed bill for a booking
router.get('/bill/:bookingId', authenticateToken, getBillDetails);

// Process a payment (full or partial)
router.post('/process', authenticateToken, processPayment);

// Get payment history for a booking
router.get('/history/:bookingId', authenticateToken, getPaymentHistory);

// Get all bookings with outstanding balances
router.get('/outstanding', authenticateToken, getOutstandingBalances);

// Get payment statistics
router.get('/statistics', authenticateToken, getPaymentStatistics);

export default router;
