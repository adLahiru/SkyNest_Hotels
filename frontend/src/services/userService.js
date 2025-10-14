import apiClient from '../config/api';

/**
 * User Service
 * Handles all user profile-related API calls
 */

const userService = {
  /**
   * Get user profile by ID
   * @param {string} userId - User ID
   * @returns {Promise} Response with user data
   */
  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}`);

      if (response.data.success) {
        return {
          success: true,
          user: response.data.data,
        };
      }

      return {
        success: false,
        message: response.data.message || 'Failed to fetch user profile',
      };
    } catch (error) {
      console.error('Get user error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user profile',
        error: error,
      };
    }
  },

  /**
   * Get current logged-in user's profile
   * @returns {Promise} Response with user data
   */
  getCurrentUserProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');

      if (response.data.success) {
        const user = response.data.data;
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(user));
        
        return {
          success: true,
          user,
        };
      }

      return {
        success: false,
        message: response.data.message || 'Failed to fetch profile',
      };
    } catch (error) {
      console.error('Get current profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch profile',
        error: error,
      };
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} Response with updated user data
   */
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/users/profile', {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        username: profileData.username,
        nic_no: profileData.nic_no,
      });

      if (response.data.success) {
        const updatedUser = response.data.data;
        // Update localStorage with new data
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return {
          success: true,
          message: response.data.message || 'Profile updated successfully',
          user: updatedUser,
        };
      }

      return {
        success: false,
        message: response.data.message || 'Failed to update profile',
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile. Please try again.',
        error: error,
      };
    }
  },

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @returns {Promise} Response with success status
   */
  changePassword: async (passwordData) => {
    try {
      const response = await apiClient.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Password changed successfully',
        };
      }

      return {
        success: false,
        message: response.data.message || 'Failed to change password',
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password. Please try again.',
        error: error,
      };
    }
  },

  /**
   * Get all users (admin/manager only)
   * @returns {Promise} Response with users list
   */
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/users');

      if (response.data.success) {
        return {
          success: true,
          users: response.data.data,
        };
      }

      return {
        success: false,
        message: response.data.message || 'Failed to fetch users',
      };
    } catch (error) {
      console.error('Get all users error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch users',
        error: error,
      };
    }
  },
};

export default userService;
