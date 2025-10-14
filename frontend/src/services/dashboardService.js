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
};

export default dashboardService;
