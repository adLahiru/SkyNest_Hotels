import apiClient from '../config/api';

/**
 * Service Catalogue Service
 * Handles all service-related API calls
 */

const serviceService = {
  /**
   * Get all services from catalogue
   * @returns {Promise} Response with list of services
   */
  getAllServices: async () => {
    try {
      const response = await apiClient.get('/services');
      return {
        success: response.data.success,
        services: response.data.data?.services || response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get all services error:', error);
      return {
        success: false,
        services: [],
        message: error.response?.data?.message || 'Failed to fetch services',
        error,
      };
    }
  },

  /**
   * Add service to a booking
   * @param {string} bookingId - Booking ID
   * @param {string} serviceId - Service ID
   * @param {number} quantity - Quantity of service
   * @returns {Promise} Response with service usage details
   */
  addServiceToBooking: async (bookingId, serviceId, quantity) => {
    try {
      const response = await apiClient.post('/service-usage', {
        booking_id: bookingId,
        service_id: serviceId,
        quantity: quantity,
      });
      return {
        success: response.data.success || true,
        usage: response.data.data || response.data.usage,
        message: response.data.message || 'Service added successfully',
      };
    } catch (error) {
      console.error('Add service error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add service',
        error,
      };
    }
  },

  /**
   * Get services for a specific booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise} Response with booking's services
   */
  getBookingServices: async (bookingId) => {
    try {
      const response = await apiClient.get(`/service-usage/booking/${bookingId}`);
      return {
        success: response.data.success,
        services: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get booking services error:', error);
      return {
        success: false,
        services: [],
        message: error.response?.data?.message || 'Failed to fetch booking services',
        error,
      };
    }
  },

  /**
   * Create a new service (Admin only)
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
   * Update service (Admin only)
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
};

export default serviceService;
