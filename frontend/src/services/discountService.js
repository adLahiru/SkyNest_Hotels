import apiClient from '../config/api';

/**
 * Discount Service
 * Handles all discount-related API calls
 */

const discountService = {
  /**
   * Get all discounts
   * @param {Object} filters - Filter options (is_active, discount_type, etc.)
   * @returns {Promise} Response with list of discounts
   */
  getAllDiscounts: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await apiClient.get(`/discounts?${params.toString()}`);
      return {
        success: response.data.success,
        discounts: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get all discounts error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch discounts',
        error,
      };
    }
  },

  /**
   * Get active discounts
   * @returns {Promise} Response with list of active discounts
   */
  getActiveDiscounts: async () => {
    try {
      const response = await apiClient.get('/discounts/active');
      return {
        success: response.data.success,
        discounts: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get active discounts error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch active discounts',
        error,
      };
    }
  },

  /**
   * Get discount by ID
   * @param {string} discountId - Discount ID
   * @returns {Promise} Response with discount details
   */
  getDiscountById: async (discountId) => {
    try {
      const response = await apiClient.get(`/discounts/${discountId}`);
      return {
        success: response.data.success,
        discount: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get discount by ID error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch discount details',
        error,
      };
    }
  },

  /**
   * Validate discount code
   * @param {string} discountCode - Discount code to validate
   * @param {Object} bookingData - Booking data for validation (check_in, check_out, total_amount, etc.)
   * @returns {Promise} Response with validation result and discount details
   */
  validateDiscountCode: async (discountCode, bookingData) => {
    try {
      const response = await apiClient.post('/discounts/validate', {
        discount_code: discountCode,
        ...bookingData,
      });
      return {
        success: response.data.success,
        discount: response.data.data,
        discountAmount: response.data.data?.discount_amount,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Validate discount code error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid discount code',
        error,
      };
    }
  },

  /**
   * Create new discount (Admin only)
   * @param {Object} discountData - Discount data
   * @returns {Promise} Response with created discount
   */
  createDiscount: async (discountData) => {
    try {
      const response = await apiClient.post('/discounts', discountData);
      return {
        success: response.data.success,
        discount: response.data.data,
        message: response.data.message || 'Discount created successfully',
      };
    } catch (error) {
      console.error('Create discount error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create discount',
        error,
      };
    }
  },

  /**
   * Update discount (Admin only)
   * @param {string} discountId - Discount ID
   * @param {Object} discountData - Updated discount data
   * @returns {Promise} Response with updated discount
   */
  updateDiscount: async (discountId, discountData) => {
    try {
      const response = await apiClient.put(`/discounts/${discountId}`, discountData);
      return {
        success: response.data.success,
        discount: response.data.data,
        message: response.data.message || 'Discount updated successfully',
      };
    } catch (error) {
      console.error('Update discount error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update discount',
        error,
      };
    }
  },

  /**
   * Delete discount (Admin only)
   * @param {string} discountId - Discount ID
   * @returns {Promise} Response with success status
   */
  deleteDiscount: async (discountId) => {
    try {
      const response = await apiClient.delete(`/discounts/${discountId}`);
      return {
        success: response.data.success,
        message: response.data.message || 'Discount deleted successfully',
      };
    } catch (error) {
      console.error('Delete discount error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete discount',
        error,
      };
    }
  },
};

export default discountService;
