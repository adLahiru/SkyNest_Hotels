import axios from 'axios';

// Backend API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8084/api';

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds (increased for remote DB operations)
});

// Request interceptor - Add auth token to requests and implement retry logic
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Initialize retry count if not set
    if (!config.retryCount) {
      config.retryCount = 0;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh, errors, and retries
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle timeout errors with retry logic
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      if (originalRequest.retryCount < MAX_RETRIES) {
        originalRequest.retryCount += 1;
        console.warn(
          `⏱️ Request timeout. Retrying (${originalRequest.retryCount}/${MAX_RETRIES})...`,
          originalRequest.url
        );
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        
        return apiClient(originalRequest);
      } else {
        console.error(
          `❌ Request failed after ${MAX_RETRIES} retries:`,
          originalRequest.url
        );
        error.message = `Request timed out after ${MAX_RETRIES} retry attempts. Please check your connection or try again later.`;
      }
    }

    // Handle network errors with retry logic
    if (error.message === 'Network Error' && !originalRequest._retry) {
      if (originalRequest.retryCount < MAX_RETRIES) {
        originalRequest.retryCount += 1;
        console.warn(
          `🔌 Network error. Retrying (${originalRequest.retryCount}/${MAX_RETRIES})...`,
          originalRequest.url
        );
        
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        
        return apiClient(originalRequest);
      } else {
        console.error(
          `❌ Network error after ${MAX_RETRIES} retries:`,
          originalRequest.url
        );
        error.message = 'Unable to connect to the server. Please ensure the backend is running on port 8084.';
      }
    }

    // If token expired, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        console.warn('🔐 Session expired. Please login again.');
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
