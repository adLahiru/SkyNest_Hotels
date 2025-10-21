# Booking Management Tab Implementation Guide

## Backend Implementation ✅ COMPLETE

### API Endpoints Created:
1. **POST** `/api/bookings/:booking_id/services` - Add service to booking
2. **GET** `/api/bookings/:booking_id/services` - Get booking services
3. **POST** `/api/bookings/:booking_id/payments` - Process payment
4. **GET** `/api/bookings/:booking_id/payment-details` - Get payment details
5. **PATCH** `/api/bookings/:booking_id/checkin` - Check-in (already exists)
6. **PATCH** `/api/bookings/:booking_id/checkout` - Check-out (already exists)

### Frontend Service Layer ✅ COMPLETE

Functions added to `bookingService.js`:
- `addServiceToBooking(bookingId, serviceData)`
- `getBookingServices(bookingId)`
- `processBookingPayment(bookingId, paymentData)`
- `getBookingPaymentDetails(bookingId)`
- `checkInBooking(bookingId)` - Updated to use correct endpoint
- `checkOutBooking(bookingId)` - Updated to use correct endpoint

---

## Frontend AdminDashboard Implementation

### Step 1: Add Imports
Add these to the imports at the top of `AdminDashboard.js` (around line 2):

```javascript
import { Users, Building2, DollarSign, TrendingUp, Calendar, BarChart3, Plus, Edit, Trash2, Search, Filter, X, Eye, EyeOff, Home, Bed, Upload, FileText, Briefcase, MessageSquare, Mail, Phone, Clock, CheckCircle, XCircle, CreditCard, Package } from 'lucide-react';
```

Add booking service import (around line 9):

```javascript
import bookingService from '../services/bookingService';
```

### Step 2: Add State Variables
Add these state variables after the existing ones (around line 140):

```javascript
  // Booking Management states
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingFilter, setBookingFilter] = useState('confirmed'); // 'confirmed' or 'checked_in'
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelBookingModal, setShowCancelBookingModal] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [bookingServices, setBookingServices] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    service_type_id: '',
    quantity: 1
  });
  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    payment_method: 'cash'
  });
```

### Step 3: Add useEffect to Fetch Bookings
Add this useEffect after existing ones (around line 160):

```javascript
  // Fetch bookings when tab is active
  useEffect(() => {
    if (activeTab === 'booking-management') {
      fetchBookings();
    }
  }, [activeTab, bookingFilter, bookingSearchQuery]);
```

### Step 4: Add Handler Functions
Add these functions after existing handlers (around line 1460):

