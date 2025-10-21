import { Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { db } from '../config/db';
import { UserRole, AuthenticatedRequest } from '../types/auth.types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { v4: uuidv4 } = require('uuid');

/**
 * Payment Controller
 * Handles payment processing, bill generation, and payment history
 */

interface Payment extends RowDataPacket {
  payment_id: string;
  booking_id: string;
  tax_id: string | null;
  discount_id: string | null;
  payment_date: Date;
  payment_method: string;
  total_charges: number;
  amount_paid: number;
  due_amount: number;
  payment_status: 'pending' | 'paid' | 'partial';
  staff_id: string | null;
  created_at: Date;
}

interface PaymentTransaction extends RowDataPacket {
  transaction_id: string;
  payment_id: string;
  booking_id: string;
  transaction_date: Date;
  amount: number;
  payment_method: string;
  transaction_reference: string | null;
  notes: string | null;
  processed_by_staff_id: string | null;
  created_at: Date;
}

/**
 * Generate bill for a booking
 * POST /api/payments/generate-bill
 */
export const generateBill = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const connection = await db.getConnection();
  
  try {
    const { bookingId, taxId, discountId } = req.body;
    const staffId = req.user?.staff_id || req.user?.user_id;
    
    if (!bookingId) {
      res.status(400).json({ error: 'Booking ID is required' });
      return;
    }
    
    await connection.beginTransaction();
    
    // Check if booking exists and user has access
    const [bookings] = await connection.query<RowDataPacket[]>(
      `SELECT booking_id, user_id, branch_id, booking_status 
       FROM booking 
       WHERE booking_id = ?`,
      [bookingId]
    );
    
    if (bookings.length === 0) {
      await connection.rollback();
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    
    // Calculate bill using stored procedure
    await connection.query(
      `CALL calculate_booking_bill(?, ?, ?, @subtotal, @tax_amount, @discount_amount, @total_charges)`,
      [bookingId, taxId || null, discountId || null]
    );
    
    const [billTotals] = await connection.query<RowDataPacket[]>(
      `SELECT @subtotal as subtotal, 
              @tax_amount as tax_amount, 
              @discount_amount as discount_amount, 
              @total_charges as total_charges`
    );
    
    const totalCharges = parseFloat(billTotals[0]?.total_charges || '0');
    
    // Create or update payment record
    const [existingPayment] = await connection.query<RowDataPacket[]>(
      `SELECT payment_id FROM payments WHERE booking_id = ?`,
      [bookingId]
    );
    
    if (existingPayment.length > 0) {
      // Update existing payment
      await connection.query(
        `UPDATE payments 
         SET total_charges = ?,
             tax_id = ?,
             discount_id = ?,
             due_amount = total_charges - COALESCE(amount_paid, 0),
             staff_id = ?
         WHERE payment_id = ?`,
        [totalCharges, taxId || null, discountId || null, staffId, existingPayment[0]?.payment_id]
      );
    } else {
      // Create new payment record
      await connection.query(
        `INSERT INTO payments (
          payment_id, booking_id, tax_id, discount_id,
          payment_date, total_charges, amount_paid, due_amount,
          payment_status, staff_id
        )
        VALUES (UUID(), ?, ?, ?, CURDATE(), ?, 0.00, ?, 'pending', ?)`,
        [bookingId, taxId || null, discountId || null, totalCharges, totalCharges, staffId]
      );
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Bill generated successfully',
      totalCharges,
      subtotal: parseFloat(billTotals[0]?.subtotal || '0'),
      taxAmount: parseFloat(billTotals[0]?.tax_amount || '0'),
      discountAmount: parseFloat(billTotals[0]?.discount_amount || '0')
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Bill generation error:', error);
    res.status(500).json({ error: 'Failed to generate bill' });
  } finally {
    connection.release();
  }
};

/**
 * Get detailed bill for a booking
 * GET /api/payments/bill/:bookingId
 */
export const getBillDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const { taxId, discountId } = req.query;
    
    // Get booking and room details
    const [roomDetails] = await db.query<RowDataPacket[]>(
      `SELECT 
        b.booking_id,
        b.user_id,
        b.branch_id,
        r.room_no,
        rt.type as room_type,
        rt.daily_rate,
        b.checking_datetime as check_in,
        b.checkout_datetime as check_out,
        GREATEST(1, DATEDIFF(b.checkout_datetime, b.checking_datetime)) as nights,
        u.name,
        u.email
       FROM booking b
       JOIN rooms r ON b.room_id = r.room_id
       JOIN room_types rt ON r.room_type_id = rt.room_type_id
       JOIN users u ON b.user_id = u.user_id
       WHERE b.booking_id = ?`,
      [bookingId]
    );
    
    if (roomDetails.length === 0) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    
    // Get service usage details
    const [services] = await db.query<RowDataPacket[]>(
      `SELECT 
        su.usage_id,
        sc.service_name,
        su.quantity,
        sc.unit_price,
        su.total,
        su.usage_date
       FROM service_usage su
       JOIN service_catalogue sc ON su.service_id = sc.service_id
       WHERE su.booking_id = ?
       ORDER BY su.usage_date`,
      [bookingId]
    );
    
    const roomCharges = (roomDetails[0]?.daily_rate || 0) * (roomDetails[0]?.nights || 0);
    const serviceCharges = services.reduce((sum: number, s: any) => sum + parseFloat(s.total), 0);
    
    // Get payment summary if it exists
    const [paymentSummary] = await db.query<Payment[]>(
      `SELECT * FROM payments WHERE booking_id = ?`,
      [bookingId]
    );
    
    res.json({
      bookingId,
      guestInfo: {
        name: roomDetails[0]?.name || '',
        email: roomDetails[0]?.email || ''
      },
      roomDetails: roomDetails[0],
      roomCharges,
      services,
      serviceCharges,
      payment: paymentSummary.length > 0 ? paymentSummary[0] : null
    });
    
  } catch (error) {
    console.error('Bill details error:', error);
    res.status(500).json({ error: 'Failed to fetch bill details' });
  }
};

