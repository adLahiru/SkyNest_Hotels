import React, { useState, useEffect } from 'react';
import { Users, Building2, DollarSign, TrendingUp, Calendar, BarChart3, Plus, Edit, Trash2, Search, Filter, X, Eye, EyeOff } from 'lucide-react';
import dashboardService from '../services/dashboardService';
import userService from '../services/userService';
import branchService from '../services/branchService';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // User management states
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nic_no: '',
    username: '',
    password: '',
    role: '',
    branch_id: '',
    hire_date: '',
    salary: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  const USER_ROLES = ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING', 'GUEST'];

  useEffect(() => {
    fetchDashboardStats();
    fetchBranches();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, searchQuery, roleFilter]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    const result = await dashboardService.getAdminStats();
    if (result.success) {
      setStats(result.data);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const filters = {};
    if (searchQuery) filters.search = searchQuery;
    if (roleFilter) filters.role = roleFilter;
    
    const result = await userService.getAllUsers(filters);
    if (result.success) {
      setUsers(result.users);
    } else {
      console.error('Failed to fetch users:', result.message);
    }
    setLoadingUsers(false);
  };

  const fetchBranches = async () => {
    const result = await branchService.getAllBranches();
    if (result.success) {
      setBranches(result.branches);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('');
  };

  const handleAddUserClick = () => {
    setShowAddUserModal(true);
    setUserFormData({
      name: '',
      email: '',
      phone: '',
      nic_no: '',
      username: '',
      password: '',
      role: '',
      branch_id: '',
      hire_date: '',
      salary: ''
    });
    setFormErrors({});
    setSubmitMessage({ type: '', text: '' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setUserFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!userFormData.name.trim()) errors.name = 'Name is required';
    if (!userFormData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userFormData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!userFormData.nic_no.trim()) errors.nic_no = 'NIC number is required';
    if (!userFormData.username.trim()) errors.username = 'Username is required';
    if (!userFormData.password.trim()) errors.password = 'Password is required';
    else if (userFormData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (!userFormData.role) errors.role = 'Role is required';
    if (userFormData.role && userFormData.role !== 'GUEST' && !userFormData.branch_id) {
      errors.branch_id = 'Branch is required for staff roles';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoadingUsers(true);
    setSubmitMessage({ type: '', text: '' });

    // Prepare data
    const userData = {
      name: userFormData.name,
      email: userFormData.email,
      phone: userFormData.phone || undefined,
      nic_no: userFormData.nic_no,
      username: userFormData.username,
      password: userFormData.password,
      role: userFormData.role,
      branch_id: userFormData.role !== 'GUEST' ? userFormData.branch_id : undefined,
      hire_date: userFormData.hire_date || undefined,
      salary: userFormData.salary ? parseFloat(userFormData.salary) : undefined
    };

    const result = await userService.createUser(userData);
    
    if (result.success) {
      setSubmitMessage({ type: 'success', text: result.message });
      setTimeout(() => {
        setShowAddUserModal(false);
        fetchUsers();
        fetchDashboardStats(); // Refresh stats
      }, 1500);
    } else {
      setSubmitMessage({ type: 'error', text: result.message });
    }
    
    setLoadingUsers(false);
  };

  const handleEditUserClick = (userItem) => {
    setSelectedUser(userItem);
    setShowEditUserModal(true);
    setUserFormData({
      name: userItem.name || '',
      email: userItem.email || '',
      phone: userItem.phone || '',
      nic_no: userItem.nic_no || '',
      username: userItem.username || '',
      password: '', // Don't pre-fill password
      role: userItem.role || '',
      branch_id: userItem.branch_id || '',
      hire_date: userItem.hire_date ? new Date(userItem.hire_date).toISOString().split('T')[0] : '',
      salary: userItem.salary || ''
    });
    setFormErrors({});
    setSubmitMessage({ type: '', text: '' });
  };

  const validateEditForm = () => {
    const errors = {};
    
    if (!userFormData.name.trim()) errors.name = 'Name is required';
    if (!userFormData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userFormData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!userFormData.username.trim()) errors.username = 'Username is required';
    if (!userFormData.role) errors.role = 'Role is required';
    if (userFormData.role && userFormData.role !== 'GUEST' && !userFormData.branch_id) {
      errors.branch_id = 'Branch is required for staff roles';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitEditUser = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) {
      return;
    }

    setLoadingUsers(true);
    setSubmitMessage({ type: '', text: '' });

    // Prepare data (password is optional for updates)
    const userData = {
      name: userFormData.name,
      email: userFormData.email,
      phone: userFormData.phone || undefined,
      nic_no: userFormData.nic_no,
      username: userFormData.username,
      role: userFormData.role,
      branch_id: userFormData.role !== 'GUEST' ? userFormData.branch_id : undefined,
      hire_date: userFormData.hire_date || undefined,
      salary: userFormData.salary ? parseFloat(userFormData.salary) : undefined
    };

    const result = await userService.updateUser(selectedUser.user_id, userData);
    
    if (result.success) {
      setSubmitMessage({ type: 'success', text: result.message });
      setTimeout(() => {
        setShowEditUserModal(false);
        setSelectedUser(null);
        fetchUsers();
        fetchDashboardStats(); // Refresh stats
      }, 1500);
    } else {
      setSubmitMessage({ type: 'error', text: result.message });
    }
    
    setLoadingUsers(false);
  };

  const handleDeleteUserClick = (userItem) => {
    setSelectedUser(userItem);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    setLoadingUsers(true);
    const result = await userService.deleteUser(selectedUser.user_id);
    
    if (result.success) {
      setShowDeleteConfirmModal(false);
      setSelectedUser(null);
      fetchUsers();
      fetchDashboardStats(); // Refresh stats
      
      // Show success message briefly
      setSubmitMessage({ type: 'success', text: result.message });
      setTimeout(() => {
        setSubmitMessage({ type: '', text: '' });
      }, 3000);
    } else {
      setSubmitMessage({ type: 'error', text: result.message });
    }
    
    setLoadingUsers(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setSelectedUser(null);
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800';
      case 'MANAGER': return 'bg-blue-100 text-blue-800';
      case 'RECEPTIONIST': return 'bg-green-100 text-green-800';
      case 'HOUSEKEEPING': return 'bg-yellow-100 text-yellow-800';
      case 'GUEST': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
                            <button className="text-blue-600 hover:text-blue-800 mr-3">
                              <Edit className="w-4 h-4 inline" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <button 
                    onClick={handleAddUserClick}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </button>
                </div>

                {/* Search and Filter Section */}
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search Input */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Search className="w-4 h-4 inline mr-2" />
                        Search Users
                      </label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search by name, email, username, or NIC..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Role Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Filter className="w-4 h-4 inline mr-2" />
                        Filter by Role
                      </label>
                      <select
                        value={roleFilter}
                        onChange={handleRoleFilterChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Roles</option>
                        {USER_ROLES.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {(searchQuery || roleFilter) && (
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-600">Active filters:</span>
                      {searchQuery && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          Search: "{searchQuery}"
                        </span>
                      )}
                      {roleFilter && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          Role: {roleFilter}
                        </span>
                      )}
                      <button
                        onClick={clearFilters}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>

                {/* Users Table */}
                {loadingUsers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading users...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p>No users found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map((userItem) => (
                          <tr key={userItem.user_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{userItem.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{userItem.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{userItem.username}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(userItem.role)}`}>
                                {userItem.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {userItem.branch_name || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{userItem.phone || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(userItem.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <button 
                                onClick={() => handleEditUserClick(userItem)}
                                className="text-blue-600 hover:text-blue-800 mr-3" 
                                title="Edit"
                              >
                                <Edit className="w-4 h-4 inline" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUserClick(userItem)}
                                className="text-red-600 hover:text-red-800" 
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 inline" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-4 text-sm text-gray-600 text-center">
                      Showing {users.length} user{users.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}
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

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitUser} className="p-6">
                {submitMessage.text && (
                  <div className={`mb-4 p-4 rounded-lg ${
                    submitMessage.type === 'success' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {submitMessage.text}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={userFormData.name}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="John Doe"
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={userFormData.email}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="john@example.com"
                    />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={userFormData.phone}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1234567890"
                    />
                  </div>

                  {/* NIC */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NIC Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nic_no"
                      value={userFormData.nic_no}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.nic_no ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="123456789V"
                    />
                    {formErrors.nic_no && <p className="text-red-500 text-xs mt-1">{formErrors.nic_no}</p>}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={userFormData.username}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.username ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="johndoe"
                    />
                    {formErrors.username && <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={userFormData.password}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Min. 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role"
                      value={userFormData.role}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.role ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Role</option>
                      {USER_ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    {formErrors.role && <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>}
                  </div>

                  {/* Branch (only for non-guest roles) */}
                  {userFormData.role && userFormData.role !== 'GUEST' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Branch <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="branch_id"
                        value={userFormData.branch_id}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.branch_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch.branch_id} value={branch.branch_id}>
                            {branch.branch_name}
                          </option>
                        ))}
                      </select>
                      {formErrors.branch_id && <p className="text-red-500 text-xs mt-1">{formErrors.branch_id}</p>}
                    </div>
                  )}

                  {/* Hire Date (optional for staff) */}
                  {userFormData.role && userFormData.role !== 'GUEST' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hire Date
                      </label>
                      <input
                        type="date"
                        name="hire_date"
                        value={userFormData.hire_date}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {/* Salary (optional for staff) */}
                  {userFormData.role && userFormData.role !== 'GUEST' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Salary
                      </label>
                      <input
                        type="number"
                        name="salary"
                        value={userFormData.salary}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="50000"
                        step="0.01"
                      />
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loadingUsers}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
                  >
                    {loadingUsers ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create User
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
                <button
                  onClick={() => {
                    setShowEditUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitEditUser} className="p-6">
                {submitMessage.text && (
                  <div className={`mb-4 p-4 rounded-lg ${
                    submitMessage.type === 'success' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {submitMessage.text}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={userFormData.name}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={userFormData.email}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={userFormData.phone}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* NIC */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NIC Number
                    </label>
                    <input
                      type="text"
                      name="nic_no"
                      value={userFormData.nic_no}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled
                      title="NIC cannot be changed"
                    />
                    <p className="text-xs text-gray-500 mt-1">NIC cannot be modified</p>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={userFormData.username}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.username ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.username && <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>}
                  </div>

                  {/* Password Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm">
                      Password cannot be changed here
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Use password reset feature</p>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role"
                      value={userFormData.role}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.role ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Role</option>
                      {USER_ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    {formErrors.role && <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>}
                  </div>

                  {/* Branch (only for non-guest roles) */}
                  {userFormData.role && userFormData.role !== 'GUEST' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Branch <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="branch_id"
                        value={userFormData.branch_id}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.branch_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch.branch_id} value={branch.branch_id}>
                            {branch.branch_name}
                          </option>
                        ))}
                      </select>
                      {formErrors.branch_id && <p className="text-red-500 text-xs mt-1">{formErrors.branch_id}</p>}
                    </div>
                  )}

                  {/* Hire Date (optional for staff) */}
                  {userFormData.role && userFormData.role !== 'GUEST' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hire Date
                      </label>
                      <input
                        type="date"
                        name="hire_date"
                        value={userFormData.hire_date}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {/* Salary (optional for staff) */}
                  {userFormData.role && userFormData.role !== 'GUEST' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Salary
                      </label>
                      <input
                        type="number"
                        name="salary"
                        value={userFormData.salary}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        step="0.01"
                      />
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditUserModal(false);
                      setSelectedUser(null);
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loadingUsers}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
                  >
                    {loadingUsers ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Update User
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Delete User
                </h2>
                
                <p className="text-gray-600 text-center mb-4">
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedUser.name}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Role:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                {submitMessage.text && submitMessage.type === 'error' && (
                  <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 border border-red-200 text-sm">
                    {submitMessage.text}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleCancelDelete}
                    disabled={loadingUsers}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={loadingUsers}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loadingUsers ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
