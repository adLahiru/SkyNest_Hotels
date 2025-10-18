import apiClient from '../config/api';

/**
 * Branch Service
 * Handles all branch-related API calls
 */

const branchService = {
  /**
   * Get all branches
   * @returns {Promise} Response with list of branches
   */
  getAllBranches: async () => {
    try {
      const response = await apiClient.get('/branches');
      return {
        success: response.data.success,
        branches: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch branches',
        error,
      };
    }
  },

  /**
   * Get branch by ID
   * @param {string} branchId - Branch ID
   * @returns {Promise} Response with branch details
   */
  getBranchById: async (branchId) => {
    try {
      const response = await apiClient.get(`/branches/${branchId}`);
      return {
        success: response.data.success,
        branch: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch branch details',
        error,
      };
    }
  },

  /**
   * Create new branch (Admin only)
   * @param {Object} branchData - Branch data
   * @returns {Promise} Response with created branch
   */
  createBranch: async (branchData) => {
    try {
      const response = await apiClient.post('/branches', branchData);
      return {
        success: response.data.success,
        branch: response.data.data,
        message: response.data.message || 'Branch created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create branch',
        error,
      };
    }
  },

  /**
   * Update branch (Admin only)
   * @param {string} branchId - Branch ID
   * @param {Object} branchData - Updated branch data
   * @returns {Promise} Response with updated branch
   */
  updateBranch: async (branchId, branchData) => {
    try {
      const response = await apiClient.put(`/branches/${branchId}`, branchData);
      return {
        success: response.data.success,
        branch: response.data.data,
        message: response.data.message || 'Branch updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update branch',
        error,
      };
    }
  },

  /**
   * Delete branch (Admin only)
   * @param {string} branchId - Branch ID
   * @returns {Promise} Response with success status
   */
  deleteBranch: async (branchId) => {
    try {
      const response = await apiClient.delete(`/branches/${branchId}`);
      return {
        success: response.data.success,
        message: response.data.message || 'Branch deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete branch',
        error,
      };
    }
  },
};

export default branchService;
