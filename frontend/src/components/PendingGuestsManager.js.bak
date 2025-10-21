import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, User, Phone, Calendar, DoorOpen, Search, Filter, AlertCircle } from 'lucide-react';
import dashboardService from '../services/dashboardService';
import bookingService from '../services/bookingService';

const PendingGuestsManager = ({ onBack }) => {
  const [pendingGuests, setPendingGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [processingBookingId, setProcessingBookingId] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchPendingGuests();
  }, []);

  const fetchPendingGuests = async () => {
    setLoading(true);
    const result = await dashboardService.getReceptionistStats();
    if (result.success) {
      setPendingGuests(result.data.pendingBookings || []);
    }
    setLoading(false);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleConfirm = async (bookingId) => {
    if (processingBookingId) return;
    
    if (!window.confirm('Are you sure you want to confirm this booking?')) {
      return;
    }

    setProcessingBookingId(bookingId);
    try {
      const result = await bookingService.confirmBooking(bookingId);
      if (result.success) {
        showNotification('Booking confirmed successfully!', 'success');
        await fetchPendingGuests();
      } else {
        showNotification(result.message || 'Failed to confirm booking', 'error');
      }
    } catch (error) {
      showNotification('An error occurred while confirming the booking', 'error');
      console.error('Confirm error:', error);
    } finally {
      setProcessingBookingId(null);
    }
  };

  const handleCancel = async (bookingId) => {
    if (processingBookingId) return;
    
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    setProcessingBookingId(bookingId);
    try {
      const result = await bookingService.cancelBooking(bookingId);
      if (result.success) {
        showNotification('Booking cancelled successfully', 'success');
        await fetchPendingGuests();
      } else {
        showNotification(result.message || 'Failed to cancel booking', 'error');
      }
    } catch (error) {
      showNotification('An error occurred while cancelling the booking', 'error');
      console.error('Cancel error:', error);
    } finally {
      setProcessingBookingId(null);
    }
  };

  const filteredGuests = pendingGuests.filter(guest => {
    const matchesSearch = guest.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.room_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || guest.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-28 px-8">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-28 px-8 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-24 right-8 z-50 max-w-md rounded-lg shadow-lg p-4 ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white animate-slide-in`}>
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
              <p className="font-medium">{notification.message}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Pending Guests</h1>
          <p className="text-gray-600">Manage pending bookings and confirmations</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by guest name or room number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Pending</p>
                <p className="text-3xl font-bold text-gray-900">{pendingGuests.length}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <User className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Filtered Results</p>
                <p className="text-3xl font-bold text-gray-900">{filteredGuests.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Filter className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Ready to Check-in</p>
                <p className="text-3xl font-bold text-gray-900">
                  {pendingGuests.filter(g => new Date(g.check_in) <= new Date()).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Guests List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Pending Bookings</h2>
          {filteredGuests.length > 0 ? (
            <div className="space-y-4">
              {filteredGuests.map((guest) => (
                <div
                  key={guest.booking_id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Guest Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {guest.guest_name}
                          </h3>
                          {guest.guest_phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <Phone className="w-4 h-4" />
                              {guest.guest_phone}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DoorOpen className="w-4 h-4" />
                            Room {guest.room_number} - {guest.room_type}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="lg:col-span-1">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Check-in</p>
                            <p className="font-medium text-gray-900">
                              {new Date(guest.check_in).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Check-out</p>
                            <p className="font-medium text-gray-900">
                              {new Date(guest.check_out).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {guest.total_amount && (
                          <div className="text-sm">
                            <p className="text-xs text-gray-500">Total Amount</p>
                            <p className="font-semibold text-blue-600">
                              ${Number(guest.total_amount).toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-1 flex flex-col gap-2 justify-center">
                      <button
                        onClick={() => handleConfirm(guest.booking_id)}
                        disabled={processingBookingId === guest.booking_id}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingBookingId === guest.booking_id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Confirm Booking
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleCancel(guest.booking_id)}
                        disabled={processingBookingId === guest.booking_id}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingBookingId === guest.booking_id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            Cancel Booking
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">No pending guests found</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'All bookings are confirmed or there are no pending bookings'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingGuestsManager;
