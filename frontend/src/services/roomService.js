import apiClient from '../config/api';

/**
 * Room Service
 * Handles all room-related API calls
 */

const roomService = {
  /**
   * Get all rooms with optional filters
   * @param {Object} filters - Filter options (branch_id, room_type_id, status, etc.)
   * @returns {Promise} Response with list of rooms
   */
  getAllRooms: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await apiClient.get(`/rooms?${params.toString()}`);
      return {
        success: response.data.success,
        rooms: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch rooms',
        error,
      };
    }
  },

  /**
   * Get room by ID
   * @param {string} roomId - Room ID
   * @returns {Promise} Response with room details
   */
  getRoomById: async (roomId) => {
    try {
      const response = await apiClient.get(`/rooms/${roomId}`);
      return {
        success: response.data.success,
        room: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch room details',
        error,
      };
    }
  },

  /**
   * Get available rooms for specific dates
   * @param {Object} params - Search params (branch_id, check_in, check_out, room_type_id, guests)
   * @returns {Promise} Response with available rooms
   */
  getAvailableRooms: async ({ branchId, checkIn, checkOut, roomTypeId, guests }) => {
    try {
      const params = new URLSearchParams();
      if (branchId) params.append('branch_id', branchId);
      if (checkIn) params.append('check_in', checkIn);
      if (checkOut) params.append('check_out', checkOut);
      if (roomTypeId) params.append('room_type_id', roomTypeId);
      if (guests) params.append('guests', guests);
      
      const response = await apiClient.get(`/rooms/available?${params.toString()}`);
      return {
        success: response.data.success,
        rooms: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch available rooms',
        error,
      };
    }
  },

  /**
   * Create new room (Admin/Manager only)
   * @param {Object} roomData - Room data
   * @returns {Promise} Response with created room
   */
  createRoom: async (roomData) => {
    try {
      const response = await apiClient.post('/rooms', roomData);
      return {
        success: response.data.success,
        room: response.data.data,
        message: response.data.message || 'Room created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create room',
        error,
      };
    }
  },

  /**
   * Update room (Admin/Manager only)
   * @param {string} roomId - Room ID
   * @param {Object} roomData - Updated room data
   * @returns {Promise} Response with updated room
   */
  updateRoom: async (roomId, roomData) => {
    try {
      const response = await apiClient.put(`/rooms/${roomId}`, roomData);
      return {
        success: response.data.success,
        room: response.data.data,
        message: response.data.message || 'Room updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update room',
        error,
      };
    }
  },

  /**
   * Update room status (Staff only)
   * @param {string} roomId - Room ID
   * @param {string} status - New status (AVAILABLE, OCCUPIED, MAINTENANCE, OUT_OF_SERVICE)
   * @returns {Promise} Response with updated room
   */
  updateRoomStatus: async (roomId, status) => {
    try {
      const response = await apiClient.patch(`/rooms/${roomId}/status`, { status });
      return {
        success: response.data.success,
        room: response.data.data,
        message: response.data.message || 'Room status updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update room status',
        error,
      };
    }
  },

  /**
   * Delete room (Admin only)
   * @param {string} roomId - Room ID
   * @returns {Promise} Response with success status
   */
  deleteRoom: async (roomId) => {
    try {
      const response = await apiClient.delete(`/rooms/${roomId}`);
      return {
        success: response.data.success,
        message: response.data.message || 'Room deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete room',
        error,
      };
    }
  },
};

export default roomService;
