import apiClient from '../config/api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

const authService = {
  /**
   * Login user with username/email and password
   * @param {string} username - Username or email
   * @param {string} password - User password
   * @returns {Promise} Response with user data and tokens
   */
  login: async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password,
      });

      if (response.data.success) {
        const { user, tokens } = response.data.data;
        
        // Store tokens and user data in localStorage
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        return {
          success: true,
          user,
          tokens,
        };
      }

      return {
        success: false,
        message: response.data.message || 'Login failed',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.',
        error: error,
      };
    }
  },

  /**
   * Register new user (Guest registration)
   * @param {Object} userData - User registration data
   * @returns {Promise} Response with success status
   */
  register: async (userData) => {
    try {
      // Generate username from email if not provided
      const username = userData.username || userData.email.split('@')[0];
      
      const response = await apiClient.post('/users/register', {
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        password: userData.password,
        confirmPassword: userData.confirmPassword || userData.password,
        username: username,
        nic_no: userData.nic_no || '',
      });

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Registration successful',
          user: response.data.data?.user,
        };
      }

      return {
        success: false,
        message: response.data.message || 'Registration failed',
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
        error: error,
      };
    }
  },

  /**
   * Logout user
   * @returns {Promise} Response with success status
   */
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }

      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      console.error('Logout error:', error);
      
      // Clear local storage even if API call fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      return {
        success: true,
        message: 'Logged out successfully',
      };
    }
  },

  /**
   * Refresh access token
   * @returns {Promise} Response with new access token
   */
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/auth/refresh', {
        refreshToken,
      });

      if (response.data.success) {
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        
        return {
          success: true,
          accessToken,
        };
      }

      return {
        success: false,
        message: response.data.message || 'Token refresh failed',
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        message: 'Token refresh failed',
        error: error,
      };
    }
  },

  /**
   * Get current user profile
   * @returns {Promise} Response with user profile data
   */
  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');

      if (response.data.success) {
        const user = response.data.data;
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
      console.error('Get profile error:', error);
      return {
        success: false,
        message: 'Failed to fetch profile',
        error: error,
      };
    }
  },

  /**
   * Verify if user is authenticated
   * @returns {boolean} True if user has valid token
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  /**
   * Get current user from localStorage
   * @returns {Object|null} User object or null
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  },

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} True if user has the role
   */
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user?.role === role;
  },

  /**
   * Check if user is a guest
   * @returns {boolean} True if user is a guest
   */
  isGuest: () => {
    const user = authService.getCurrentUser();
    return user?.is_guest === true;
  },
};

export default authService;
