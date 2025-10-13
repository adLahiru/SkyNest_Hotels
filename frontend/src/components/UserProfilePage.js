import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Key, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

const UserProfilePage = ({ user, onUpdateUser, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dateOfBirth: user?.dateOfBirth || '',
    nationality: user?.nationality || '',
    preferences: user?.preferences || {
      newsletter: true,
      promotions: true,
      roomType: 'standard',
      smokingPreference: 'non-smoking'
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  const validateProfile = () => {
    const errors = {};
    
    if (!profileData.name.trim()) errors.name = 'Name is required';
    if (!profileData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(profileData.email)) errors.email = 'Email is invalid';
    if (profileData.phone && !/^[\+]?[\d\s\-\(\)]+$/.test(profileData.phone)) {
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

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onUpdateUser(profileData);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to update profile. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccessMessage('Password changed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to change password. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      dateOfBirth: user?.dateOfBirth || '',
      nationality: user?.nationality || '',
      preferences: user?.preferences || {
        newsletter: true,
        promotions: true,
        roomType: 'standard',
        smokingPreference: 'non-smoking'
      }
    });
    setIsEditing(false);
    setFormErrors({});
  };

  const handleCancelPasswordChange = () => {
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordForm(false);
    setPasswordErrors({});
  };

  const bookingHistory = [
    {
      id: 'BK001',
      date: '2025-09-15',
      branch: 'Sky Nest Colombo',
      room: 'Deluxe Executive Suite',
      status: 'Completed',
      amount: '$250'
    },
    {
      id: 'BK002',
      date: '2025-08-10',
      branch: 'Sky Nest Galle',
      room: 'Ocean Breeze Standard',
      status: 'Completed',
      amount: '$180'
    },
    {
      id: 'BK003',
      date: '2025-12-20',
      branch: 'Sky Nest Kandy',
      room: 'Mountain View Deluxe',
      status: 'Upcoming',
      amount: '$200'
    }
  ];

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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
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
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button 
                      onClick={handleCancelEdit}
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
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
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
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
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
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                    disabled={!isEditing}
                    className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    disabled={!isEditing}
                    rows="3"
                    className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={profileData.nationality}
                    onChange={(e) => setProfileData({...profileData, nationality: e.target.value})}
                    disabled={!isEditing}
                    className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                  />
                </div>
              </div>

              {/* Preferences */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Preferences</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Room Type
                    </label>
                    <select
                      value={profileData.preferences.roomType}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        preferences: {...profileData.preferences, roomType: e.target.value}
                      })}
                      disabled={!isEditing}
                      className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                    >
                      <option value="standard">Standard</option>
                      <option value="deluxe">Deluxe</option>
                      <option value="suite">Suite</option>
                      <option value="presidential">Presidential</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Smoking Preference
                    </label>
                    <select
                      value={profileData.preferences.smokingPreference}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        preferences: {...profileData.preferences, smokingPreference: e.target.value}
                      })}
                      disabled={!isEditing}
                      className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                    >
                      <option value="non-smoking">Non-Smoking</option>
                      <option value="smoking">Smoking</option>
                      <option value="no-preference">No Preference</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profileData.preferences.newsletter}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        preferences: {...profileData.preferences, newsletter: e.target.checked}
                      })}
                      disabled={!isEditing}
                      className="rounded text-amber-600 mr-3"
                    />
                    <span className="text-sm text-gray-700">Subscribe to newsletter</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profileData.preferences.promotions}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        preferences: {...profileData.preferences, promotions: e.target.checked}
                      })}
                      disabled={!isEditing}
                      className="rounded text-amber-600 mr-3"
                    />
                    <span className="text-sm text-gray-700">Receive promotional offers</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Avatar & Actions */}
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-12 h-12 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{user?.name}</h3>
              <p className="text-gray-600 text-sm mb-6">{user?.email}</p>
              
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

            {/* Booking History */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Bookings</h3>
              
              <div className="space-y-4">
                {bookingHistory.map((booking, index) => (
                  <div key={booking.id} className="border-l-4 border-amber-500 pl-4 py-2">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{booking.branch}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                        booking.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{booking.room}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{booking.date}</span>
                      <span className="font-medium">{booking.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Change Password
                </button>
                <button 
                  onClick={handleCancelPasswordChange}
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