```javascript
  // ==================== BOOKING MANAGEMENT FUNCTIONS ====================
  
  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const result = await bookingService.getAllBookings({ 
        booking_status: bookingFilter 
      });
      
      if (result.success) {
        let filtered = result.bookings || [];
        
        // Apply search filter
        if (bookingSearchQuery) {
          const query = bookingSearchQuery.toLowerCase();
          filtered = filtered.filter(booking => 
            (booking.user_name && booking.user_name.toLowerCase().includes(query)) ||
            (booking.room_no && booking.room_no.toString().includes(query)) ||
            (booking.branch_name && booking.branch_name.toLowerCase().includes(query))
          );
        }
        
        setBookings(filtered);
      } else {
        alert('Failed to fetch bookings: ' + result.message);
      }
    } catch (error) {
      console.error('Fetch bookings error:', error);
      alert('Error fetching bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleCheckIn = async (booking) => {
    if (!window.confirm(`Check in ${booking.user_name} for Room ${booking.room_no}?`)) {
      return;
    }
    
    try {
      const result = await bookingService.checkInBooking(booking.booking_id);
      
      if (result.success) {
        alert('Check-in successful!');
        fetchBookings(); // Refresh list
      } else {
        alert('Check-in failed: ' + result.message);
      }
    } catch (error) {
      console.error('Check-in error:', error);
      alert('Error during check-in');
    }
  };

  const handleAddServiceClick = async (booking) => {
    setSelectedBooking(booking);
    
    // Fetch available services for the branch
    try {
      const result = await serviceCatalogueService.getAllServices({ 
        branch_id: booking.branch_id 
      });
      
      if (result.success) {
        setAvailableServices(result.services || []);
      }
    } catch (error) {
      console.error('Fetch services error:', error);
    }
    
    // Fetch existing booking services
    try {
      const result = await bookingService.getBookingServices(booking.booking_id);
      if (result.success) {
        setBookingServices(result.services || []);
      }
    } catch (error) {
      console.error('Fetch booking services error:', error);
    }
    
    setServiceFormData({ service_type_id: '', quantity: 1 });
    setShowAddServiceModal(true);
  };

  const handleAddService = async () => {
    if (!serviceFormData.service_type_id || serviceFormData.quantity < 1) {
      alert('Please select a service and enter valid quantity');
      return;
    }
    
    try {
      const result = await bookingService.addServiceToBooking(
        selectedBooking.booking_id,
        serviceFormData
      );
      
      if (result.success) {
        alert('Service added successfully!');
        // Refresh booking services list
        const servicesResult = await bookingService.getBookingServices(selectedBooking.booking_id);
        if (servicesResult.success) {
          setBookingServices(servicesResult.services || []);
        }
        setServiceFormData({ service_type_id: '', quantity: 1 });
      } else {
        alert('Failed to add service: ' + result.message);
      }
    } catch (error) {
      console.error('Add service error:', error);
      alert('Error adding service');
    }
  };

  const handlePaymentClick = async (booking) => {
    setSelectedBooking(booking);
    
    // Fetch payment details
    try {
      const result = await bookingService.getBookingPaymentDetails(booking.booking_id);
      if (result.success) {
        setPaymentDetails(result.payment);
        setPaymentFormData({
          amount: result.payment?.due_amount || 0,
          payment_method: 'cash'
        });
      }
    } catch (error) {
      console.error('Fetch payment details error:', error);
    }
    
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async () => {
    if (!paymentFormData.amount || paymentFormData.amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }
    
    if (paymentFormData.amount > paymentDetails.due_amount) {
      alert(`Amount cannot exceed due amount (${paymentDetails.due_amount})`);
      return;
    }
    
    try {
      const result = await bookingService.processBookingPayment(
        selectedBooking.booking_id,
        paymentFormData
      );
      
      if (result.success) {
        alert('Payment processed successfully!');
        // Refresh payment details
        const detailsResult = await bookingService.getBookingPaymentDetails(selectedBooking.booking_id);
        if (detailsResult.success) {
          setPaymentDetails(detailsResult.payment);
          setPaymentFormData({
            amount: detailsResult.payment?.due_amount || 0,
            payment_method: 'cash'
          });
        }
        fetchBookings(); // Refresh bookings list
      } else {
        alert('Payment failed: ' + result.message);
      }
    } catch (error) {
      console.error('Process payment error:', error);
      alert('Error processing payment');
    }
  };

  const handleCheckOut = async (booking) => {
    // Check if payment is complete
    const paymentResult = await bookingService.getBookingPaymentDetails(booking.booking_id);
    
    if (!paymentResult.success || !paymentResult.canCheckout) {
      alert('Cannot check out. Payment is not complete. Please ensure all dues are paid.');
      return;
    }
    
    if (!window.confirm(`Check out ${booking.user_name} from Room ${booking.room_no}?`)) {
      return;
    }
    
    try {
      const result = await bookingService.checkOutBooking(booking.booking_id);
      
      if (result.success) {
        alert('Check-out successful!');
        fetchBookings(); // Refresh list
      } else {
        alert('Check-out failed: ' + result.message);
      }
    } catch (error) {
      console.error('Check-out error:', error);
      alert('Error during check-out');
    }
  };

  const handleCancelBooking = async () => {
    try {
      const result = await bookingService.cancelBooking(selectedBooking.booking_id);
      
      if (result.success) {
        alert('Booking cancelled successfully!');
        setShowCancelBookingModal(false);
        setSelectedBooking(null);
        fetchBookings();
      } else {
        alert('Failed to cancel booking: ' + result.message);
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      alert('Error cancelling booking');
    }
  };
```

### Step 5: Add Navigation Tab
Add this button after the Messages tab button (around line 1634):

```javascript
              <button
                onClick={() => setActiveTab('booking-management')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'booking-management'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="w-5 h-5 inline-block mr-2" />
                Booking Management
              </button>
```

### Step 6: Add Tab Content
Add this section after the Messages tab content (around line 2797):

