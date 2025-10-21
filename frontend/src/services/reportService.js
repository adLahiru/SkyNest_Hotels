import apiClient from '../config/api';
import logger from '../utils/logger';

/**
 * Report Service
 * Handles all report-related API calls for dashboard analytics
 */

const reportService = {
  /**
   * Get Room Occupancy Report
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @param {string} branchId - Optional branch filter
   * @returns {Promise} Response with occupancy data
   */
  getRoomOccupancy: async (startDate, endDate, branchId = null) => {
    try {
      const params = { startDate, endDate };
      if (branchId) params.branchId = branchId;
      
      const response = await apiClient.get('/dashboard/reports/room-occupancy', { params });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      logger.error('Get room occupancy error', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch room occupancy report',
        error,
      };
    }
  },

  /**
   * Get Guest Billing Summary
   * @param {string} branchId - Optional branch filter
   * @returns {Promise} Response with billing data
   */
  getGuestBilling: async (branchId = null) => {
    try {
      const params = branchId ? { branchId } : {};
      const response = await apiClient.get('/dashboard/reports/guest-billing', { params });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      logger.error('Get guest billing error', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch guest billing summary',
        error,
      };
    }
  },

  /**
   * Get Service Usage Breakdown
   * @param {Object} filters - Filter options (branchId, roomId, serviceType)
   * @returns {Promise} Response with service usage data
   */
  getServiceUsage: async (filters = {}) => {
    try {
      const response = await apiClient.get('/dashboard/reports/service-usage', { params: filters });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      logger.error('Get service usage error', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch service usage breakdown',
        error,
      };
    }
  },

  /**
   * Get Monthly Revenue Per Branch
   * @param {number} year - Year (defaults to current year)
   * @param {number} month - Month 1-12 (defaults to current month)
   * @param {string} branchId - Optional branch filter
   * @returns {Promise} Response with revenue data
   */
  getMonthlyRevenue: async (year = null, month = null, branchId = null) => {
    try {
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;
      if (branchId) params.branchId = branchId;
      
      const response = await apiClient.get('/dashboard/reports/monthly-revenue', { params });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      logger.error('Get monthly revenue error', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch monthly revenue report',
        error,
      };
    }
  },

  /**
   * Get Top-Used Services and Customer Preferences
   * @param {string} startDate - Optional start date
   * @param {string} endDate - Optional end date
   * @param {number} limit - Number of top services (default: 10)
   * @returns {Promise} Response with top services data
   */
  getTopServices: async (startDate = null, endDate = null, limit = 10) => {
    try {
      const params = { limit };
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      
      const response = await apiClient.get('/dashboard/reports/top-services', { params });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      logger.error('Get top services error', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch top services report',
        error,
      };
    }
  },
};

export default reportService;
