import React, { useState, useEffect } from 'react';
import { Bed, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import roomTypeService from '../services/roomTypeService';

const HomePage = ({ setCurrentPage }) => {
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomsError, setRoomsError] = useState('');

  // Fallback static cards if API fails or has no data
  const fallbackRooms = [
    {
      name: 'Standard Double Room',
      area: '—',
      occupancy: 2,
      bedrooms: 1,
      price: 150,
      image: '/Images/6256702-middle.png',
      fallback: '/assets/images/external/home/standard-room.jpg',
    },
    {
      name: 'Deluxe Suite',
      area: '—',
      occupancy: 3,
      bedrooms: 2,
      price: 250,
      image: '/Images/f_a6ac69d2b315fc52106206940c54e2e36375e06e.jpg',
      fallback: '/assets/images/external/home/deluxe-suite.jpg',
    },
    {
      name: 'Family Room',
      area: '—',
      occupancy: 4,
      bedrooms: 2,
      price: 320,
      image: '/Images/istockphoto-1452529483-612x612.jpg',
      fallback: '/assets/images/external/home/family-room.jpg',
    },
  ];

  const facilities = [
    { 
      name: 'Swimming Pool', 
      image: '/Images/umbrella-pool-chair.jpg',
      fallback: '/assets/images/external/home/swimming-pool.jpg'
    },
    { 
      name: 'Luxury Spa', 
      image: '/Images/park-hyatt-sydney.png',
      fallback: '/assets/images/external/home/luxury-spa.jpg'
    },
    { 
      name: 'Fine Dining', 
      image: '/Images/6256702-middle.png',
      fallback: '/assets/images/external/home/fine-dining.jpg'
    },
    { 
      name: 'Fitness Center', 
      image: '/Images/f_a6ac69d2b315fc52106206940c54e2e36375e06e.jpg',
      fallback: '/assets/images/external/home/fitness-center.jpg'
    },
    { 
      name: 'Conference Hall', 
      image: '/Images/istockphoto-1452529483-612x612.jpg',
      fallback: '/assets/images/external/home/conference-hall.jpg'
    }
  ];

  const testimonials = [
    {
      rating: 5,
      comment: 'Absolutely stunning hotel with exceptional service. The views are breathtaking and the staff went above and beyond to make our stay memorable.'
    },
    {
      rating: 5,
      comment: 'Perfect location, luxurious amenities, and outstanding hospitality. Will definitely be returning for our next vacation.'
    },
    {
      rating: 5,
      comment: 'The spa services were incredible and the dining experience was world-class. Every detail was thoughtfully considered.'
    }
  ];

  const nextRoom = () => setCurrentRoomIndex((prev) => (prev + 1) % rooms.length);
  const prevRoom = () => setCurrentRoomIndex((prev) => (prev - 1 + rooms.length) % rooms.length);

  // Auto-rotate rooms (disabled while loading)
  useEffect(() => {
    if (loadingRooms || rooms.length === 0) return;
    const interval = setInterval(nextRoom, 5000);
    return () => clearInterval(interval);
  }, [loadingRooms, rooms.length, nextRoom]);

  // Fetch room types for public homepage cards
  useEffect(() => {
    let ignore = false;
    const fetchRooms = async () => {
      setLoadingRooms(true);
      setRoomsError('');
      try {
        const res = await roomTypeService.getAllRoomTypesPublic();
        if (!ignore && res.success) {
          const mapped = (res.roomTypes || []).map((rt) => {
            const amenitiesArr = typeof rt.amenities === 'string'
              ? rt.amenities.split(',').map(a => a.trim()).filter(Boolean)
              : [];
            return {
              id: rt.room_type_id,
              name: rt.type,
              capacity: rt.capacity,
              available: rt.room_count || 0,
              price: rt.daily_rate,
              description: rt.description || '',
              amenities: amenitiesArr,
              image: rt.photo || '/assets/images/external/home/standard-room.jpg',
              fallback: '/assets/images/external/home/standard-room.jpg',
            };
          });
          // Use top 3 or fallback if empty (keep 3 for layout consistency)
          setRooms(mapped.length > 0 ? mapped.slice(0, 3) : fallbackRooms);
        } else if (!ignore) {
          setRooms(fallbackRooms);
          setRoomsError(res.message || '');
        }
      } catch (e) {
        if (!ignore) {
          setRooms(fallbackRooms);
          setRoomsError('Unable to load rooms at this time.');
        }
      } finally {
        if (!ignore) setLoadingRooms(false);
      }
    };
    fetchRooms();
    return () => {
      ignore = true;
    };
  }, []);

  // Intersection Observer for animations
  // Re-run when rooms change so newly rendered cards are observed
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
  }, [rooms]);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <div className="relative h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center parallax"
          style={{
            backgroundImage: `url('/Figmaimages/Home.png'), url('/assets/images/external/home/hero-background.jpg')`
          }}
        ></div>
        
        {/* Floating elements */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-amber-400/20 rounded-full float-delayed"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${10 + Math.random() * 80}%`,
                animationDelay: `${i * 0.5}s`
              }}
            ></div>
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-6 text-center">
          <div className="w-24 h-24 mb-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl pulse-slow">
            <Bed className="w-12 h-12" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-light tracking-wider mb-4 text-shadow">
            SKY NEST HOTELS
          </h1>
          
          <p className="text-xl md:text-2xl font-light mb-8 tracking-wide gradient-text">
            Where Comfort Meets Elegance
          </p>
          
          <p className="text-lg text-gray-200 max-w-2xl text-center leading-relaxed mb-12 opacity-90">
            Experience unparalleled luxury and comfort at our exclusive locations in Colombo, Kandy, and Galle. 
            Every moment is crafted to perfection.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setCurrentPage('booking')} 
              className="btn-primary"
            >
              Book Your Stay
            </button>
            <button 
              onClick={() => setCurrentPage('offers')} 
              className="px-6 py-3 border-2 border-white text-white rounded-lg font-medium transition-all duration-300 hover:bg-white hover:text-blue-600 transform hover:scale-105"
            >
              View Special Offers
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-amber-400/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-amber-400 rounded-full" 
                 style={{ animation: 'scrollBounce 2s ease-in-out infinite' }}></div>
          </div>
        </div>
      </div>

      {/* Rooms Section */}
      <div className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center mb-16 reveal ${isVisible['rooms-header'] ? 'active' : ''}`} id="rooms-header">
            <h2 className="text-4xl md:text-5xl font-light mb-4 text-gray-800">
              Luxurious Accommodations
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Choose from our carefully curated selection of rooms and suites, each designed to provide 
              the ultimate in comfort and sophistication.
            </p>
          </div>
          
          {loadingRooms && rooms.length === 0 && (
            <div className="grid md:grid-cols-3 gap-8 mb-6">
              {[0,1,2].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-xl p-8 animate-pulse">
                  <div className="h-64 bg-gray-200 mb-6 rounded"></div>
                  <div className="h-6 bg-gray-200 w-2/3 mb-4 rounded"></div>
                  <div className="space-y-2 mb-6">
                    <div className="h-4 bg-gray-200 w-full rounded"></div>
                    <div className="h-4 bg-gray-200 w-5/6 rounded"></div>
                    <div className="h-4 bg-gray-200 w-4/6 rounded"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-8 bg-gray-200 w-24 rounded"></div>
                    <div className="h-10 bg-gray-200 w-28 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {roomsError && (
            <div className="max-w-2xl mx-auto mb-6 text-center text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded">
              Showing featured rooms. {roomsError}
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-8">
            {rooms.map((room, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-2xl overflow-hidden shadow-xl card-hover reveal ${isVisible[`room-${index}`] ? 'active' : ''}`}
                id={`room-${index}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="h-64 overflow-hidden relative">
                  <img 
                    src={room.image} 
                    alt={room.name} 
                    className="w-full h-full object-cover image-hover"
                    onError={(e) => {
                      e.target.src = room.fallback;
                    }}
                  />
                  {typeof room.available === 'number' && (
                    <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {room.available} available
                    </div>
                  )}
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">{room.name}</h3>
                  {room.description && (
                    <p className="text-gray-600 mb-4 leading-relaxed line-clamp-2">{room.description}</p>
                  )}
                  <div className="space-y-2 mb-6 text-gray-600">
                    <p className="flex justify-between">
                      <span>Max Occupancy:</span> <span className="font-medium">{room.capacity} guests</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Available Rooms:</span> <span className="font-medium">{room.available}</span>
                    </p>
                  </div>
                  {Array.isArray(room.amenities) && room.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {room.amenities.slice(0, 3).map((am, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{am}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-500">From</span>
                      <div className="text-3xl font-light">
                        <span className="font-semibold text-amber-600">${room.price}</span>
                        <span className="text-gray-500 text-base">/night</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setCurrentPage('booking')} 
                      className="btn-secondary"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Facilities Section */}
      <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center mb-16 reveal ${isVisible['facilities-header'] ? 'active' : ''}`} id="facilities-header">
            <h2 className="text-4xl md:text-5xl font-light mb-4 text-gray-800">
              World-Class Facilities
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Indulge in our premium amenities designed to enhance every aspect of your stay.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {facilities.map((facility, index) => (
              <div 
                key={index} 
                className={`relative h-80 rounded-2xl overflow-hidden shadow-xl card-hover group reveal ${isVisible[`facility-${index}`] ? 'active' : ''}`}
                id={`facility-${index}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img 
                  src={facility.image} 
                  alt={facility.name} 
                  className="w-full h-full object-cover image-hover"
                  onError={(e) => {
                    e.target.src = facility.fallback;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-light text-white tracking-wider mb-2">
                    {facility.name}
                  </h3>
                  <div className="w-12 h-0.5 bg-amber-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center mb-16 reveal ${isVisible['testimonials-header'] ? 'active' : ''}`} id="testimonials-header">
            <h2 className="text-4xl md:text-5xl font-light mb-4 text-gray-800">
              Guest Experiences
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover what our guests say about their unforgettable stays with us.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className={`bg-white rounded-2xl p-8 shadow-xl card-hover reveal ${isVisible[`testimonial-${index}`] ? 'active' : ''}`}
                id={`testimonial-${index}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed italic">
                  "{testimonial.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
            Ready for Your Perfect Getaway?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Book your stay today and experience the pinnacle of luxury and comfort.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setCurrentPage('booking')} 
              className="btn-primary"
            >
              Reserve Your Room
            </button>
            <button 
              onClick={() => setCurrentPage('contact')} 
              className="px-6 py-3 border-2 border-white text-white rounded-lg font-medium transition-all duration-300 hover:bg-white hover:text-blue-600 transform hover:scale-105"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scrollBounce {
          0%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(8px);
            opacity: 0.5;
          }
        }
        
        .reveal {
          opacity: 0;
          transform: translateY(50px);
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

export default HomePage;