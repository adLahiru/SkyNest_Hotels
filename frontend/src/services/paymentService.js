import apiClient from '../config/api';

/**
 * Payment Service
 * Handles all payment-related API calls
 */

const paymentService = {
  /**
   * Mark/Record a payment for a booking
   * @param {string} bookingId - Booking ID
   * @param {number} amount - Payment amount
   * @param {string} paymentMethod - Payment method (cash, credit_card, etc.)
   * @param {string} transactionReference - Optional transaction reference
   * @param {string} notes - Optional payment notes
   * @returns {Promise} Response with payment details
   */
  markPayment: async (bookingId, amount, paymentMethod, transactionReference = null, notes = null) => {
    try {
      const response = await apiClient.post('/payments/mark-payment', {
        booking_id: bookingId,
        amount: amount,
        payment_method: paymentMethod,
        transaction_reference: transactionReference,
        notes: notes,
      });
      return {
        success: response.data.success || true,
        payment: response.data.data || response.data.payment,
        message: response.data.message || 'Payment recorded successfully',
      };
    } catch (error) {
      console.error('Mark payment error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to record payment',
        error,
      };
    }
  },

  /**
   * Get payment details for a booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise} Response with payment details
   */
  getBookingPayment: async (bookingId) => {
    try {
      const response = await apiClient.get(`/payments/booking/${bookingId}`);
      return {
        success: response.data.success,
        payment: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get booking payment error:', error);
      return {
        success: false,
        payment: null,
        message: error.response?.data?.message || 'Failed to fetch payment details',
        error,
      };
    }
  },

  /**
   * Generate bill for a booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise} Response with bill details
   */
  generateBill: async (bookingId) => {
    try {
      const response = await apiClient.post(`/payments/generate-bill`, {
        booking_id: bookingId,
      });
      return {
        success: response.data.success,
        bill: response.data.data,
        message: response.data.message || 'Bill generated successfully',
      };
    } catch (error) {
      console.error('Generate bill error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate bill',
        error,
      };
    }
  },

  /**
   * Get all payments (admin/staff)
   * @returns {Promise} Response with list of payments
   */
  getAllPayments: async () => {
    try {
      const response = await apiClient.get('/payments');
      return {
        success: response.data.success,
        payments: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get all payments error:', error);
      return {
        success: false,
        payments: [],
        message: error.response?.data?.message || 'Failed to fetch payments',
        error,
      };
    }
  },
};

export default paymentService;