```javascript
            {/* Booking Management Tab */}
            {activeTab === 'booking-management' && (
              <div>
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Booking Management</h2>
                    <p className="text-gray-600 mt-1">
                      Manage check-ins, check-outs, services, and payments
                    </p>
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="mb-6 flex flex-wrap gap-4">
                  <button
                    onClick={() => setBookingFilter('confirmed')}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      bookingFilter === 'confirmed'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Clock className="w-4 h-4 inline-block mr-2" />
                    Pending Check-In ({bookings.filter(b => b.booking_status === 'confirmed').length})
                  </button>
                  <button
                    onClick={() => setBookingFilter('checked_in')}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      bookingFilter === 'checked_in'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 inline-block mr-2" />
                    Checked In ({bookings.filter(b => b.booking_status === 'checked_in').length})
                  </button>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by guest name, room number, or branch..."
                      value={bookingSearchQuery}
                      onChange={(e) => setBookingSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Bookings Table */}
                {loadingBookings ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading bookings...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-600">
                      No {bookingFilter === 'confirmed' ? 'pending check-ins' : 'checked-in bookings'} found
                    </p>
                  </div>
                ) : (
                  <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Booking ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Guest
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Branch
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Room
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Check-In
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Check-Out
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {bookings.map((booking) => (
                            <tr key={booking.booking_id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {booking.booking_id.substring(0, 8)}...
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {booking.user_name || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {booking.user_email || ''}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {booking.branch_name || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                Room {booking.room_no || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(booking.checking_datetime).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(booking.checkout_datetime).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  booking.booking_status === 'confirmed'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : booking.booking_status === 'checked_in'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {booking.booking_status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex flex-wrap gap-2">
                                  {booking.booking_status === 'confirmed' && (
                                    <button
                                      onClick={() => handleCheckIn(booking)}
                                      className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Check In
                                    </button>
                                  )}
                                  {booking.booking_status === 'checked_in' && (
                                    <>
                                      <button
                                        onClick={() => handleAddServiceClick(booking)}
                                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                      >
                                        <Package className="w-4 h-4 mr-1" />
                                        Add Service
                                      </button>
                                      <button
                                        onClick={() => handlePaymentClick(booking)}
                                        className="inline-flex items-center px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                                      >
                                        <CreditCard className="w-4 h-4 mr-1" />
                                        Pay
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedBooking(booking);
                                          setShowCancelBookingModal(true);
                                        }}
                                        className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                      >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleCheckOut(booking)}
                                        className="inline-flex items-center px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-900"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Check Out
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
```

### Step 7: Add Modals
Add these modals before the closing </div> of the main component (around line 5200):

```javascript
            {/* Add Service Modal */}
            {showAddServiceModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-800">
                        Add Service - {selectedBooking?.user_name} (Room {selectedBooking?.room_no})
                      </h3>
                      <button
                        onClick={() => {
                          setShowAddServiceModal(false);
                          setSelectedBooking(null);
                          setServiceFormData({ service_type_id: '', quantity: 1 });
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Existing Services */}
                    {bookingServices.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-700 mb-2">Current Services:</h4>
                        <div className="space-y-2">
                          {bookingServices.map((service, index) => (
                            <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                              <span className="text-sm">{service.service_name}</span>
                              <div className="text-sm text-gray-600">
                                Qty: {service.quantity} × ${service.unit_price} = ${service.total_price || service.total}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add New Service Form */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Service
                        </label>
                        <select
                          value={serviceFormData.service_type_id}
                          onChange={(e) => setServiceFormData({ ...serviceFormData, service_type_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Choose a service...</option>
                          {availableServices.map((service) => (
                            <option key={service.service_type_id} value={service.service_type_id}>
                              {service.service_name} - ${service.price}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={serviceFormData.quantity}
                          onChange={(e) => setServiceFormData({ ...serviceFormData, quantity: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleAddService}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Add Service
                        </button>
                        <button
                          onClick={() => {
                            setShowAddServiceModal(false);
                            setSelectedBooking(null);
                            setServiceFormData({ service_type_id: '', quantity: 1 });
                          }}
                          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && paymentDetails && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-800">
                        Process Payment
                      </h3>
                      <button
                        onClick={() => {
                          setShowPaymentModal(false);
                          setSelectedBooking(null);
                          setPaymentDetails(null);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Payment Summary */}
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Charges:</span>
                          <span className="font-semibold">${paymentDetails.total_charges}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount Paid:</span>
                          <span className="font-semibold text-green-600">${paymentDetails.amount_paid}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-700 font-medium">Due Amount:</span>
                          <span className="font-bold text-red-600">${paymentDetails.due_amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            paymentDetails.payment_status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : paymentDetails.payment_status === 'partial'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {paymentDetails.payment_status}
                          </span>
                        </div>
                      </div>

                      {/* Payment Form */}
                      {paymentDetails.due_amount > 0 && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Amount to Pay (Max: ${paymentDetails.due_amount})
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max={paymentDetails.due_amount}
                              value={paymentFormData.amount}
                              onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: parseFloat(e.target.value) || 0 })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Payment Method
                            </label>
                            <select
                              value={paymentFormData.payment_method}
                              onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_method: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="cash">Cash</option>
                              <option value="credit_card">Credit Card</option>
                              <option value="debit_card">Debit Card</option>
                              <option value="online">Online Payment</option>
                              <option value="bank_transfer">Bank Transfer</option>
                            </select>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <button
                              onClick={handleProcessPayment}
                              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                              Process Payment
                            </button>
                            <button
                              onClick={() => {
                                setShowPaymentModal(false);
                                setSelectedBooking(null);
                                setPaymentDetails(null);
                              }}
                              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      )}

                      {paymentDetails.due_amount <= 0 && (
                        <div className="text-center py-4">
                          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                          <p className="text-green-600 font-semibold">Payment Complete!</p>
                          <p className="text-sm text-gray-600 mt-1">This booking is ready for checkout.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cancel Booking Modal */}
            {showCancelBookingModal && selectedBooking && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Cancel Booking</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to cancel the booking for <strong>{selectedBooking.user_name}</strong> in Room <strong>{selected Booking.room_no}</strong>?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelBooking}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Yes, Cancel Booking
                    </button>
                    <button
                      onClick={() => {
                        setShowCancelBookingModal(false);
                        setSelectedBooking(null);
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                    >
                      No, Keep It
                    </button>
                  </div>
                </div>
              </div>
            )}
```

