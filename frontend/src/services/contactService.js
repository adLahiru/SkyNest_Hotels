import apiClient from '../config/api';
import logger from '../utils/logger';

/**
 * Contact Service
 * Handles all contact form API calls
 */

const contactService = {
  /**
   * Submit contact form (Public - No auth required)
   * @param {Object} contactData - Contact form data
   * @returns {Promise} Response with success status
   */
  submitContactForm: async (contactData) => {
    try {
      const response = await apiClient.post('/contact', contactData);
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      logger.error('Submit contact form error', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit contact form. Please try again.',
        error,
      };
    }
  },

  /**
   * Get all contact messages (Admin only)
   * @param {Object} filters - Filter options (status, inquiry_type, limit, offset)
   * @returns {Promise} Response with list of contact messages
   */
  getAllContactMessages: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await apiClient.get(`/contact?${params.toString()}`);
      return {
        success: response.data.success,
        messages: response.data.data?.messages || [],
        total: response.data.data?.total || 0,
        message: response.data.message,
      };
    } catch (error) {
      logger.error('Get all contact messages error', error);
      return {
        success: false,
        messages: [],
        total: 0,
        message: error.response?.data?.message || 'Failed to fetch contact messages',
        error,
      };
    }
  },

  /**
   * Get contact message by ID (Admin only)
   * @param {string} contactId - Contact message ID
   * @returns {Promise} Response with contact message details
   */
  getContactMessageById: async (contactId) => {
    try {
      const response = await apiClient.get(`/contact/${contactId}`);
      return {
        success: response.data.success,
        contact: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      logger.error('Get contact message by ID error', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch contact message details',
        error,
      };
    }
  },

  /**
   * Update contact message status (Admin only)
   * @param {string} contactId - Contact message ID
   * @param {string} status - New status (pending, read, replied, closed)
   * @returns {Promise} Response with success status
   */
  updateContactStatus: async (contactId, status) => {
    try {
      const response = await apiClient.patch(`/contact/${contactId}/status`, { status });
      return {
        success: response.data.success,
        message: response.data.message || 'Contact status updated successfully',
        data: response.data.data,
      };
    } catch (error) {
      logger.error('Update contact status error', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update contact status',
        error,
      };
    }
  },

  /**
   * Delete contact message (Admin only)
   * @param {string} contactId - Contact message ID
   * @returns {Promise} Response with success status
   */
  deleteContactMessage: async (contactId) => {
    try {
      const response = await apiClient.delete(`/contact/${contactId}`);
      return {
        success: response.data.success,
        message: response.data.message || 'Contact message deleted successfully',
      };
    } catch (error) {
      logger.error('Delete contact message error', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete contact message',
        error,
      };
    }
  },
};

export default contactService;
