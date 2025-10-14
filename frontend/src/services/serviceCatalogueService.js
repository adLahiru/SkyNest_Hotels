import apiClient from '../config/api';

/**
 * Service Catalogue Service
 * Handles all service catalogue related API calls
 */

const serviceCatalogueService = {
  /**
   * Get all services
   * @param {Object} filters - Filter options (category, is_active, etc.)
   * @returns {Promise} Response with list of services
   */
  getAllServices: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await apiClient.get(`/services?${params.toString()}`);
      return {
        success: response.data.success,
        services: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get all services error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch services',
        error,
      };
    }
  },

  /**
   * Get service by ID
   * @param {string} serviceId - Service ID
   * @returns {Promise} Response with service details
   */
  getServiceById: async (serviceId) => {
    try {
      const response = await apiClient.get(`/services/${serviceId}`);
      return {
        success: response.data.success,
        service: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get service by ID error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch service details',
        error,
      };
    }
  },

  /**
   * Create new service (Admin/Manager only)
   * @param {Object} serviceData - Service data
   * @returns {Promise} Response with created service
   */
  createService: async (serviceData) => {
    try {
      const response = await apiClient.post('/services', serviceData);
      return {
        success: response.data.success,
        service: response.data.data,
        message: response.data.message || 'Service created successfully',
      };
    } catch (error) {
      console.error('Create service error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create service',
        error,
      };
    }
  },

  /**
   * Update service (Admin/Manager only)
   * @param {string} serviceId - Service ID
   * @param {Object} serviceData - Updated service data
   * @returns {Promise} Response with updated service
   */
  updateService: async (serviceId, serviceData) => {
    try {
      const response = await apiClient.put(`/services/${serviceId}`, serviceData);
      return {
        success: response.data.success,
        service: response.data.data,
        message: response.data.message || 'Service updated successfully',
      };
    } catch (error) {
      console.error('Update service error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update service',
        error,
      };
    }
  },

  /**
   * Delete service (Admin only)
   * @param {string} serviceId - Service ID
   * @returns {Promise} Response with success status
   */
  deleteService: async (serviceId) => {
    try {
      const response = await apiClient.delete(`/services/${serviceId}`);
      return {
        success: response.data.success,
        message: response.data.message || 'Service deleted successfully',
      };
    } catch (error) {
      console.error('Delete service error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete service',
        error,
      };
    }
  },

  /**
   * Record service usage for a booking
   * @param {Object} usageData - Service usage data (booking_id, service_id, quantity, etc.)
   * @returns {Promise} Response with recorded service usage
   */
  recordServiceUsage: async (usageData) => {
    try {
      const response = await apiClient.post('/services/usage', usageData);
      return {
        success: response.data.success,
        serviceUsage: response.data.data,
        message: response.data.message || 'Service usage recorded successfully',
      };
    } catch (error) {
      console.error('Record service usage error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to record service usage',
        error,
      };
    }
  },

  /**
   * Get service usage for a booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise} Response with service usage list
   */
  getServiceUsage: async (bookingId) => {
    try {
      const response = await apiClient.get(`/services/usage/${bookingId}`);
      return {
        success: response.data.success,
        serviceUsage: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get service usage error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch service usage',
        error,
      };
    }
  },
};

export default serviceCatalogueService;