/**
 * Process a partial payment
 * POST /api/payments/process
 */
export const processPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const connection = await db.getConnection();
  
  try {
    const { bookingId, amount, paymentMethod, transactionReference, notes } = req.body;
    const staffId = req.user?.staff_id || req.user?.user_id;
    
    // Validate input
    if (!bookingId || !amount || !paymentMethod) {
      res.status(400).json({ error: 'Booking ID, amount, and payment method are required' });
      return;
    }
    
    if (amount <= 0) {
      res.status(400).json({ error: 'Payment amount must be greater than zero' });
      return;
    }
    
    await connection.beginTransaction();
    
    // Call stored procedure to process payment
    await connection.query(
      `CALL process_partial_payment(?, ?, ?, ?, ?, ?, @remaining, @status, @trans_id)`,
      [bookingId, amount, paymentMethod, transactionReference || null, staffId, notes || null]
    );
    
    // Get output parameters
    const [result] = await connection.query<RowDataPacket[]>(
      `SELECT @remaining as remaining_balance, 
              @status as payment_status, 
              @trans_id as transaction_id`
    );
    
    await connection.commit();
    
    const remaining_balance = result[0]?.remaining_balance || 0;
    const payment_status = result[0]?.payment_status || 'pending';
    const transaction_id = result[0]?.transaction_id || '';
    
    res.json({
      success: true,
      message: 'Payment processed successfully',
      transactionId: transaction_id,
      amountPaid: amount,
      remainingBalance: parseFloat(remaining_balance),
      paymentStatus: payment_status,
      isFullyPaid: payment_status === 'paid'
    });
    
  } catch (error: any) {
    await connection.rollback();
    
    // Handle stored procedure errors
    if (error.sqlState === '45000') {
      res.status(400).json({
        error: 'Payment validation failed',
        message: error.sqlMessage
      });
      return;
    }
    
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  } finally {
    connection.release();
  }
};

/**
 * Get payment history for a booking
 * GET /api/payments/history/:bookingId
 */
