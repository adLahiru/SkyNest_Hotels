import React, { useState, useEffect } from 'react';
import { MapPin, Star, ArrowRight, Wifi, Car, Coffee, Flower2, Utensils } from 'lucide-react';

const BranchSelectionPage = ({ onBranchSelect }) => {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isVisible, setIsVisible] = useState({});

  // Mock data - in real app, this would come from API/database
  const branches = [
    {
      id: 'colombo',
      name: 'Sky Nest Colombo',
      location: 'Colombo',
      address: '123 Galle Road, Colombo 03, Sri Lanka',
      description: 'Experience luxury in the heart of Sri Lanka\'s commercial capital. Our Colombo branch offers stunning city views.',
      image: '/Images/park-hyatt-sydney.png',
      fallback: '/assets/images/external/home/hero-background.jpg',
      features: ['City View', 'Business Center', 'Rooftop Pool', 'Fine Dining'],
      amenities: [
        { icon: Wifi, name: 'Free WiFi' },
        { icon: Car, name: 'Valet Parking' },
        { icon: Coffee, name: '24/7 Room Service' },
        { icon: Utensils, name: 'Restaurant' }
      ],
      rating: 4.8,
      rooms: 120,
      priceRange: '$150 - $500'
    },
    {
      id: 'kandy',
      name: 'Sky Nest Kandy',
      location: 'Kandy',
      address: '456 Peradeniya Road, Kandy, Sri Lanka',
      description: 'Immerse yourself in the cultural heart of Sri Lanka. Our Kandy branch combines traditional charm with modern luxury.',
      image: '/Images/6256702-middle.png',
      fallback: '/assets/images/external/home/deluxe-suite.jpg',
      features: ['Mountain View', 'Cultural Tours', 'Spa & Wellness', 'Garden Terrace'],
      amenities: [
        { icon: Flower2, name: 'Spa Services' },
        { icon: Wifi, name: 'Free WiFi' },
        { icon: Car, name: 'Free Parking' },
        { icon: Coffee, name: 'Café & Bar' }
      ],
      rating: 4.9,
      rooms: 80,
      priceRange: '$120 - $400'
    },
    {
      id: 'galle',
      name: 'Sky Nest Galle',
      location: 'Galle',
      address: '789 Beach Road, Galle Fort, Sri Lanka',
      description: 'Discover coastal elegance in the historic Galle Fort. Our beachfront property offers stunning ocean views and colonial charm.',
      image: '/Images/umbrella-pool-chair.jpg',
      fallback: '/assets/images/external/home/swimming-pool.jpg',
      features: ['Ocean View', 'Private Beach', 'Historic Fort', 'Water Sports'],
      amenities: [
        { icon: Wifi, name: 'Free WiFi' },
        { icon: Coffee, name: 'Beachside Café' },
        { icon: Car, name: 'Beach Access' },
        { icon: Flower2, name: 'Ocean Spa' }
      ],
      rating: 4.7,
      rooms: 60,
      priceRange: '$180 - $600'
    }
  ];

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

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch.id);
    // Add a small delay for visual feedback before navigation
    setTimeout(() => {
      onBranchSelect(branch);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 pt-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-16 reveal ${isVisible['header'] ? 'active' : ''}`} id="header">
          <h1 className="text-5xl md:text-6xl font-light text-gray-800 mb-4">
            Choose Your Destination
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Select from our three stunning locations across Sri Lanka. Each branch offers unique experiences 
            while maintaining our signature luxury and hospitality.
          </p>
        </div>

        {/* Branches Grid */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {branches.map((branch, index) => (
            <div 
              key={branch.id}
              className={`bg-white rounded-3xl overflow-hidden shadow-xl card-hover cursor-pointer transform transition-all duration-500 reveal ${isVisible[`branch-${branch.id}`] ? 'active' : ''} ${selectedBranch === branch.id ? 'scale-105 ring-4 ring-amber-400' : 'hover:scale-105'}`}
              id={`branch-${branch.id}`}
              style={{ animationDelay: `${index * 0.2}s` }}
              onClick={() => handleBranchSelect(branch)}
            >
              {/* Branch Image */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={branch.image} 
                  alt={branch.name}
                  className="w-full h-full object-cover image-hover"
                  onError={(e) => {
                    e.target.src = branch.fallback;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                
                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span className="text-sm font-semibold text-gray-800">{branch.rating}</span>
                </div>

                {/* Location Badge */}
                <div className="absolute bottom-4 left-4 bg-amber-500 text-white px-4 py-2 rounded-full flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{branch.location}</span>
                </div>
              </div>

              {/* Branch Content */}
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">{branch.name}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{branch.description}</p>

                {/* Branch Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-amber-600">{branch.rooms}</div>
                    <div className="text-sm text-gray-500">Rooms</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-amber-600">{branch.priceRange}</div>
                    <div className="text-sm text-gray-500">Per Night</div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Features</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {branch.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Amenities</h4>
                  <div className="flex flex-wrap gap-3">
                    {branch.amenities.map((amenity, idx) => {
                      const IconComponent = amenity.icon;
                      return (
                        <div key={idx} className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                          <IconComponent className="w-3 h-3" />
                          <span>{amenity.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Address */}
                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{branch.address}</span>
                  </div>
                </div>

                {/* Select Button */}
                <button 
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    selectedBranch === branch.id 
                      ? 'bg-amber-500 text-white transform scale-105' 
                      : 'btn-primary hover:shadow-xl'
                  }`}
                >
                  <span>{selectedBranch === branch.id ? 'Selected' : 'Select This Branch'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Help Text */}
        <div className={`text-center mt-16 reveal ${isVisible['help-text'] ? 'active' : ''}`} id="help-text">
          <div className="max-w-2xl mx-auto p-6 bg-blue-50 rounded-2xl">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Need Help Choosing?</h3>
            <p className="text-blue-600 text-sm leading-relaxed">
              Each of our branches offers unique experiences. Colombo for business and city life, 
              Kandy for culture and mountains, and Galle for beaches and history. 
              Click on any branch to see available rooms and make your reservation.
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

export default BranchSelectionPage;