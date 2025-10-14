import apiClient from '../config/api';

/**
 * User Service
 * Handles all user-related API calls
 */

const userService = {
  /**
   * Get all users (Admin/Manager only)
   * @param {Object} filters - Filter options (role, branch_id, is_guest, etc.)
   * @returns {Promise} Response with list of users
   */
  getAllUsers: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await apiClient.get(`/users?${params.toString()}`);
      return {
        success: response.data.success,
        users: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get all users error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch users',
        error,
      };
    }
  },

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise} Response with user details
   */
  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return {
        success: response.data.success,
        user: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get user by ID error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user details',
        error,
      };
    }
  },

  /**
   * Create new user (Admin/Manager only)
   * @param {Object} userData - User data
   * @returns {Promise} Response with created user
   */
  createUser: async (userData) => {
    try {
      const response = await apiClient.post('/users', userData);
      return {
        success: response.data.success,
        user: response.data.data,
        message: response.data.message || 'User created successfully',
      };
    } catch (error) {
      console.error('Create user error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create user',
        error,
      };
    }
  },

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise} Response with updated user
   */
  updateUser: async (userId, userData) => {
    try {
      const response = await apiClient.put(`/users/${userId}`, userData);
      return {
        success: response.data.success,
        user: response.data.data,
        message: response.data.message || 'User updated successfully',
      };
    } catch (error) {
      console.error('Update user error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update user',
        error,
      };
    }
  },

  /**
   * Update user password
   * @param {string} userId - User ID
   * @param {Object} passwordData - Password data (currentPassword, newPassword, confirmPassword)
   * @returns {Promise} Response with success status
   */
  updatePassword: async (userId, passwordData) => {
    try {
      const response = await apiClient.put(`/users/${userId}/password`, passwordData);
      return {
        success: response.data.success,
        message: response.data.message || 'Password updated successfully',
      };
    } catch (error) {
      console.error('Update password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update password',
        error,
      };
    }
  },

  /**
   * Delete user (Admin only)
   * @param {string} userId - User ID
   * @returns {Promise} Response with success status
   */
  deleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/users/${userId}`);
      return {
        success: response.data.success,
        message: response.data.message || 'User deleted successfully',
      };
    } catch (error) {
      console.error('Delete user error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete user',
        error,
      };
    }
  },
};

export default userService;