export const getPaymentHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    
    // Get payment summary
    const [paymentSummary] = await db.query<Payment[]>(
      `SELECT * FROM payments WHERE booking_id = ?`,
      [bookingId]
    );
    
    if (paymentSummary.length === 0) {
      res.status(404).json({ error: 'No payment record found' });
      return;
    }
    
    // Get transaction history
    const [transactions] = await db.query<RowDataPacket[]>(
      `SELECT 
        pt.transaction_id,
        pt.transaction_date,
        pt.amount,
        pt.payment_method,
        pt.transaction_reference,
        pt.notes,
        u.name as processed_by_name
       FROM payment_transactions pt
       LEFT JOIN users u ON pt.processed_by_staff_id = u.user_id
       WHERE pt.booking_id = ?
       ORDER BY pt.transaction_date DESC`,
      [bookingId]
    );
    
    res.json({
      summary: paymentSummary[0],
      transactions: transactions,
      transactionCount: transactions.length
    });
    
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
};

/**
 * Get all bookings with outstanding balances
 * GET /api/payments/outstanding
 */
export const getOutstandingBalances = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { branchId } = req.query;
    const userRole = req.user?.role;
    const userBranchId = req.user?.branch_id;
    
    let query = `
      SELECT 
        b.booking_id,
        b.booking_status,
        b.checking_datetime,
        b.checkout_datetime,
        b.branch_id,
        u.name,
        u.email,
        u.phone,
        r.room_no,
        rt.type as room_type,
        p.total_charges,
        p.amount_paid,
        p.due_amount,
        p.payment_status
      FROM booking b
      JOIN users u ON b.user_id = u.user_id
      JOIN rooms r ON b.room_id = r.room_id
      JOIN room_types rt ON r.room_type_id = rt.room_type_id
      JOIN payments p ON b.booking_id = p.booking_id
      WHERE p.payment_status IN ('pending', 'partial')
        AND b.booking_status IN ('confirmed', 'checked_in')
    `;
    
    const params: any[] = [];
    
    // Apply branch filtering based on role
    if (userRole !== UserRole.ADMIN) {
      query += ` AND b.branch_id = ?`;
      params.push(userBranchId);
    } else if (branchId) {
      query += ` AND b.branch_id = ?`;
      params.push(branchId);
    }
    
    query += ` ORDER BY p.due_amount DESC`;
    
    const [bookings] = await db.query<RowDataPacket[]>(query, params);
    
    // Calculate totals
    const totalOutstanding = bookings.reduce(
      (sum: number, b: any) => sum + parseFloat(b.due_amount), 
      0
    );
    
    res.json({
      bookings,
      count: bookings.length,
      totalOutstanding: totalOutstanding.toFixed(2)
    });
    
  } catch (error) {
    console.error('Outstanding balances error:', error);
    res.status(500).json({ error: 'Failed to fetch outstanding balances' });
  }
};

/**
 * Get payment statistics
 * GET /api/payments/statistics
 */
export const getPaymentStatistics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { branchId, startDate, endDate } = req.query;
    const userRole = req.user?.role;
    const userBranchId = req.user?.branch_id;
    
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    
    // Apply branch filtering
    if (userRole !== UserRole.ADMIN) {
      whereClause += ' AND b.branch_id = ?';
      params.push(userBranchId);
    } else if (branchId) {
      whereClause += ' AND b.branch_id = ?';
      params.push(branchId);
    }
    
    // Apply date filtering
    if (startDate) {
      whereClause += ' AND p.payment_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ' AND p.payment_date <= ?';
      params.push(endDate);
    }
    
    const [stats] = await db.query<RowDataPacket[]>(
      `SELECT 
        COUNT(DISTINCT p.payment_id) as total_payments,
        SUM(p.total_charges) as total_charges,
        SUM(p.amount_paid) as total_collected,
        SUM(p.due_amount) as total_outstanding,
        SUM(CASE WHEN p.payment_status = 'paid' THEN 1 ELSE 0 END) as fully_paid_count,
        SUM(CASE WHEN p.payment_status = 'partial' THEN 1 ELSE 0 END) as partial_paid_count,
        SUM(CASE WHEN p.payment_status = 'pending' THEN 1 ELSE 0 END) as pending_count
       FROM payments p
       JOIN booking b ON p.booking_id = b.booking_id
       ${whereClause}`,
      params
    );
    
    res.json({
      statistics: stats[0]
    });
    
  } catch (error) {
    console.error('Payment statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch payment statistics' });
  }
};
