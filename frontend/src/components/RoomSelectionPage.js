import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Bed, Wifi, Coffee, Tv, Wind, Car, CheckCircle, XCircle, Calendar, Star } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8084/api';

const RoomSelectionPage = ({ selectedBranch, onRoomSelect, onBackToBranches, isLoggedIn, onLoginRequired }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isVisible, setIsVisible] = useState({});
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch room types from the database
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          setError('Please login to view available rooms');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/room-types`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setRoomTypes(response.data.data || []);
        } else {
          setError('Failed to load room types');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching room types:', error);
        if (error.response?.status === 401) {
          setError('Your session has expired or is invalid. Please log in again.');
          if (typeof onLoginRequired === 'function') {
            onLoginRequired();
          }
        } else {
          setError('Failed to load rooms. Please try again later.');
        }
        setLoading(false);
      }
    };

    fetchRoomTypes();
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [roomTypes]);

  const handleRoomBooking = (roomType) => {
    if (!isLoggedIn) {
      onLoginRequired(roomType);
      return;
    }
    
    setSelectedRoom(roomType.room_type_id);
    setTimeout(() => {
      onRoomSelect(roomType, selectedBranch);
    }, 300);
  };

  // Parse amenities from JSON string
  const parseAmenities = (amenitiesStr) => {
    try {
      const amenitiesArray = JSON.parse(amenitiesStr);
      return amenitiesArray || [];
    } catch {
      return amenitiesStr ? amenitiesStr.split(',').map(a => a.trim()) : [];
    }
  };

  // Convert amenities to icon components
  const getAmenityIcon = (amenityName) => {
    const lowerName = amenityName.toLowerCase();
    if (lowerName.includes('wifi') || lowerName.includes('wi-fi')) return Wifi;
    if (lowerName.includes('tv')) return Tv;
    if (lowerName.includes('air') || lowerName.includes('ac')) return Wind;
    if (lowerName.includes('bar') || lowerName.includes('coffee') || lowerName.includes('kitchen')) return Coffee;
    if (lowerName.includes('parking') || lowerName.includes('valet')) return Car;
    return Coffee; // default icon
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-lg max-w-md">
          <h2 className="text-2xl font-semibold text-red-800 mb-4">Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 mr-4"
          >
            Retry
          </button>
          <button 
            onClick={onBackToBranches}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 pt-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header with Back Button */}
        <div className={`mb-16 reveal ${isVisible['header'] ? 'active' : ''}`} id="header">
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

        {/* Rooms Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {roomTypes.map((roomType, index) => {
            const amenitiesList = parseAmenities(roomType.amenities);
            const isAvailable = roomType.room_count > 0;
            
            return (
              <div 
                key={roomType.room_type_id}
                className={`bg-white rounded-3xl overflow-hidden shadow-xl transition-all duration-500 reveal ${isVisible[`room-${roomType.room_type_id}`] ? 'active' : ''} ${selectedRoom === roomType.room_type_id ? 'ring-4 ring-amber-400 transform scale-105' : 'hover:shadow-2xl'}`}
                id={`room-${roomType.room_type_id}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Room Image */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={roomType.photo || '/assets/images/external/home/hero-background.jpg'} 
                    alt={roomType.type}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/assets/images/external/home/hero-background.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  
                  {/* Availability Status */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold border flex items-center space-x-1 ${
                    isAvailable 
                      ? 'bg-green-50 border-green-200 text-green-600' 
                      : 'bg-red-50 border-red-200 text-red-600'
                  }`}>
                    {isAvailable ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    <span>{isAvailable ? 'Available' : 'Unavailable'}</span>
                  </div>

                  {/* Room Type Badge */}
                  <div className="absolute bottom-4 left-4 bg-amber-500 text-white px-4 py-2 rounded-full font-medium">
                    {roomType.type}
                  </div>
                </div>

                {/* Room Content */}
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-800 mb-1">{roomType.type}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                        <span>4.5+ rating</span>
                        <span>•</span>
                        <span>{roomType.room_count} rooms available</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-600">${roomType.daily_rate}</div>
                      <div className="text-sm text-gray-500">per night</div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6 leading-relaxed">{roomType.description}</p>

                  {/* Room Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Users className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                      <div className="text-sm font-medium">{roomType.capacity} Guests</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Bed className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                      <div className="text-sm font-medium">Premium Bed</div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {amenitiesList.slice(0, 6).map((amenity, idx) => {
                        const IconComponent = getAmenityIcon(amenity);
                        return (
                          <div key={idx} className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                            <IconComponent className="w-3 h-3" />
                            <span>{amenity}</span>
                          </div>
                        );
                      })}
                      {amenitiesList.length > 6 && (
                        <div className="text-xs text-amber-600 px-3 py-1">
                          +{amenitiesList.length - 6} more
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Button */}
                  <button 
                    onClick={() => handleRoomBooking(roomType)}
                    disabled={!isAvailable}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                      !isAvailable 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : selectedRoom === roomType.room_type_id
                          ? 'bg-amber-500 text-white transform scale-105'
                          : 'btn-primary hover:shadow-xl'
                    }`}
                  >
                    {!isAvailable ? 'Room Unavailable' : 
                     selectedRoom === roomType.room_type_id ? 'Processing...' : 
                     isLoggedIn ? 'Book This Room' : 'Login to Book'}
                  </button>

                  {!isLoggedIn && isAvailable && (
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Please login to proceed with booking
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Help Text */}
        <div className={`text-center mt-16 reveal ${isVisible['help-text'] ? 'active' : ''}`} id="help-text">
          <div className="max-w-3xl mx-auto p-6 bg-blue-50 rounded-2xl">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Room Selection Guide</h3>
            <p className="text-blue-600 text-sm leading-relaxed">
              All prices are per night and include breakfast, WiFi, and access to hotel facilities. 
              Room availability is updated in real-time. For special requests or longer stays, 
              please contact our reservations team after booking.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease;
        }
        
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default RoomSelectionPage;