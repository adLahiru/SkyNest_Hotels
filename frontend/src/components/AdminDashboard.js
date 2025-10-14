import React, { useState, useEffect } from 'react';
import { Users, Building2, DollarSign, TrendingUp, Calendar, BarChart3, Plus, Edit, Trash2, Save, X, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import dashboardService from '../services/dashboardService';
import branchService from '../services/branchService';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Branch Management States
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [showEditBranchModal, setShowEditBranchModal] = useState(false);
  const [showDeleteBranchModal, setShowDeleteBranchModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  const [branchFormData, setBranchFormData] = useState({
    branch_name: '',
    address: '',
    email: '',
    phone: '',
    manager_id: ''
  });
  
  const [branchFormErrors, setBranchFormErrors] = useState({});

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    const result = await dashboardService.getAdminStats();
    if (result.success) {
      setStats(result.data);
    }
    setLoading(false);
  };

  // Branch Management Functions
  const validateBranchForm = () => {
    const errors = {};
    if (!branchFormData.branch_name.trim()) errors.branch_name = 'Branch name is required';
    if (!branchFormData.address.trim()) errors.address = 'Address is required';
    if (branchFormData.email && !/\S+@\S+\.\S+/.test(branchFormData.email)) {
      errors.email = 'Email is invalid';
    }
    if (branchFormData.phone && !/^[\+]?[\d\s\-\(\)]+$/.test(branchFormData.phone)) {
      errors.phone = 'Phone number is invalid';
    }
    setBranchFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleImageFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size should be less than 5MB');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const openAddBranchModal = () => {
    setBranchFormData({
      branch_name: '',
      address: '',
      email: '',
      phone: '',
      manager_id: ''
    });
    setBranchFormErrors({});
    setImagePreview(null);
    setImageFile(null);
    setShowAddBranchModal(true);
  };

  const openEditBranchModal = (branch) => {
    setSelectedBranch(branch);
    setBranchFormData({
      branch_name: branch.branch_name || '',
      address: branch.location || branch.address || '',
      email: branch.email || '',
      phone: branch.phone || '',
      manager_id: branch.manager_id || ''
    });
    setShowEditBranchModal(true);
  };

  const openDeleteBranchModal = (branch) => {
    setSelectedBranch(branch);
    setShowDeleteBranchModal(true);
  };

  const closeModals = () => {
    setShowAddBranchModal(false);
    setShowEditBranchModal(false);
    setShowDeleteBranchModal(false);
    setSelectedBranch(null);
    setBranchFormData({
      branch_name: '',
      address: '',
      email: '',
      phone: '',
      manager_id: ''
    });
    setBranchFormErrors({});
    setImagePreview(null);
    setImageFile(null);
  };

  const handleAddBranch = async () => {
    if (!validateBranchForm()) return;
    
    setIsSaving(true);
    setErrorMessage('');
    
    try {
      const result = await branchService.createBranch({
        branch_name: branchFormData.branch_name,
        address: branchFormData.address,
        email: branchFormData.email || undefined,
        phone: branchFormData.phone || undefined,
        manager_id: branchFormData.manager_id || undefined
      });

      if (result.success) {
        setSuccessMessage('Branch added successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        closeModals();
        fetchDashboardStats(); // Refresh stats
      } else {
        setErrorMessage(result.message || 'Failed to add branch');
      }
    } catch (error) {
      console.error('Add branch error:', error);
      setErrorMessage('Failed to add branch. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditBranch = async () => {
    if (!validateBranchForm()) return;
    
    setIsSaving(true);
    setErrorMessage('');
    
    try {
      const result = await branchService.updateBranch(selectedBranch.branch_id, {
        branch_name: branchFormData.branch_name,
        address: branchFormData.address,
        email: branchFormData.email || undefined,
        phone: branchFormData.phone || undefined,
        manager_id: branchFormData.manager_id || undefined
      });

      if (result.success) {
        setSuccessMessage('Branch updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        closeModals();
        fetchDashboardStats(); // Refresh stats
      } else {
        setErrorMessage(result.message || 'Failed to update branch');
      }
    } catch (error) {
      console.error('Update branch error:', error);
      setErrorMessage('Failed to update branch. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBranch = async () => {
    setIsSaving(true);
    setErrorMessage('');
    
    try {
      const result = await branchService.deleteBranch(selectedBranch.branch_id);

      if (result.success) {
        setSuccessMessage('Branch deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        closeModals();
        fetchDashboardStats(); // Refresh stats
      } else {
        setErrorMessage(result.message || 'Failed to delete branch');
      }
    } catch (error) {
      console.error('Delete branch error:', error);
      setErrorMessage('Failed to delete branch. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse flex space-x-4">
              <div className="w-12 h-12 bg-blue-400 rounded-full"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-blue-400 rounded w-3/4"></div>
                <div className="h-4 bg-blue-400 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}! Here's what's happening today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.users?.total || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.users?.guests || 0} Guests • {stats?.users?.staff || 0} Staff
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Branches */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Branches</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.branches?.total || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Active Locations</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Building2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${Number(stats?.revenue?.total_revenue || 0).toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +${Number(stats?.revenue?.monthly_revenue || 0).toLocaleString()} this month
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <DollarSign className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.bookings?.total || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.bookings?.confirmed || 0} Confirmed • {stats?.bookings?.checked_in || 0} Active
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="w-5 h-5 inline-block mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('branches')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'branches'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Building2 className="w-5 h-5 inline-block mr-2" />
                Branches
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-5 h-5 inline-block mr-2" />
                Users
              </button>
              <button
                onClick={() => setActiveTab('financial')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'financial'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="w-5 h-5 inline-block mr-2" />
                Financial
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Room Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-600">Available</p>
                      <p className="text-2xl font-bold text-green-600">{stats?.rooms?.available || 0}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <p className="text-sm text-gray-600">Occupied</p>
                      <p className="text-2xl font-bold text-red-600">{stats?.rooms?.occupied || 0}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-sm text-gray-600">Maintenance</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats?.rooms?.maintenance || 0}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.rooms?.total || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Recent Bookings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {stats?.recentBookings?.slice(0, 5).map((booking) => (
                          <tr key={booking.booking_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{booking.guest_name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{booking.branch_name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{booking.room_number}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(booking.check_in).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                booking.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-800' :
                                booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              ${Number(booking.total_amount).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Branches Tab */}
            {activeTab === 'branches' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Branch Performance</h3>
                  <button 
                    onClick={openAddBranchModal}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Branch
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rooms</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stats?.branchWiseStats?.map((branch) => (
                        <tr key={branch.branch_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{branch.branch_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{branch.location}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{branch.total_rooms || 0}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{branch.total_bookings || 0}</td>
                          <td className="px-4 py-3 text-sm font-medium text-green-600">
                            ${Number(branch.revenue || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button 
                              onClick={() => openEditBranchModal(branch)}
                              className="text-blue-600 hover:text-blue-800 mr-3"
                            >
                              <Edit className="w-4 h-4 inline" />
                            </button>
                            <button 
                              onClick={() => openDeleteBranchModal(branch)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </button>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>User management interface coming soon...</p>
                </div>
              </div>
            )}

            {/* Financial Tab */}
            {activeTab === 'financial' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold text-green-700">
                        ${Number(stats?.revenue?.total_revenue || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
                      <p className="text-3xl font-bold text-blue-700">
                        ${Number(stats?.revenue?.monthly_revenue || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                      <p className="text-sm text-gray-600 mb-1">Today's Revenue</p>
                      <p className="text-3xl font-bold text-purple-700">
                        ${Number(stats?.revenue?.daily_revenue || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Branch Revenue Breakdown</h3>
                  <div className="space-y-3">
                    {stats?.branchWiseStats?.map((branch) => (
                      <div key={branch.branch_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{branch.branch_name}</p>
                          <p className="text-sm text-gray-600">{branch.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            ${Number(branch.revenue || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">{branch.total_bookings || 0} bookings</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-6 py-3 rounded-lg shadow-lg flex items-center z-50">
          <CheckCircle className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-800 px-6 py-3 rounded-lg shadow-lg flex items-center z-50">
          <AlertCircle className="w-5 h-5 mr-2" />
          {errorMessage}
        </div>
      )}

      {/* Add Branch Modal */}
      {showAddBranchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Branch</h2>
                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleAddBranch(); }} className="space-y-6">
                {/* Branch Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={branchFormData.branch_name}
                    onChange={(e) => setBranchFormData({ ...branchFormData, branch_name: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      branchFormErrors.branch_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter branch name"
                  />
                  {branchFormErrors.branch_name && (
                    <p className="mt-1 text-sm text-red-600">{branchFormErrors.branch_name}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={branchFormData.address}
                    onChange={(e) => setBranchFormData({ ...branchFormData, address: e.target.value })}
                    rows="3"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      branchFormErrors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter complete address"
                  />
                  {branchFormErrors.address && (
                    <p className="mt-1 text-sm text-red-600">{branchFormErrors.address}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={branchFormData.email}
                    onChange={(e) => setBranchFormData({ ...branchFormData, email: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      branchFormErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="branch@example.com"
                  />
                  {branchFormErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{branchFormErrors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={branchFormData.phone}
                    onChange={(e) => setBranchFormData({ ...branchFormData, phone: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      branchFormErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+1 234 567 8900"
                  />
                  {branchFormErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{branchFormErrors.phone}</p>
                  )}
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch Image</label>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-sm text-gray-600 mb-2">
                          Drag and drop your image here, or
                        </p>
                        <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                          Browse Files
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => e.target.files[0] && handleImageFile(e.target.files[0])}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-2">Max file size: 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
                  >
                    {isSaving ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Add Branch
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {showEditBranchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Branch</h2>
                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleEditBranch(); }} className="space-y-6">
                {/* Branch Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={branchFormData.branch_name}
                    onChange={(e) => setBranchFormData({ ...branchFormData, branch_name: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      branchFormErrors.branch_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter branch name"
                  />
                  {branchFormErrors.branch_name && (
                    <p className="mt-1 text-sm text-red-600">{branchFormErrors.branch_name}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={branchFormData.address}
                    onChange={(e) => setBranchFormData({ ...branchFormData, address: e.target.value })}
                    rows="3"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      branchFormErrors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter complete address"
                  />
                  {branchFormErrors.address && (
                    <p className="mt-1 text-sm text-red-600">{branchFormErrors.address}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={branchFormData.email}
                    onChange={(e) => setBranchFormData({ ...branchFormData, email: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      branchFormErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="branch@example.com"
                  />
                  {branchFormErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{branchFormErrors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={branchFormData.phone}
                    onChange={(e) => setBranchFormData({ ...branchFormData, phone: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      branchFormErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+1 234 567 8900"
                  />
                  {branchFormErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{branchFormErrors.phone}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
                  >
                    {isSaving ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Branch
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Branch Modal */}
      {showDeleteBranchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Delete Branch</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">{selectedBranch?.branch_name}</span>? 
              All associated data will be permanently removed.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModals}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBranch}
                disabled={isSaving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                {isSaving ? 'Deleting...' : 'Delete Branch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
