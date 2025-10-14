import apiClient from '../config/api';

/**
 * Room Type Service
 * Handles all room type related API calls
 */

const roomTypeService = {
  /**
   * Get all room types
   * @returns {Promise} Response with list of room types
   */
  getAllRoomTypes: async () => {
    try {
      const response = await apiClient.get('/room-types');
      return {
        success: response.data.success,
        roomTypes: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get all room types error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch room types',
        error,
      };
    }
  },

  /**
   * Get room type by ID
   * @param {string} roomTypeId - Room Type ID
   * @returns {Promise} Response with room type details
   */
  getRoomTypeById: async (roomTypeId) => {
    try {
      const response = await apiClient.get(`/room-types/${roomTypeId}`);
      return {
        success: response.data.success,
        roomType: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get room type by ID error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch room type details',
        error,
      };
    }
  },

  /**
   * Create new room type (Admin only)
   * @param {Object} roomTypeData - Room type data
   * @returns {Promise} Response with created room type
   */
  createRoomType: async (roomTypeData) => {
    try {
      const response = await apiClient.post('/room-types', roomTypeData);
      return {
        success: response.data.success,
        roomType: response.data.data,
        message: response.data.message || 'Room type created successfully',
      };
    } catch (error) {
      console.error('Create room type error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create room type',
        error,
      };
    }
  },

  /**
   * Update room type (Admin only)
   * @param {string} roomTypeId - Room Type ID
   * @param {Object} roomTypeData - Updated room type data
   * @returns {Promise} Response with updated room type
   */
  updateRoomType: async (roomTypeId, roomTypeData) => {
    try {
      const response = await apiClient.put(`/room-types/${roomTypeId}`, roomTypeData);
      return {
        success: response.data.success,
        roomType: response.data.data,
        message: response.data.message || 'Room type updated successfully',
      };
    } catch (error) {
      console.error('Update room type error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update room type',
        error,
      };
    }
  },

  /**
   * Delete room type (Admin only)
   * @param {string} roomTypeId - Room Type ID
   * @returns {Promise} Response with success status
   */
  deleteRoomType: async (roomTypeId) => {
    try {
      const response = await apiClient.delete(`/room-types/${roomTypeId}`);
      return {
        success: response.data.success,
        message: response.data.message || 'Room type deleted successfully',
      };
    } catch (error) {
      console.error('Delete room type error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete room type',
        error,
      };
    }
  },
};

export default roomTypeService;
