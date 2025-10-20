import apiClient from '../config/api';

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
      console.log('Booking API response:', response.data);
      return {
        success: response.data.success,
        booking: response.data.data?.booking || response.data.data,
        message: response.data.message || 'Booking created successfully',
      };
    } catch (error) {
      console.error('Create booking error:', error);
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
        bookings: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get all bookings error:', error);
      return {
        success: false,
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
      console.error('Get booking by ID error:', error);
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
      console.error('Get user bookings error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user bookings',
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
      console.error('Update booking error:', error);
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
      console.error('Update booking status error:', error);
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
      console.error('Cancel booking error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel booking',
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
      const response = await apiClient.post(`/bookings/${bookingId}/check-in`);
      return {
        success: response.data.success,
        booking: response.data.data,
        message: response.data.message || 'Check-in successful',
      };
    } catch (error) {
      console.error('Check-in booking error:', error);
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
      const response = await apiClient.post(`/bookings/${bookingId}/check-out`);
      return {
        success: response.data.success,
        booking: response.data.data,
        message: response.data.message || 'Check-out successful',
      };
    } catch (error) {
      console.error('Check-out booking error:', error);
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
      console.error('Delete booking error:', error);
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
      console.error('Get available rooms error:', error);
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
