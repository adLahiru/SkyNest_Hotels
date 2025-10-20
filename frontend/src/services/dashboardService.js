import apiClient from '../config/api';

/**
 * Dashboard Service
 * Handles all dashboard-related API calls for different user roles
 */

const dashboardService = {
  /**
   * Get Admin Dashboard Statistics
   * @returns {Promise} Response with complete admin stats
   */
  getAdminStats: async () => {
    try {
      const response = await apiClient.get('/dashboard/admin');
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get admin stats error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch admin dashboard',
        error,
      };
    }
  },

  /**
   * Get Manager Dashboard Statistics
   * @returns {Promise} Response with manager's branch stats
   */
  getManagerStats: async () => {
    try {
      const response = await apiClient.get('/dashboard/manager');
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get manager stats error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch manager dashboard',
        error,
      };
    }
  },

  /**
   * Get Receptionist Dashboard Statistics
   * @returns {Promise} Response with receptionist's branch stats
   */
  getReceptionistStats: async () => {
    try {
      const response = await apiClient.get('/dashboard/receptionist');
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get receptionist stats error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch receptionist dashboard',
        error,
      };
    }
  },

  /**
   * Get Housekeeping Dashboard Statistics
   * @returns {Promise} Response with housekeeping's branch stats
   */
  getHousekeepingStats: async () => {
    try {
      const response = await apiClient.get('/dashboard/housekeeping');
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get housekeeping stats error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch housekeeping dashboard',
        error,
      };
    }
  },

  /**
   * Check-in a guest
   * @param {string} bookingId - The booking ID to check in
   * @returns {Promise} Response with check-in result
   */
  checkInGuest: async (bookingId) => {
    try {
      const response = await apiClient.patch(`/bookings/${bookingId}/checkin`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message || 'Guest checked in successfully',
      };
    } catch (error) {
      console.error('Check-in guest error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to check in guest',
        error,
      };
    }
  },

  /**
   * Check-out a guest
   * @param {string} bookingId - The booking ID to check out
   * @returns {Promise} Response with check-out result
   */
  checkOutGuest: async (bookingId) => {
    try {
      const response = await apiClient.patch(`/bookings/${bookingId}/checkout`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message || 'Guest checked out successfully',
      };
    } catch (error) {
      console.error('Check-out guest error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to check out guest',
        error,
      };
    }
  },
};

export default dashboardService;
