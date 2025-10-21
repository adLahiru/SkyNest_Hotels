import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Phone, Calendar, DoorOpen, Search, Filter, LogOut, FileText, CheckCircle, AlertCircle, DollarSign, X } from 'lucide-react';
import dashboardService from '../services/dashboardService';
import bookingService from '../services/bookingService';
import BillDetails from './BillDetails';

const CurrentGuestsManager = ({ user, onBack }) => {
  const [currentGuests, setCurrentGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoom, setFilterRoom] = useState('all');
  const [processingBookingId, setProcessingBookingId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [checkoutValidation, setCheckoutValidation] = useState({});
  const [selectedBillBookingId, setSelectedBillBookingId] = useState(null);

  useEffect(() => {
    fetchCurrentGuests();
  }, []);

  const fetchCurrentGuests = async () => {
    setLoading(true);
    const result = await dashboardService.getReceptionistStats();
    if (result.success) {
      setCurrentGuests(result.data.currentGuests || []);
    }
    setLoading(false);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const validateCheckout = async (bookingId) => {
    const result = await bookingService.validateCheckout(bookingId);
    setCheckoutValidation(prev => ({
      ...prev,
      [bookingId]: result
    }));
    return result;
  };

  const handleCheckout = async (bookingId) => {
    if (processingBookingId) return;

    // Validate checkout first
    const validation = await validateCheckout(bookingId);
    
    if (!validation.canCheckout) {
      showNotification(validation.message || 'Cannot checkout: Payment incomplete', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to check out this guest? Make sure all bills are settled.')) {
      return;
    }

    setProcessingBookingId(bookingId);
    try {
      const result = await bookingService.checkOutBooking(bookingId);
      if (result.success) {
        showNotification('Guest checked out successfully!', 'success');
        await fetchCurrentGuests();
      } else {
        showNotification(result.message || 'Failed to check out guest', 'error');
      }
    } catch (error) {
      showNotification('An error occurred during checkout', 'error');
      console.error('Checkout error:', error);
    } finally {
      setProcessingBookingId(null);
    }
  };

  const handleViewBill = (bookingId) => {
    setSelectedBillBookingId(bookingId);
  };

  const closeBillModal = () => {
    setSelectedBillBookingId(null);
  };

  const filteredGuests = currentGuests.filter(guest => {
    const matchesSearch = guest.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.room_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRoom === 'all' || guest.room_number.includes(filterRoom);
    return matchesSearch && matchesFilter;
  });

  const roomNumbers = [...new Set(currentGuests.map(g => g.room_number))].sort();

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

        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Current Guests</h1>
          <p className="text-gray-600">Manage currently checked-in guests</p>
        </div>

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
                value={filterRoom}
                onChange={(e) => setFilterRoom(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Rooms</option>
                {roomNumbers.map(room => (
                  <option key={room} value={room}>Room {room}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Guests</p>
                <p className="text-3xl font-bold text-gray-900">{currentGuests.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <User className="w-8 h-8 text-green-600" />
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
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Checking Out Today</p>
                <p className="text-3xl font-bold text-gray-900">
                  {currentGuests.filter(g => {
                    const checkoutDate = new Date(g.check_out).toDateString();
                    const today = new Date().toDateString();
                    return checkoutDate === today;
                  }).length}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <LogOut className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Checked-In Guests</h2>
          {filteredGuests.length > 0 ? (
            <div className="space-y-4">
              {filteredGuests.map((guest) => {
                const checkoutDate = new Date(guest.check_out).toDateString();
                const today = new Date().toDateString();
                const isCheckingOutToday = checkoutDate === today;

                return (
                  <div
                    key={guest.booking_id}
                    className={(isCheckingOutToday ? 'border-orange-300 bg-orange-50' : 'border-gray-200') + ' border rounded-lg p-6 hover:shadow-md transition-shadow'}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      <div className="lg:col-span-2">
                        <div className="flex items-start gap-4">
                          <div className={(isCheckingOutToday ? 'bg-orange-100' : 'bg-green-100') + ' p-3 rounded-full'}>
                            <User className={(isCheckingOutToday ? 'text-orange-600' : 'text-green-600') + ' w-6 h-6'} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">{guest.guest_name}</h3>
                              {isCheckingOutToday && (
                                <span className="px-2 py-1 text-xs font-semibold bg-orange-200 text-orange-800 rounded-full">
                                  Checking Out Today
                                </span>
                              )}
                            </div>
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

                      <div className="lg:col-span-1">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Checked-in</p>
                              <p className="font-medium text-gray-900">
                                {new Date(guest.check_in).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Check-out</p>
                              <p className={(isCheckingOutToday ? 'text-orange-600' : 'text-gray-900') + ' font-medium'}>
                                {new Date(guest.check_out).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm">
                            <p className="text-xs text-gray-500">Days Stayed</p>
                            <p className="font-semibold text-blue-600">
                              {Math.ceil((new Date() - new Date(guest.check_in)) / (1000 * 60 * 60 * 24))} days
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-1 flex flex-col gap-2 justify-center">
                        <button
                          onClick={() => handleViewBill(guest.booking_id)}
                          disabled={processingBookingId}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FileText className="w-4 h-4" />
                          View Bill
                        </button>
                        <button
                          onClick={() => handleCheckout(guest.booking_id)}
                          disabled={processingBookingId === guest.booking_id}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingBookingId === guest.booking_id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <LogOut className="w-4 h-4" />
                              Check Out
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">No current guests found</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm || filterRoom !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No guests are currently checked in'}
              </p>
            </div>
          )}
        </div>

        {/* Bill Modal */}
        {selectedBillBookingId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Bill Details</h2>
                <button
                  onClick={closeBillModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                <BillDetails 
                  bookingId={selectedBillBookingId} 
                  onBillGenerated={() => {
                    showNotification('Bill generated successfully!', 'success');
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentGuestsManager;
