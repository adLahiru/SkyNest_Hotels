/**
 * API Client Configuration
 * 
 * Configures Axios instance with interceptors for:
 * - Automatic authentication token injection
 * - Token refresh on expiration
 * - Request/response logging
 * - Error handling
 */

import axios from 'axios';
import logger from '../utils/logger';

// Backend API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8084/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // Increased to 60 seconds for remote database connections
});

/**
 * Request interceptor
 * Adds authentication token to non-public API requests
 */
apiClient.interceptors.request.use(
  (config) => {
    // Don't add token to public endpoints
    const isPublicEndpoint = config.url?.includes('/public');
    
    if (!isPublicEndpoint) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    logger.apiRequest(config.method || 'unknown', config.url || '', {
      isPublic: isPublicEndpoint,
      hasToken: !!config.headers.Authorization
    });
    
    return config;
  },
  (error) => {
    logger.error('API request configuration error', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles successful responses and automatic token refresh on expiration
 */
apiClient.interceptors.response.use(
  (response) => {
    logger.apiResponse(
      response.config.method || 'unknown',
      response.config.url || '',
      response.status,
      {
        success: response.data?.success,
        dataLength: Array.isArray(response.data?.data) ? response.data.data.length : 'N/A'
      }
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    logger.apiError(
      originalRequest?.method || 'unknown',
      originalRequest?.url || '',
      {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        code: error.code
      }
    );

    // If token expired, attempt to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          logger.debug('Attempting token refresh');
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          logger.info('Token refreshed successfully');

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        logger.warn('Token refresh failed, logging out user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { API_BASE_URL };
