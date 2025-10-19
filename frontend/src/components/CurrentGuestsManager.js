import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Bed, 
  Mail, 
  Calendar,
  MapPin,
  RefreshCw,
  X,
  ShoppingCart,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import bookingService from '../services/bookingService';
import serviceService from '../services/serviceService';
import paymentService from '../services/paymentService';

/**
 * Current Guests Manager Component
 * Shows checked-in guests, allows adding services and marking payments
 */
const CurrentGuestsManager = ({ user }) => {
  const [currentGuests, setCurrentGuests] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Service modal state
  const [selectedService, setSelectedService] = useState('');
  const [serviceQuantity, setServiceQuantity] = useState(1);
  const [addingService, setAddingService] = useState(false);
  
  // Payment modal state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchCurrentGuests();
    fetchServices();
  }, []);

  const fetchCurrentGuests = async () => {
    setLoading(true);
    try {
      // Fetch all checked-in bookings (backend filters by branch automatically)
      const result = await bookingService.getAllBookings({ status: 'checked_in' });
      
      console.log('Current guests API result:', result);
      
      if (result.success && Array.isArray(result.bookings)) {
        setCurrentGuests(result.bookings);
      } else {
        console.error('Failed to fetch current guests:', result.message);
        setCurrentGuests([]);
      }
    } catch (error) {
      console.error('Error fetching current guests:', error);
      setCurrentGuests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const result = await serviceService.getAllServices();
      if (result.success && Array.isArray(result.services)) {
        setServices(result.services.filter(s => s.is_active));
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCurrentGuests();
    setRefreshing(false);
  };

  const openServiceModal = (booking) => {
    setSelectedBooking(booking);
    setSelectedService('');
    setServiceQuantity(1);
    setShowServiceModal(true);
  };

  const openPaymentModal = (booking) => {
    setSelectedBooking(booking);
    setPaymentAmount('');
    setPaymentMethod('cash');
    setShowPaymentModal(true);
  };

  const handleAddService = async () => {
    if (!selectedService || serviceQuantity < 1) {
      alert('Please select a service and enter a valid quantity');
      return;
    }

    setAddingService(true);
    try {
      const result = await serviceService.addServiceToBooking(
        selectedBooking.booking_id,
        selectedService,
        serviceQuantity
      );

      if (result.success) {
        alert(`✅ Service added successfully!\n\nService has been added to guest's bill.`);
        setShowServiceModal(false);
        fetchCurrentGuests(); // Refresh to show updated bill
      } else {
        alert(`❌ Failed to add service: ${result.message}`);
      }
    } catch (error) {
      console.error('Error adding service:', error);
      alert('❌ An error occurred while adding the service.');
    } finally {
      setAddingService(false);
    }
  };

  const handleMarkPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (!window.confirm(`Confirm payment of $${paymentAmount}?\n\nGuest: ${selectedBooking.user_name}\nMethod: ${paymentMethod.toUpperCase()}`)) {
      return;
    }

    setProcessingPayment(true);
    try {
      const result = await paymentService.markPayment(
        selectedBooking.booking_id,
        parseFloat(paymentAmount),
        paymentMethod
      );

      if (result.success) {
        alert(`✅ Payment recorded successfully!\n\nAmount: $${paymentAmount}\nMethod: ${paymentMethod.toUpperCase()}`);
        setShowPaymentModal(false);
        fetchCurrentGuests(); // Refresh to show updated payment status
      } else {
        alert(`❌ Failed to record payment: ${result.message}`);
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('❌ An error occurred while recording the payment.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const filterGuestsBySearch = (guests) => {
    if (!Array.isArray(guests)) return [];
    if (!searchQuery) return guests;
    
    const query = searchQuery.toLowerCase();
    return guests.filter(booking => 
      booking.user_name?.toLowerCase().includes(query) ||
      booking.user_email?.toLowerCase().includes(query) ||
      booking.room_no?.toString().includes(query) ||
      booking.room_type?.toLowerCase().includes(query)
    );
  };

  const getSelectedServiceDetails = () => {
    if (!selectedService) return null;
    return services.find(s => s.service_id === selectedService);
  };

  const calculateServiceTotal = () => {
    const service = getSelectedServiceDetails();
    if (!service) return 0;
    return parseFloat(service.unit_price) * serviceQuantity;
  };

  const filteredGuests = filterGuestsBySearch(currentGuests);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading current guests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Users className="w-8 h-8 mr-3 text-blue-600" />
              Current Guests
            </h2>
            <p className="text-gray-600">Manage checked-in guests, services, and payments</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Current Guests</p>
              <p className="text-3xl font-bold text-gray-900">{Array.isArray(currentGuests) ? currentGuests.length : 0}</p>
              <p className="text-xs text-gray-500 mt-1">Currently checked in</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Search Results</p>
              <p className="text-3xl font-bold text-gray-900">{Array.isArray(filteredGuests) ? filteredGuests.length : 0}</p>
              <p className="text-xs text-gray-500 mt-1">Matching criteria</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Search className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Available Services</p>
              <p className="text-3xl font-bold text-gray-900">{services.length}</p>
              <p className="text-xs text-gray-500 mt-1">In catalogue</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <ShoppingCart className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by guest name, email, room number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
        </div>
      </div>

      {/* Current Guests List */}
      {!Array.isArray(filteredGuests) || filteredGuests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Current Guests</h3>
          <p className="text-gray-500">
            {searchQuery
              ? 'No guests match your search criteria.'
              : 'No guests are currently checked in.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredGuests.map((booking) => (
            <div
              key={booking.booking_id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                {/* Guest Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {booking.user_name}
                    </h3>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {booking.user_email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openServiceModal(booking)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      Add Service
                    </button>
                    <button
                      onClick={() => openPaymentModal(booking)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      <DollarSign className="w-5 h-5" />
                      Mark Payment
                    </button>
                  </div>
                </div>

                {/* Guest Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Room Info */}
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Bed className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Room</p>
                      <p className="font-semibold text-gray-900">
                        {booking.room_no} - {booking.room_type}
                      </p>
                    </div>
                  </div>

                  {/* Check-in Date */}
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Checked In</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(booking.checking_datetime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Check-out Date */}
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Check-out</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(booking.checkout_datetime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Branch */}
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Branch</p>
                      <p className="font-semibold text-gray-900">{booking.branch_name}</p>
                    </div>
                  </div>
                </div>

                {/* Billing Info */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Room Charges</p>
                      <p className="text-xl font-bold text-gray-900">
                        ${booking.total_cost ? parseFloat(booking.total_cost).toFixed(2) : '0.00'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Total Days</p>
                      <p className="text-xl font-bold text-gray-900">
                        {booking.total_days || 0} days
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Daily Rate</p>
                      <p className="text-xl font-bold text-gray-900">
                        ${booking.daily_rate ? parseFloat(booking.daily_rate).toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking ID */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Booking ID: <span className="font-mono text-gray-700">{booking.booking_id}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-purple-600" />
                  Add Service
                </h3>
                <button
                  onClick={() => setShowServiceModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Guest Info */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600">Adding service for:</p>
                <p className="font-bold text-gray-900">{selectedBooking?.user_name}</p>
                <p className="text-sm text-gray-600">Room {selectedBooking?.room_no}</p>
              </div>

              {/* Service Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Service *
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">-- Choose a service --</option>
                  {services.map((service) => (
                    <option key={service.service_id} value={service.service_id}>
                      {service.service_name} - ${parseFloat(service.unit_price).toFixed(2)} ({service.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  value={serviceQuantity}
                  onChange={(e) => setServiceQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Total Calculation */}
              {selectedService && (
                <div className="bg-purple-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total Amount:</span>
                    <span className="text-2xl font-bold text-purple-600">
                      ${calculateServiceTotal().toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    This amount will be added to the guest's bill
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowServiceModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddService}
                  disabled={!selectedService || addingService}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {addingService ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Add Service
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mark Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-green-600" />
                  Mark Payment
                </h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Guest Info */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600">Recording payment for:</p>
                <p className="font-bold text-gray-900">{selectedBooking?.user_name}</p>
                <p className="text-sm text-gray-600">Room {selectedBooking?.room_no}</p>
              </div>

              {/* Payment Amount */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                />
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_payment">Mobile Payment</option>
                </select>
              </div>

              {/* Info Message */}
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium mb-1">Important</p>
                  <p className="text-xs text-yellow-700">
                    This will record a payment transaction. Make sure to collect the payment before marking it.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkPayment}
                  disabled={!paymentAmount || processingPayment}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {processingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirm Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentGuestsManager;
