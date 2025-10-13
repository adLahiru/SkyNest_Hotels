import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Bed, Wifi, Coffee, Tv, Wind, Car, CheckCircle, XCircle, Calendar, Star } from 'lucide-react';

const RoomSelectionPage = ({ selectedBranch, onRoomSelect, onBackToBranches, isLoggedIn, onLoginRequired }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isVisible, setIsVisible] = useState({});

  // Mock room data - in real app, this would come from API based on selected branch
  const getRoomsByBranch = (branchId) => {
    const roomsData = {
      colombo: [
        {
          id: 'col-std-001',
          name: 'Standard City View',
          type: 'Standard',
          size: '35m²',
          occupancy: 2,
          beds: 1,
          bedType: 'King Bed',
          price: 150,
          originalPrice: 200,
          discount: 25,
          image: '/Images/6256702-middle.png',
          fallback: '/assets/images/external/home/standard-room.jpg',
          amenities: [
            { icon: Wifi, name: 'Free WiFi' },
            { icon: Tv, name: 'Smart TV' },
            { icon: Wind, name: 'AC' },
            { icon: Coffee, name: 'Mini Bar' }
          ],
          features: ['City View', 'Work Desk', 'Safe', 'Hair Dryer'],
          available: true,
          lastBooked: '2 hours ago',
          rating: 4.6,
          description: 'Modern room with panoramic city views and contemporary amenities perfect for business travelers.'
        },
        {
          id: 'col-dlx-002',
          name: 'Deluxe Executive Suite',
          type: 'Deluxe',
          size: '65m²',
          occupancy: 3,
          beds: 1,
          bedType: 'King + Sofa Bed',
          price: 250,
          originalPrice: 300,
          discount: 17,
          image: '/Images/f_a6ac69d2b315fc52106206940c54e2e36375e06e.jpg',
          fallback: '/assets/images/external/home/deluxe-suite.jpg',
          amenities: [
            { icon: Wifi, name: 'Free WiFi' },
            { icon: Tv, name: 'Smart TV' },
            { icon: Wind, name: 'AC' },
            { icon: Coffee, name: 'Premium Mini Bar' },
            { icon: Car, name: 'Valet Parking' }
          ],
          features: ['Executive Lounge Access', 'Separate Living Area', 'Premium Toiletries', 'Butler Service'],
          available: true,
          lastBooked: '1 day ago',
          rating: 4.8,
          description: 'Spacious suite with separate living area, executive privileges and premium amenities.'
        },
        {
          id: 'col-fam-003',
          name: 'Family Connecting Rooms',
          type: 'Family',
          size: '80m²',
          occupancy: 4,
          beds: 2,
          bedType: '2 Queen Beds',
          price: 320,
          originalPrice: 380,
          discount: 16,
          image: '/Images/istockphoto-1452529483-612x612.jpg',
          fallback: '/assets/images/external/home/family-room.jpg',
          amenities: [
            { icon: Wifi, name: 'Free WiFi' },
            { icon: Tv, name: '2 Smart TVs' },
            { icon: Wind, name: 'AC' },
            { icon: Coffee, name: 'Kitchenette' }
          ],
          features: ['Connecting Rooms', 'Child Safety Kit', 'Game Console', 'Balcony'],
          available: false,
          lastBooked: 'Currently occupied',
          rating: 4.7,
          description: 'Perfect for families with connecting rooms and child-friendly amenities.'
        },
        {
          id: 'col-prs-004',
          name: 'Presidential Suite',
          type: 'Presidential',
          size: '120m²',
          occupancy: 4,
          beds: 1,
          bedType: 'California King',
          price: 500,
          originalPrice: 600,
          discount: 17,
          image: '/Images/park-hyatt-sydney.png',
          fallback: '/assets/images/external/offers/honeymoon-package.jpg',
          amenities: [
            { icon: Wifi, name: 'Free WiFi' },
            { icon: Tv, name: 'Premium Entertainment' },
            { icon: Wind, name: 'Climate Control' },
            { icon: Coffee, name: 'Premium Bar' },
            { icon: Car, name: 'Chauffeur Service' }
          ],
          features: ['Private Terrace', 'Jacuzzi', 'Personal Concierge', 'Premium Location'],
          available: true,
          lastBooked: '3 days ago',
          rating: 4.9,
          description: 'Ultimate luxury experience with private terrace, jacuzzi and personalized service.'
        }
      ],
      kandy: [
        {
          id: 'kan-std-001',
          name: 'Garden View Standard',
          type: 'Standard',
          size: '40m²',
          occupancy: 2,
          beds: 1,
          bedType: 'Queen Bed',
          price: 120,
          originalPrice: 150,
          discount: 20,
          image: '/Images/6256702-middle.png',
          fallback: '/assets/images/external/home/standard-room.jpg',
          amenities: [
            { icon: Wifi, name: 'Free WiFi' },
            { icon: Tv, name: 'Cable TV' },
            { icon: Wind, name: 'AC' },
            { icon: Coffee, name: 'Tea/Coffee' }
          ],
          features: ['Garden View', 'Traditional Décor', 'Mountain Breeze', 'Cultural Touches'],
          available: true,
          lastBooked: '5 hours ago',
          rating: 4.5,
          description: 'Charming room with traditional Sri Lankan décor and beautiful garden views.'
        },
        {
          id: 'kan-dlx-002',
          name: 'Mountain View Deluxe',
          type: 'Deluxe',
          size: '55m²',
          occupancy: 3,
          beds: 1,
          bedType: 'King Bed',
          price: 200,
          originalPrice: 240,
          discount: 17,
          image: '/Images/f_a6ac69d2b315fc52106206940c54e2e36375e06e.jpg',
          fallback: '/assets/images/external/home/deluxe-suite.jpg',
          amenities: [
            { icon: Wifi, name: 'Free WiFi' },
            { icon: Tv, name: 'Smart TV' },
            { icon: Wind, name: 'AC' },
            { icon: Coffee, name: 'Premium Amenities' }
          ],
          features: ['Mountain View', 'Private Balcony', 'Spa Access', 'Cultural Concierge'],
          available: false,
          lastBooked: 'Maintenance until Dec 15',
          rating: 4.7,
          description: 'Luxurious room with breathtaking mountain views and access to spa facilities.'
        },
        {
          id: 'kan-spa-003',
          name: 'Wellness Suite',
          type: 'Wellness',
          size: '70m²',
          occupancy: 2,
          beds: 1,
          bedType: 'King Bed',
          price: 280,
          originalPrice: 350,
          discount: 20,
          image: '/Images/park-hyatt-sydney.png',
          fallback: '/assets/images/external/home/luxury-spa.jpg',
          amenities: [
            { icon: Wifi, name: 'Free WiFi' },
            { icon: Tv, name: 'Wellness TV' },
            { icon: Wind, name: 'Air Purifier' },
            { icon: Coffee, name: 'Herbal Bar' }
          ],
          features: ['In-room Spa', 'Meditation Corner', 'Yoga Mat', 'Aromatherapy'],
          available: true,
          lastBooked: '1 day ago',
          rating: 4.8,
          description: 'Specially designed for wellness enthusiasts with in-room spa facilities.'
        }
      ],
      galle: [
        {
          id: 'gal-std-001',
          name: 'Ocean Breeze Standard',
          type: 'Standard',
          size: '42m²',
          occupancy: 2,
          beds: 1,
          bedType: 'Queen Bed',
          price: 180,
          originalPrice: 220,
          discount: 18,
          image: '/Images/6256702-middle.png',
          fallback: '/assets/images/external/home/standard-room.jpg',
          amenities: [
            { icon: Wifi, name: 'Free WiFi' },
            { icon: Tv, name: 'Smart TV' },
            { icon: Wind, name: 'Sea Breeze AC' },
            { icon: Coffee, name: 'Tropical Bar' }
          ],
          features: ['Ocean Glimpse', 'Colonial Décor', 'Fort Access', 'Beach Gear'],
          available: true,
          lastBooked: '3 hours ago',
          rating: 4.4,
          description: 'Charming room with colonial touches and glimpses of the Indian Ocean.'
        },
        {
          id: 'gal-ocn-002',
          name: 'Oceanfront Deluxe',
          type: 'Deluxe',
          size: '60m²',
          occupancy: 3,
          beds: 1,
          bedType: 'King Bed',
          price: 300,
          originalPrice: 360,
          discount: 17,
          image: '/Images/umbrella-pool-chair.jpg',
          fallback: '/assets/images/external/home/swimming-pool.jpg',
          amenities: [
            { icon: Wifi, name: 'Free WiFi' },
            { icon: Tv, name: 'Smart TV' },
            { icon: Wind, name: 'AC' },
            { icon: Coffee, name: 'Premium Bar' }
          ],
          features: ['Direct Ocean View', 'Private Beach Access', 'Sunset Terrace', 'Water Sports'],
          available: true,
          lastBooked: '2 days ago',
          rating: 4.9,
          description: 'Stunning oceanfront room with direct beach access and water sports included.'
        },
        {
          id: 'gal-vip-003',
          name: 'Historic Fort Suite',
          type: 'Heritage',
          size: '90m²',
          occupancy: 4,
          beds: 1,
          bedType: 'King + Day Bed',
          price: 450,
          originalPrice: 550,
          discount: 18,
          image: '/Images/park-hyatt-sydney.png',
          fallback: '/assets/images/external/offers/honeymoon-package.jpg',
          amenities: [
            { icon: Wifi, name: 'Free WiFi' },
            { icon: Tv, name: 'Entertainment System' },
            { icon: Wind, name: 'Climate Control' },
            { icon: Coffee, name: 'Heritage Bar' }
          ],
          features: ['Historic Architecture', 'Fort Wall View', 'Private Courtyard', 'Cultural Guide'],
          available: false,
          lastBooked: 'Fully booked this month',
          rating: 4.8,
          description: 'Unique heritage suite within the historic Galle Fort with authentic colonial architecture.'
        }
      ]
    };

    return roomsData[branchId] || [];
  };

  const rooms = getRoomsByBranch(selectedBranch?.id);

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
  }, []);

  const handleRoomBooking = (room) => {
    if (!room.available) return;
    
    if (!isLoggedIn) {
      onLoginRequired(room);
      return;
    }
    
    setSelectedRoom(room.id);
    setTimeout(() => {
      onRoomSelect(room, selectedBranch);
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
          {rooms.map((room, index) => {
            const availability = getAvailabilityStatus(room);
            const StatusIconComponent = availability.icon;
            
            return (
              <div 
                key={room.id}
                className={`bg-white rounded-3xl overflow-hidden shadow-xl transition-all duration-500 reveal ${isVisible[`room-${room.id}`] ? 'active' : ''} ${selectedRoom === room.id ? 'ring-4 ring-amber-400 transform scale-105' : 'hover:shadow-2xl'}`}
                id={`room-${room.id}`}
                style={{ animationDelay: `${index * 0.2}s` }}
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