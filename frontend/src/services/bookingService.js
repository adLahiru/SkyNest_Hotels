import apiClient from '../config/api';
import logger from '../utils/logger';

/**
 * Booking Service
 * Handles all booking-related API calls
 */

const bookingService = {
  /**
   * Create new booking
   * @param {Object} bookingData - Booking data
   * @returns {Promise} Response with created booking
   */
  createBooking: async (bookingData) => {
    try {
      const response = await apiClient.post('/bookings', bookingData);
      logger.debug('Booking API response:', response.data);
      return {
        success: response.data.success,
        booking: response.data.data?.booking || response.data.data,
        message: response.data.message || 'Booking created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create booking',
        error,
      };
    }
  },

  /**
   * Get all bookings (with optional filters)
   * @param {Object} filters - Filter options (user_id, branch_id, status, etc.)
   * @returns {Promise} Response with list of bookings
   */
  getAllBookings: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await apiClient.get(`/bookings?${params.toString()}`);
      return {
        success: response.data.success,
        bookings: response.data.data?.bookings || response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        bookings: [],
        message: error.response?.data?.message || 'Failed to fetch bookings',
        error,
      };
    }
  },

  /**
   * Get booking by ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise} Response with booking details
   */
  getBookingById: async (bookingId) => {
    try {
      const response = await apiClient.get(`/bookings/${bookingId}`);
      return {
        success: response.data.success,
        booking: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch booking details',
        error,
      };
    }
  },

  /**
   * Get user's bookings
   * @param {string} userId - User ID
   * @returns {Promise} Response with user's bookings
   */
  getUserBookings: async (userId) => {
    try {
      const response = await apiClient.get(`/bookings/user/${userId}`);
      return {
        success: response.data.success,
        bookings: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user bookings',
        error,
      };
    }
  },

  /**
   * Get current logged-in user's bookings (authenticated)
   * @returns {Promise} Response with current user's bookings
   */
  getMyBookings: async () => {
    try {
      const response = await apiClient.get('/bookings/my-bookings');
      return {
        success: response.data.success,
        bookings: response.data.data?.bookings || response.data.bookings || [],
        count: response.data.data?.count || 0,
        message: response.data.message,
      };
    } catch (error) {
      logger.error('Get my bookings error', error);
      return {
        success: false,
        bookings: [],
        count: 0,
        message: error.response?.data?.message || 'Failed to fetch bookings',
        error,
      };
    }
  },

  /**
   * Update booking
   * @param {string} bookingId - Booking ID
   * @param {Object} bookingData - Updated booking data
   * @returns {Promise} Response with updated booking
   */
  updateBooking: async (bookingId, bookingData) => {
    try {
      const response = await apiClient.put(`/bookings/${bookingId}`, bookingData);
      return {
        success: response.data.success,
        booking: response.data.data,
        message: response.data.message || 'Booking updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update booking',
        error,
      };
    }
  },

  /**
   * Update booking status
   * @param {string} bookingId - Booking ID
   * @param {string} status - New status (PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED)
   * @returns {Promise} Response with updated booking
   */
  updateBookingStatus: async (bookingId, status) => {
    try {
      const response = await apiClient.patch(`/bookings/${bookingId}/status`, { status });
      return {
        success: response.data.success,
        booking: response.data.data,
        message: response.data.message || 'Booking status updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update booking status',
        error,
      };
    }
  },

  /**
   * Cancel booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise} Response with cancelled booking
   */
  cancelBooking: async (bookingId) => {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/cancel`);
      return {
        success: response.data.success,
        booking: response.data.data,
        message: response.data.message || 'Booking cancelled successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel booking',
        error,
      };
    }
  },

  /**
   * Confirm booking (update status to confirmed)
   * @param {string} bookingId - Booking ID
   * @returns {Promise} Response with confirmed booking
   */
  confirmBooking: async (bookingId) => {
    try {
      const response = await apiClient.patch(`/bookings/${bookingId}/status`, { 
        status: 'confirmed' 
      });
      return {
        success: response.data.success,
        booking: response.data.data,
        message: response.data.message || 'Booking confirmed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to confirm booking',
        error,
      };
    }
  },

  /**
   * Check-in booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise} Response with checked-in booking
   */
  checkInBooking: async (bookingId) => {
    try {
      const response = await apiClient.patch(`/bookings/${bookingId}/checkin`);
      return {
        success: response.data.success,
        booking: response.data.booking || response.data.data,
        message: response.data.message || 'Check-in successful',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.error || 'Failed to check-in',
        error,
      };
    }
  },

  /**
   * Validate checkout eligibility
   * @param {string} bookingId - Booking ID
   * @returns {Promise} Response with checkout validation
   */
  validateCheckout: async (bookingId) => {
    try {
      const response = await apiClient.get(`/bookings/${bookingId}/checkout-validation`);
      return {
        success: response.data.success,
        canCheckout: response.data.canCheckout,
        payment: response.data.payment,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to check-in',
        error,
      };
    }
  },

  /**
   * Check-out booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise} Response with checked-out booking
   */
  checkOutBooking: async (bookingId) => {
    try {
      const response = await apiClient.patch(`/bookings/${bookingId}/checkout`);
      return {
        success: response.data.success,
        booking: response.data.booking || response.data.data,
        message: response.data.message || 'Check-out successful',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to check-out',
        error,
      };
    }
  },

  /**
   * Delete booking (Admin only)
   * @param {string} bookingId - Booking ID
   * @returns {Promise} Response with success status
   */
  deleteBooking: async (bookingId) => {
    try {
      const response = await apiClient.delete(`/bookings/${bookingId}`);
      return {
        success: response.data.success,
        message: response.data.message || 'Booking deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete booking',
        error,
      };
    }
  },

  /**
   * Get available rooms for specific dates
   * @param {Object} params - { branch_id, check_in, check_out }
   * @returns {Promise} Response with available room IDs
   */
  getAvailableRooms: async ({ branch_id, check_in, check_out }) => {
    try {
      const params = new URLSearchParams();
      if (branch_id) params.append('branch_id', branch_id);
      if (check_in) params.append('check_in', check_in);
      if (check_out) params.append('check_out', check_out);
      
      const response = await apiClient.get(`/bookings/available-rooms?${params.toString()}`);
      return {
        success: response.data.success,
        availableRooms: response.data.availableRooms || [],
        count: response.data.count || 0,
        dateRange: response.data.dateRange,
        message: response.data.message,
      };
    } catch (error) {
      logger.error('Get available rooms error', error);
      return {
        success: false,
        availableRooms: [],
        count: 0,
        message: error.response?.data?.message || 'Failed to fetch available rooms',
        error,
      };
    }
  },
};

export default bookingService;