---

## Testing Checklist

### 1. Pending Check-Ins Tab
- [ ] View bookings with status 'confirmed'
- [ ] Click "Check In" button
- [ ] Verify booking moves to "Checked In" tab
- [ ] Verify room status updates to 'occupied' in database

### 2. Checked In Tab
- [ ] View bookings with status 'checked_in'
- [ ] Click "Add Service" button
- [ ] Select service and quantity
- [ ] Verify service added to booking_services table
- [ ] Verify total_charges updated in payments table

### 3. Payment Processing
- [ ] Click "Pay" button on checked-in booking
- [ ] View payment summary (total, paid, due)
- [ ] Enter payment amount (must be ≤ due amount)
- [ ] Select payment method
- [ ] Process payment
- [ ] Verify payment_transactions table updated
- [ ] Verify amount_paid and due_amount updated in payments table

### 4. Check-Out
- [ ] Try to check out booking with outstanding payment (should fail)
- [ ] Complete payment (due_amount = 0)
- [ ] Click "Check Out" button
- [ ] Verify booking status updates to 'checked_out'
- [ ] Verify booking disappears from "Checked In" tab
- [ ] Verify room status updates to 'available' in database

### 5. Cancel Booking
- [ ] Click "Cancel" button on checked-in booking
- [ ] Confirm cancellation
- [ ] Verify booking status updates to 'cancelled'
- [ ] Verify booking disappears from list

---

## Database Tables Used

### booking
- `booking_id` (PK)
- `user_id` (FK)
- `room_id` (FK)
- `checking_datetime`
- `checkout_datetime`
- `booking_status` (confirmed, checked_in, checked_out, cancelled)
- `branch_id` (FK)

### service_usage (or booking_services if created)
- `usage_id` or `booking_service_id` (PK)
- `booking_id` (FK)
- `service_id` or `service_type_id` (FK)
- `quantity`
- `total` or `total_price`

### payments
- `payment_id` (PK)
- `booking_id` (FK)
- `total_charges`
- `amount_paid`
- `due_amount`
- `payment_status` (pending, partial, paid)

### payment_transactions
- `transaction_id` (PK)
- `payment_id` (FK)
- `booking_id` (FK)
- `amount`
- `payment_method`
- `transaction_date`
- `processed_by_staff_id` (FK)

---

## Notes

1. **Backend Running**: Port 8084 ✅
2. **All API endpoints created and tested** ✅
3. **Frontend service functions added** ✅
4. **AdminDashboard code provided** - Need to manually add to file
5. **Icons needed**: CheckCircle, XCircle, CreditCard, Package (already imported)

The system uses the existing `service_usage` table. If you want to create the `booking_services` table, you would need to create a migration, but the backend code handles both scenarios gracefully.
