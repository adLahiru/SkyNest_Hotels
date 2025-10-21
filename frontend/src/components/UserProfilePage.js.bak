import React, { useState, useEffect } from 'react';
import { User, Edit, Save, X, Key, Eye, EyeOff, CheckCircle, AlertCircle, Calendar, Clock } from 'lucide-react';
import userService from '../services/userService';
import bookingService from '../services/bookingService';

const UserProfilePage = ({ user, onUpdateUser, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [fullUserData, setFullUserData] = useState(null);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    nic_no: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const result = await userService.getCurrentUserProfile();
        
        if (result.success && result.user) {
          setFullUserData(result.user);
          setProfileData({
            name: result.user.name || '',
            email: result.user.email || '',
            phone: result.user.phone || '',
            username: result.user.username || '',
            nic_no: result.user.nic_no || ''
          });
        } else {
          setErrorMessage(result.message || 'Failed to load profile');
        }
      } catch (error) {
        setErrorMessage('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const validateProfile = () => {
    const errors = {};
    
    if (!profileData.name.trim()) errors.name = 'Name is required';
    if (!profileData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(profileData.email)) errors.email = 'Email is invalid';
    if (!profileData.username.trim()) errors.username = 'Username is required';
    else if (profileData.username.length < 3) errors.username = 'Username must be at least 3 characters';
    if (profileData.phone && !/^[+]?[\d\s\-()]+$/.test(profileData.phone)) {
      errors.phone = 'Phone number is invalid';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordData.newPassword) errors.newPassword = 'New password is required';
    else if (passwordData.newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters';
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;

    setIsSaving(true);
    setErrorMessage('');
    
    try {
      const result = await userService.updateProfile(profileData);
      
      if (result.success) {
        setFullUserData(result.user);
        onUpdateUser(result.user);
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(result.message || 'Failed to update profile');
      }
    } catch (error) {
      setErrorMessage('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setIsChangingPassword(true);
    setErrorMessage('');
    
    try {
      const result = await userService.changePassword(passwordData);
      
      if (result.success) {
        setShowPasswordForm(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setSuccessMessage(result.message || 'Password changed successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(result.message || 'Failed to change password');
      }
    } catch (error) {
      setErrorMessage('Failed to change password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCancelEdit = () => {
    if (fullUserData) {
      setProfileData({
        name: fullUserData.name || '',
        email: fullUserData.email || '',
        phone: fullUserData.phone || '',
        username: fullUserData.username || '',
        nic_no: fullUserData.nic_no || ''
      });
    }
    setIsEditing(false);
    setFormErrors({});
    setErrorMessage('');
  };

  const handleCancelPasswordChange = () => {
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordForm(false);
    setPasswordErrors({});
  };

  // User's actual bookings from database
  const [userBookings, setUserBookings] = useState([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);

  useEffect(() => {
    const fetchUserBookings = async () => {
      setIsBookingsLoading(true);
      try {
        const result = await bookingService.getMyBookings();
        if (result.success) {
          setUserBookings(result.bookings);
        } else {
          setUserBookings([]);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setUserBookings([]);
      } finally {
        setIsBookingsLoading(false);
      }
    };
    fetchUserBookings();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 pt-32">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-light text-gray-800 mb-4">My Profile</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="alert-success flex items-center">
              <CheckCircle className="w-5 h-5 mr-3" />
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="alert-error flex items-center">
              <AlertCircle className="w-5 h-5 mr-3" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                  <User className="w-6 h-6 mr-3 text-amber-600" />
                  Profile Information
                </h2>
                
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        isSaving 
                          ? 'bg-gray-400 cursor-not-allowed text-white' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <div className="spinner-small mr-2"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save</span>
                        </>
                      )}
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    disabled={!isEditing}
                    className={`form-input ${!isEditing ? 'bg-gray-50' : ''} ${formErrors.name ? 'border-red-500' : ''}`}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                    disabled={!isEditing}
                    className={`form-input ${!isEditing ? 'bg-gray-50' : ''} ${formErrors.username ? 'border-red-500' : ''}`}
                  />
                  {formErrors.username && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    disabled={!isEditing}
                    className={`form-input ${!isEditing ? 'bg-gray-50' : ''} ${formErrors.email ? 'border-red-500' : ''}`}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    disabled={!isEditing}
                    className={`form-input ${!isEditing ? 'bg-gray-50' : ''} ${formErrors.phone ? 'border-red-500' : ''}`}
                    placeholder="+94 XX XXX XXXX"
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIC / Passport Number
                  </label>
                  <input
                    type="text"
                    value={profileData.nic_no}
                    onChange={(e) => setProfileData({...profileData, nic_no: e.target.value})}
                    disabled={!isEditing}
                    className={`form-input ${!isEditing ? 'bg-gray-50' : ''} ${formErrors.nic_no ? 'border-red-500' : ''}`}
                    placeholder="Enter your NIC or Passport number"
                  />
                  {formErrors.nic_no && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.nic_no}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Profile Avatar & Actions */}
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-12 h-12 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{fullUserData?.name || user?.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{fullUserData?.email || user?.email}</p>
              {fullUserData?.username && (
                <p className="text-gray-500 text-xs mb-6">@{fullUserData.username}</p>
              )}
              
              <div className="space-y-3">
                <button 
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Key className="w-4 h-4" />
                  <span>Change Password</span>
                </button>
                
                <button 
                  onClick={onLogout}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Booking History - Full Width Section */}
        <div className="mt-8">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-800 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-amber-600" />
                My Bookings
              </h3>
              {!isBookingsLoading && userBookings.length > 0 && (
                <span className="text-sm text-gray-500">
                  Total: {userBookings.length} booking{userBookings.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {isBookingsLoading ? (
              <div className="text-center text-gray-500 py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mb-4"></div>
                <p>Loading bookings...</p>
              </div>
            ) : userBookings.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No bookings found.</p>
                <p className="text-sm mt-2">Start your journey by booking a room!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userBookings.map((booking) => {
                  // Map backend status to user-friendly label and color
                  let statusLabel = '';
                  let statusColor = '';
                  let statusBgColor = '';
                  switch (booking.booking_status) {
                    case 'confirmed':
                      statusLabel = 'Confirmed';
                      statusColor = 'text-blue-800';
                      statusBgColor = 'bg-blue-100';
                      break;
                    case 'checked_in':
                      statusLabel = 'Checked In';
                      statusColor = 'text-green-800';
                      statusBgColor = 'bg-green-100';
                      break;
                    case 'checked_out':
                      statusLabel = 'Checked Out';
                      statusColor = 'text-gray-800';
                      statusBgColor = 'bg-gray-200';
                      break;
                    case 'cancelled':
                      statusLabel = 'Cancelled';
                      statusColor = 'text-red-800';
                      statusBgColor = 'bg-red-100';
                      break;
                    default:
                      statusLabel = booking.booking_status || 'Status';
                      statusColor = 'text-gray-800';
                      statusBgColor = 'bg-gray-100';
                  }

                  // Calculate number of nights
                  const checkIn = new Date(booking.checking_datetime);
                  const checkOut = new Date(booking.checkout_datetime);
                  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

                  return (
                    <div 
                      key={booking.booking_id} 
                      className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Left Section - Branch & Room Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-800 mb-1">
                                {booking.branch_name || 'Branch'}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Room {booking.room_no || 'N/A'} - {booking.room_type || 'N/A'}
                              </p>
                            </div>
                            <span className={`${statusBgColor} ${statusColor} px-3 py-1 rounded-full text-xs font-semibold`}>
                              {statusLabel}
                            </span>
                          </div>

                          {/* Date Information */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="flex items-start space-x-2">
                              <Calendar className="w-4 h-4 text-amber-600 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500">Check-in</p>
                                <p className="text-sm font-medium text-gray-800">
                                  {booking.checking_datetime 
                                    ? new Date(booking.checking_datetime).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        year: 'numeric' 
                                      })
                                    : 'N/A'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start space-x-2">
                              <Calendar className="w-4 h-4 text-amber-600 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500">Check-out</p>
                                <p className="text-sm font-medium text-gray-800">
                                  {booking.checkout_datetime 
                                    ? new Date(booking.checkout_datetime).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        year: 'numeric' 
                                      })
                                    : 'N/A'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start space-x-2">
                              <Clock className="w-4 h-4 text-amber-600 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500">Duration</p>
                                <p className="text-sm font-medium text-gray-800">
                                  {nights} night{nights !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Section - Pricing */}
                        <div className="md:text-right md:ml-6 border-t md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0">
                          <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                          <p className="text-2xl font-bold text-amber-600">
                            LKR {typeof booking.total_cost !== 'undefined' ? booking.total_cost.toLocaleString() : '0'}
                          </p>
                          {booking.daily_rate && (
                            <p className="text-xs text-gray-500 mt-1">
                              LKR {booking.daily_rate.toLocaleString()}/night
                            </p>
                          )}
                          {booking.booking_date && (
                            <p className="text-xs text-gray-400 mt-2">
                              Booked on {new Date(booking.booking_date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Booking ID at the bottom */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                          Booking ID: #{booking.booking_id}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Change Password</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className={`form-input pr-10 ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className={`form-input pr-10 ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className={`form-input pr-10 ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button 
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center ${
                    isChangingPassword 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isChangingPassword ? (
                    <>
                      <div className="spinner-small mr-2"></div>
                      <span>Changing...</span>
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
                <button 
                  onClick={handleCancelPasswordChange}
                  disabled={isChangingPassword}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;