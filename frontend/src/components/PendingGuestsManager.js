import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  UserCheck, 
  Calendar, 
  MapPin, 
  Mail, 
  Users, 
  Bed,
  AlertCircle,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import bookingService from '../services/bookingService';

/**
 * Pending Guests Manager Component
 * Shows confirmed bookings awaiting check-in for Managers and Receptionists
 * Allows staff to check in guests and mark rooms as occupied
 */
const PendingGuestsManager = ({ user }) => {
  const [pendingGuests, setPendingGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingCheckIn, setProcessingCheckIn] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('all'); // all, today, upcoming
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPendingGuests();
  }, []);

  const fetchPendingGuests = async () => {
    setLoading(true);
    try {
      // Fetch all confirmed bookings (backend filters by branch automatically)
      // Managers/Receptionists only see bookings in their branch
      // Guests only see their own bookings
      const result = await bookingService.getAllBookings({ status: 'confirmed' });
      
      console.log('Pending guests API result:', result);
      console.log('Bookings received:', result.bookings);
      
      if (result.success && Array.isArray(result.bookings)) {
        setPendingGuests(result.bookings);
      } else {
        console.error('Failed to fetch pending guests:', result.message);
        setPendingGuests([]);
      }
    } catch (error) {
      console.error('Error fetching pending guests:', error);
      setPendingGuests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPendingGuests();
    setRefreshing(false);
  };

  const handleCheckIn = async (booking) => {
    if (!window.confirm(`Confirm check-in for ${booking.user_name}?\n\nRoom ${booking.room_no} will be marked as OCCUPIED.`)) {
      return;
    }

    setProcessingCheckIn(prev => ({ ...prev, [booking.booking_id]: true }));

    try {
      const result = await bookingService.checkInBooking(booking.booking_id);
      
      if (result.success) {
        alert(`✅ Check-in successful!\n\nGuest: ${booking.user_name}\nRoom ${booking.room_no} is now OCCUPIED.`);
        
        // Remove the booking from pending list
        setPendingGuests(prev => prev.filter(b => b.booking_id !== booking.booking_id));
      } else {
        alert(`❌ Check-in failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Check-in error:', error);
      alert('❌ An error occurred during check-in. Please try again.');
    } finally {
      setProcessingCheckIn(prev => ({ ...prev, [booking.booking_id]: false }));
    }
  };

  const filterGuestsByDate = (guests) => {
    // Defensive check: ensure guests is an array
    if (!Array.isArray(guests)) {
      console.warn('filterGuestsByDate received non-array:', guests);
      return [];
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return guests.filter(booking => {
      const checkInDate = new Date(booking.checking_datetime);
      checkInDate.setHours(0, 0, 0, 0);
      
      if (filterDate === 'today') {
        return checkInDate.getTime() === today.getTime();
      } else if (filterDate === 'upcoming') {
        return checkInDate > today;
      }
      return true; // 'all'
    });
  };

  const filterGuestsBySearch = (guests) => {
    // Defensive check: ensure guests is an array
    if (!Array.isArray(guests)) {
      console.warn('filterGuestsBySearch received non-array:', guests);
      return [];
    }
    
    if (!searchQuery) return guests;
    
    const query = searchQuery.toLowerCase();
    return guests.filter(booking => 
      booking.user_name?.toLowerCase().includes(query) ||
      booking.user_email?.toLowerCase().includes(query) ||
      booking.room_no?.toString().includes(query) ||
      booking.room_type?.toLowerCase().includes(query)
    );
  };

  const getFilteredGuests = () => {
    // Ensure pendingGuests is always an array
    let filtered = Array.isArray(pendingGuests) ? pendingGuests : [];
    filtered = filterGuestsByDate(filtered);
    filtered = filterGuestsBySearch(filtered);
    return filtered;
  };

  const getStatusBadgeColor = (checkInDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(checkInDate);
    checkIn.setHours(0, 0, 0, 0);
    
    if (checkIn.getTime() === today.getTime()) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (checkIn < today) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusLabel = (checkInDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(checkInDate);
    checkIn.setHours(0, 0, 0, 0);
    
    if (checkIn.getTime() === today.getTime()) {
      return 'Check-in Today';
    } else if (checkIn < today) {
      return 'Overdue Check-in';
    } else {
      const daysUntil = Math.ceil((checkIn - today) / (1000 * 60 * 60 * 24));
      return `In ${daysUntil} day${daysUntil > 1 ? 's' : ''}`;
    }
  };

  const filteredGuests = getFilteredGuests();
  const todayCheckIns = Array.isArray(pendingGuests) 
    ? pendingGuests.filter(booking => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkIn = new Date(booking.checking_datetime);
        checkIn.setHours(0, 0, 0, 0);
        return checkIn.getTime() === today.getTime();
      }).length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending guests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-28 px-8 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <Clock className="w-10 h-10 mr-3 text-blue-600" />
                Pending Guests
              </h2>
              <p className="text-gray-600 text-lg">Confirmed bookings awaiting check-in</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
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
                <p className="text-gray-500 text-sm font-medium">Total Pending</p>
                <p className="text-3xl font-bold text-gray-900">{Array.isArray(pendingGuests) ? pendingGuests.length : 0}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting check-in</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Check-ins Today</p>
                <p className="text-3xl font-bold text-gray-900">{todayCheckIns}</p>
                <p className="text-xs text-gray-500 mt-1">Scheduled for today</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Filtered Results</p>
                <p className="text-3xl font-bold text-gray-900">{Array.isArray(filteredGuests) ? filteredGuests.length : 0}</p>
                <p className="text-xs text-gray-500 mt-1">Matching criteria</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Filter className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by guest name, email, room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterDate('all')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterDate === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Pending
              </button>
              <button
                onClick={() => setFilterDate('today')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterDate === 'today'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setFilterDate('upcoming')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterDate === 'upcoming'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Upcoming
              </button>
            </div>
          </div>
        </div>

        {/* Pending Guests List */}
        {!Array.isArray(filteredGuests) || filteredGuests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Pending Guests</h3>
            <p className="text-gray-500">
              {searchQuery || filterDate !== 'all'
                ? 'No guests match your search criteria.'
                : 'All guests have been checked in or no confirmed bookings.'}
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
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {booking.user_name}
                        </h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(booking.checking_datetime)}`}>
                          {getStatusLabel(booking.checking_datetime)}
                        </span>
                      </div>
                      <p className="text-gray-600 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {booking.user_email}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCheckIn(booking)}
                      disabled={processingCheckIn[booking.booking_id]}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg shadow-md hover:shadow-lg"
                    >
                      {processingCheckIn[booking.booking_id] ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-6 h-6" />
                          Check In Guest
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
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
                        <p className="text-xs text-gray-600">Check-in</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(booking.checking_datetime).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(booking.checking_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Check-out Date */}
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Check-out</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(booking.checkout_datetime).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(booking.checkout_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Guests */}
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Guests</p>
                        <p className="font-semibold text-gray-900">
                          {booking.number_of_guests || 1} {booking.number_of_guests === 1 ? 'Guest' : 'Guests'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Branch Info */}
                  {booking.branch_name && (
                    <div className="mt-4 flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{booking.branch_name}</span>
                    </div>
                  )}

                  {/* Special Requests */}
                  {booking.special_requests && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-yellow-800 mb-1">Special Requests:</p>
                          <p className="text-sm text-yellow-700">{booking.special_requests}</p>
                        </div>
                      </div>
                    </div>
                  )}

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
      </div>
    </div>
  );
};

export default PendingGuestsManager;
