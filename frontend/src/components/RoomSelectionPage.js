import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Bed, Wifi, Coffee, Tv, Wind, Car, CheckCircle, XCircle, Calendar, Star, Loader2, AlertCircle } from 'lucide-react';
import roomService from '../services/roomService';
import roomTypeService from '../services/roomTypeService';
import bookingService from '../services/bookingService';

const RoomSelectionPage = ({ selectedBranch, onRoomSelect, onBackToBranches, isLoggedIn, onLoginRequired }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [dateFilterApplied, setDateFilterApplied] = useState(false);

  const fetchRooms = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First, fetch all rooms for the selected branch
      const roomsResponse = await roomService.getAllRoomsPublic({ branch_id: selectedBranch.id });
      
      if (!roomsResponse.success || !roomsResponse.rooms) {
        setError(roomsResponse.message || 'Failed to load rooms');
        setLoading(false);
        return;
      }

      // If dates are selected, get available room IDs
      let availableRoomIds = null;
      if (checkInDate && checkOutDate) {
        const availabilityResponse = await bookingService.getAvailableRooms({
          branch_id: selectedBranch.id,
          check_in: checkInDate,
          check_out: checkOutDate
        });
        
        if (availabilityResponse.success) {
          // Extract room IDs from the available rooms
          availableRoomIds = new Set(
            availabilityResponse.availableRooms.map(room => room.room_id)
          );
          setDateFilterApplied(true);
        }
      } else {
        setDateFilterApplied(false);
      }
      
      if (roomsResponse.success && roomsResponse.rooms) {
        // Fetch room types for each room to get detailed information
        const roomsWithDetails = await Promise.all(
          roomsResponse.rooms.map(async (room) => {
            try {
              // Use public endpoint for room types
              const roomTypeResponse = await roomTypeService.getRoomTypeByIdPublic(room.room_type_id);
              const roomType = roomTypeResponse.success ? roomTypeResponse.roomType : null;
              
              if (!roomType) {
                return null; // Skip rooms without valid room type
              }

              // Convert BLOB photo to base64 if exists
              let imageUrl = '/Images/6256702-middle.png'; // Default image
              if (roomType.photo) {
                if (typeof roomType.photo === 'string') {
                  imageUrl = roomType.photo.startsWith('data:') ? roomType.photo : `data:image/jpeg;base64,${roomType.photo}`;
                }
              }

              // Parse amenities if stored as JSON string
              let amenitiesList = [];
              if (roomType.amenities) {
                try {
                  amenitiesList = typeof roomType.amenities === 'string' 
                    ? JSON.parse(roomType.amenities) 
                    : roomType.amenities;
                } catch (e) {
                  amenitiesList = roomType.amenities.split(',').map(a => a.trim());
                }
              }

              // Map amenities to icon components
              const amenityIcons = amenitiesList.map(amenity => {
                const amenityLower = amenity.toLowerCase();
                if (amenityLower.includes('wifi') || amenityLower.includes('internet')) {
                  return { icon: Wifi, name: amenity };
                } else if (amenityLower.includes('tv') || amenityLower.includes('television')) {
                  return { icon: Tv, name: amenity };
                } else if (amenityLower.includes('ac') || amenityLower.includes('air')) {
                  return { icon: Wind, name: amenity };
                } else if (amenityLower.includes('coffee') || amenityLower.includes('mini bar') || amenityLower.includes('minibar')) {
                  return { icon: Coffee, name: amenity };
                } else if (amenityLower.includes('parking') || amenityLower.includes('valet')) {
                  return { icon: Car, name: amenity };
                } else {
                  return { icon: CheckCircle, name: amenity };
                }
              });

              // Determine availability based on room state AND date filter
              let isAvailable = room.state === 'available';
              
              // If date filter is applied, also check if room is in available list
              if (availableRoomIds !== null) {
                isAvailable = isAvailable && availableRoomIds.has(room.room_id);
              }
              
              const statusText = !isAvailable && availableRoomIds !== null ? 'Booked for selected dates' :
                                room.state === 'occupied' ? 'Currently Occupied' : 
                                room.state === 'maintenance' ? 'Under Maintenance' : 
                                'Available';

              return {
                id: room.room_id,
                name: `${roomType.type} - Room ${room.room_no}`,
                type: roomType.type,
                size: '40m²', // Default size, can be added to room_types table
                occupancy: roomType.capacity,
                beds: 1,
                bedType: roomType.capacity > 2 ? 'King Bed' : 'Queen Bed',
                price: parseFloat(roomType.daily_rate),
                originalPrice: parseFloat(roomType.daily_rate) * 1.2, // 20% markup for original price
                discount: 17, // Default discount
                image: imageUrl,
                fallback: '/Images/6256702-middle.png',
                amenities: amenityIcons.length > 0 ? amenityIcons : [
                  { icon: Wifi, name: 'Free WiFi' },
                  { icon: Tv, name: 'Smart TV' },
                  { icon: Wind, name: 'AC' },
                  { icon: Coffee, name: 'Mini Bar' }
                ],
                features: [
                  roomType.capacity > 2 ? 'Family Friendly' : 'Perfect for Couples',
                  'Daily Housekeeping',
                  'Room Service',
                  'Complimentary Breakfast'
                ],
                available: isAvailable,
                lastBooked: isAvailable ? 'Available now' : statusText,
                rating: 4.5 + Math.random() * 0.4,
                description: roomType.description || `Comfortable ${roomType.type} room with modern amenities and excellent service.`,
                room_no: room.room_no,
                floor_no: room.floor_no,
                state: room.state
              };
            } catch (err) {
              return null;
            }
          })
        );

        // Filter out null values (rooms without valid room types)
        let validRooms = roomsWithDetails.filter(room => room !== null);
        
        // If date filter is applied, only show available rooms
        if (availableRoomIds !== null) {
          validRooms = validRooms.filter(room => room.available);
        }
        
        setRooms(validRooms);

        if (validRooms.length === 0) {
          if (availableRoomIds !== null) {
            setError('No rooms available for the selected dates. Please try different dates.');
          } else {
            setError('No rooms available at this branch yet.');
          }
        }
      } else {
        setError(roomsResponse.message || 'Failed to load rooms');
      }
    } catch (err) {
      setError('Unable to load rooms. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [selectedBranch.id, checkInDate, checkOutDate]);

  // Fetch rooms when branch is selected
  useEffect(() => {
    if (selectedBranch?.id) {
      fetchRooms();
    }
  }, [selectedBranch, fetchRooms]);

  const handleRoomBooking = (room) => {
    if (!room.available) return;
    
    if (!isLoggedIn) {
      onLoginRequired(room);
      return;
    }
    
    setSelectedRoom(room.id);
    setTimeout(() => {
      // Pass the selected dates along with room and branch
      const dates = {
        checkIn: checkInDate,
        checkOut: checkOutDate
      };
      onRoomSelect(room, selectedBranch, dates);
    }, 300);
  };

  const getAvailabilityStatus = (room) => {
    if (room.available) {
      return {
        status: 'available',
        text: 'Available Now',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else {
      return {
        status: 'unavailable',
        text: 'Unavailable',
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 pt-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header with Back Button */}
        <div className="mb-16" id="header">
          <button 
            onClick={onBackToBranches}
            className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 mb-6 transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Branches</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-light text-gray-800 mb-4">
              {selectedBranch?.name} - Available Rooms
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Choose from our carefully selected rooms at {selectedBranch?.location}. 
              Each room is designed for comfort and equipped with modern amenities.
            </p>
          </div>
        </div>

        {/* Date Filter Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-amber-600" />
              Filter by Availability
            </h3>
            <div className="grid md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setDateFilterApplied(true);
                    fetchRooms();
                  }}
                  disabled={!checkInDate || !checkOutDate || loading}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                    !checkInDate || !checkOutDate || loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-amber-600 text-white hover:bg-amber-700'
                  }`}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
                {(checkInDate || checkOutDate) && (
                  <button
                    onClick={() => {
                      setCheckInDate('');
                      setCheckOutDate('');
                      setDateFilterApplied(false);
                      fetchRooms();
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            {dateFilterApplied && checkInDate && checkOutDate && rooms.length > 0 && (
              <p className="text-sm text-green-600 mt-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                Found {rooms.length} available room{rooms.length !== 1 ? 's' : ''} from {new Date(checkInDate).toLocaleDateString()} to {new Date(checkOutDate).toLocaleDateString()}
              </p>
            )}
            {dateFilterApplied && checkInDate && checkOutDate && rooms.length === 0 && !loading && !error && (
              <p className="text-sm text-amber-600 mt-3 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                No rooms available for these dates. Try different dates or clear the filter.
              </p>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-16 h-16 text-amber-500 animate-spin mb-4" />
            <p className="text-gray-600 text-lg">Loading available rooms...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-red-800 mb-2">Unable to Load Rooms</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <button 
                onClick={fetchRooms}
                className="btn-primary px-6 py-3 rounded-xl font-semibold mr-4"
              >
                Try Again
              </button>
              <button 
                onClick={onBackToBranches}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Back to Branches
              </button>
            </div>
          </div>
        )}

        {/* Rooms Grid - Display 2 rooms per row with perfect alignment */}
        {!loading && !error && rooms.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-8">
            {rooms.map((room) => {
              const availability = getAvailabilityStatus(room);
              const StatusIconComponent = availability.icon;
            
            return (
              <div 
                key={room.id}
                className={`bg-white rounded-3xl overflow-hidden shadow-xl transition-all duration-500 ${selectedRoom === room.id ? 'ring-4 ring-amber-400 transform scale-105' : 'hover:shadow-2xl'}`}
                id={`room-${room.id}`}
              >
                {/* Room Image */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={room.image} 
                    alt={room.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = room.fallback;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  
                  {/* Discount Badge */}
                  {room.discount > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {room.discount}% OFF
                    </div>
                  )}

                  {/* Availability Status */}
                  <div className={`absolute top-4 right-4 ${availability.bgColor} ${availability.borderColor} ${availability.color} px-3 py-1 rounded-full text-sm font-semibold border flex items-center space-x-1`}>
                    <StatusIconComponent className="w-4 h-4" />
                    <span>{availability.text}</span>
                  </div>

                  {/* Room Type Badge */}
                  <div className="absolute bottom-4 left-4 bg-amber-500 text-white px-4 py-2 rounded-full font-medium">
                    {room.type}
                  </div>
                </div>

                {/* Room Content */}
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-800 mb-1">{room.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                        <span>{room.rating} rating</span>
                        <span>•</span>
                        <Calendar className="w-4 h-4" />
                        <span>{room.lastBooked}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {room.discount > 0 && (
                        <div className="text-sm text-gray-400 line-through">${room.originalPrice}</div>
                      )}
                      <div className="text-2xl font-bold text-amber-600">${room.price}</div>
                      <div className="text-sm text-gray-500">per night</div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6 leading-relaxed">{room.description}</p>

                  {/* Room Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Users className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                      <div className="text-sm font-medium">{room.occupancy} Guests</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Bed className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                      <div className="text-sm font-medium">{room.bedType}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-amber-600">{room.size}</div>
                      <div className="text-xs text-gray-500">Size</div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.map((amenity, idx) => {
                        const IconComponent = amenity.icon;
                        return (
                          <div key={idx} className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                            <IconComponent className="w-3 h-3" />
                            <span>{amenity.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Special Features</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {room.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Booking Button */}
                  <button 
                    onClick={() => handleRoomBooking(room)}
                    disabled={!room.available}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                      !room.available 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : selectedRoom === room.id
                          ? 'bg-amber-500 text-white transform scale-105'
                          : 'btn-primary hover:shadow-xl'
                    }`}
                  >
                    {!room.available ? 'Room Unavailable' : 
                     selectedRoom === room.id ? 'Processing...' : 
                     isLoggedIn ? 'Book This Room' : 'Login to Book'}
                  </button>

                  {!isLoggedIn && room.available && (
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Please login to proceed with booking
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* No Rooms Found */}
        {!loading && !error && rooms.length === 0 && (
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Rooms Available</h3>
            <p className="text-gray-600 mb-6">There are currently no rooms at this branch. Please try another location.</p>
            <button 
              onClick={onBackToBranches}
              className="btn-primary px-6 py-3 rounded-xl font-semibold"
            >
              Back to Branches
            </button>
          </div>
        )}

        {/* Help Text */}
        {!loading && !error && rooms.length > 0 && (
          <div className="text-center mt-16" id="help-text">
            <div className="max-w-3xl mx-auto p-6 bg-blue-50 rounded-2xl">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Room Selection Guide</h3>
              <p className="text-blue-600 text-sm leading-relaxed">
                All prices are per night and include breakfast, WiFi, and access to hotel facilities. 
                Room availability is updated in real-time. For special requests or longer stays, 
                please contact our reservations team after booking.
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* Room cards are visible by default - no reveal animation delay */
        
        /* Perfect alignment for room cards - 2 per row */
        .grid.lg\\:grid-cols-2 > div {
          display: flex;
          flex-direction: column;
        }

        /* Ensure all room cards have same height */
        @media (min-width: 1024px) {
          .grid.lg\\:grid-cols-2 > div {
            height: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default RoomSelectionPage;