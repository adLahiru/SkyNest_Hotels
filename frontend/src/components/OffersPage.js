import React, { useState, useEffect } from 'react';
import { Gift, Clock, Users, Percent, Star, Calendar } from 'lucide-react';
import discountService from '../services/discountService';

const OffersPage = ({ setCurrentPage }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isVisible, setIsVisible] = useState({});
  const [backendOffers, setBackendOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All Offers', icon: Gift },
    { id: 'seasonal', name: 'Seasonal', icon: Calendar },
    { id: 'advance', name: 'Early Bird', icon: Clock },
    { id: 'group', name: 'Group Deals', icon: Users },
    { id: 'premium', name: 'Premium', icon: Star }
  ];

  const offers = [
    {
      id: 1,
      category: 'advance',
      title: 'Early Bird Special',
      discount: '25% OFF',
      description: 'Book 30 days in advance and save 25% on your stay. Perfect for planning ahead and securing the best rates.',
      code: 'EARLY25',
      validUntil: '2025-12-31',
      terms: ['Valid for bookings made 30 days in advance', 'Minimum 2 nights stay', 'Subject to availability'],
      image: '/Images/6256702-middle.png',
      fallback: '/assets/images/external/offers/early-bird-special.jpg',
      originalPrice: 200,
      discountedPrice: 150,
      featured: true
    },
    {
      id: 2,
      category: 'seasonal',
      title: 'Weekend Getaway',
      discount: '20% OFF',
      description: 'Escape the weekday hustle with our weekend special. Enjoy 20% off on Friday to Sunday bookings.',
      code: 'WEEKEND20',
      validUntil: '2025-11-30',
      terms: ['Valid Friday to Sunday only', 'Minimum 2 nights stay', 'Cannot be combined with other offers'],
      image: '/Images/umbrella-pool-chair.jpg',
      fallback: '/assets/images/external/offers/weekend-getaway.jpg',
      originalPrice: 180,
      discountedPrice: 144,
      featured: false
    },
    {
      id: 3,
      category: 'advance',
      title: 'Long Stay Discount',
      discount: '30% OFF',
      description: 'Extended stays deserve extended savings. Stay 7+ nights and receive 30% off your entire booking.',
      code: 'STAY30',
      validUntil: '2025-12-15',
      terms: ['Minimum 7 nights stay', 'Valid for all room types', 'Advance booking required'],
      image: '/Images/park-hyatt-sydney.png',
      fallback: '/assets/images/external/offers/long-stay-discount.jpg',
      originalPrice: 220,
      discountedPrice: 154,
      featured: true
    },
    {
      id: 4,
      category: 'premium',
      title: 'Honeymoon Package',
      discount: '35% OFF',
      description: 'Celebrate love with our romantic honeymoon package. Includes spa treatments, candlelit dinner, and premium amenities.',
      code: 'LOVE35',
      validUntil: '2026-02-14',
      terms: ['Proof of marriage required', 'Includes spa and dining credits', 'Premium room upgrade included'],
      image: '/Images/f_a6ac69d2b315fc52106206940c54e2e36375e06e.jpg',
      fallback: '/assets/images/external/offers/honeymoon-package.jpg',
      originalPrice: 400,
      discountedPrice: 260,
      featured: true
    },
    {
      id: 5,
      category: 'group',
      title: 'Group Booking Special',
      discount: '15% OFF',
      description: 'Perfect for corporate events, family reunions, or friend getaways. Book 5+ rooms and save 15%.',
      code: 'GROUP15',
      validUntil: '2025-12-31',
      terms: ['Minimum 5 rooms required', 'All rooms must be booked together', 'Contact us for custom packages'],
      image: '/Images/istockphoto-1452529483-612x612.jpg',
      fallback: '/assets/images/external/offers/group-booking-special.jpg',
      originalPrice: 160,
      discountedPrice: 136,
      featured: false
    },
    {
      id: 6,
      category: 'seasonal',
      title: 'Summer Paradise',
      discount: '22% OFF',
      description: 'Beat the heat with our summer special. Cool off in our pools and enjoy refreshing tropical drinks.',
      code: 'SUMMER22',
      validUntil: '2025-08-31',
      terms: ['Valid June to August', 'Includes welcome drink', 'Pool access and activities included'],
      image: '/Images/umbrella-pool-chair.jpg',
      fallback: '/assets/images/external/offers/summer-paradise.jpg',
      originalPrice: 190,
      discountedPrice: 148,
      featured: false
    }
  ];

  // Fetch backend offers on mount
  useEffect(() => {
    fetchBackendOffers();
  }, []);

  const fetchBackendOffers = async () => {
    setLoading(true);
    try {
      const result = await discountService.getAllDiscounts();
      if (result.success && Array.isArray(result.discounts)) {
        // Transform backend discounts to match offers format
        const transformedOffers = result.discounts.map((discount, index) => ({
          id: `backend-${discount.discount_id}`,
          category: discount.applies_to === 'ROOMS' ? 'seasonal' : 
                   discount.applies_to === 'SERVICES' ? 'premium' : 'advance',
          title: discount.discount_name,
          discount: discount.type === 'rate' ? `${discount.discount_value}% OFF` : `$${discount.discount_value} OFF`,
          description: `Enjoy ${discount.type === 'rate' ? discount.discount_value + '%' : '$' + discount.discount_value} discount on ${
            discount.applies_to === 'SERVICES_AND_ROOMS' ? 'all services and rooms' :
            discount.applies_to === 'SERVICES' ? 'selected services' : 'room bookings'
          }. Limited time offer!`,
          code: `SAVE${discount.discount_value}`,
          validUntil: discount.end_date || '2026-12-31',
          terms: [
            `Valid ${discount.applies_to === 'SERVICES_AND_ROOMS' ? 'for all services and rooms' : 
                    discount.applies_to === 'SERVICES' ? 'for services only' : 'for room bookings only'}`,
            discount.start_date ? `Valid from ${new Date(discount.start_date).toLocaleDateString()}` : 'No start date restriction',
            discount.end_date ? `Valid until ${new Date(discount.end_date).toLocaleDateString()}` : 'No expiry date'
          ],
          image: '/Images/umbrella-pool-chair.jpg',
          fallback: '/Images/umbrella-pool-chair.jpg',
          originalPrice: 200,
          discountedPrice: discount.type === 'rate' ? 200 * (1 - discount.discount_value / 100) : 200 - discount.discount_value,
          featured: index < 3,
          isBackend: true
        }));
        setBackendOffers(transformedOffers);
      }
    } catch (error) {
      console.error('Error fetching backend offers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Combine hardcoded and backend offers
  const allOffers = [...backendOffers, ...offers];

  const filteredOffers = selectedCategory === 'all' 
    ? allOffers 
    : allOffers.filter(offer => offer.category === selectedCategory);

  const featuredOffers = allOffers.filter(offer => offer.featured);

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

  const handleBookNow = (offer) => {
    // In a real app, you might pass the offer details to the booking page
    setCurrentPage('booking');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 pt-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-16 reveal ${isVisible['offers-header'] ? 'active' : ''}`} id="offers-header">
          <h1 className="text-5xl md:text-6xl font-light text-gray-800 mb-4">
            Exclusive Offers & Deals
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover incredible savings and special packages designed to make your stay even more memorable.
          </p>
        </div>

        {/* Featured Offers Banner */}
        <div className={`mb-16 reveal ${isVisible['featured-banner'] ? 'active' : ''}`} id="featured-banner">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-light mb-4">🎉 Featured Deals</h2>
            <p className="text-xl mb-6 opacity-90">Limited time offers you won't want to miss!</p>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredOffers.slice(0, 3).map((offer, index) => (
                <div key={offer.id} className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 card-hover">
                  <div className="text-3xl font-bold mb-2">{offer.discount}</div>
                  <div className="text-lg font-medium mb-2">{offer.title}</div>
                  <div className="text-sm opacity-80">Code: {offer.code}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className={`mb-12 reveal ${isVisible['category-filter'] ? 'active' : ''}`} id="category-filter">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOffers.map((offer, index) => (
            <div 
              key={offer.id}
              className={`bg-white rounded-3xl overflow-hidden shadow-xl card-hover reveal ${isVisible[`offer-${offer.id}`] ? 'active' : ''}`}
              id={`offer-${offer.id}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Offer Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={offer.image} 
                  alt={offer.title}
                  className="w-full h-full object-cover image-hover"
                  onError={(e) => {
                    e.target.src = offer.fallback;
                  }}
                />
                <div className="absolute top-4 right-4">
                  <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    {offer.discount}
                  </div>
                </div>
                {offer.featured && (
                  <div className="absolute top-4 left-4">
                    <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Featured
                    </div>
                  </div>
                )}
              </div>

              {/* Offer Content */}
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">{offer.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{offer.description}</p>

                {/* Pricing */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-amber-600">
                        ${offer.discountedPrice}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        ${offer.originalPrice}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">per night</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Promo Code</div>
                    <div className="font-mono font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded">
                      {offer.code}
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Terms & Conditions:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {offer.terms.map((term, termIndex) => (
                      <li key={termIndex} className="flex items-start">
                        <span className="text-amber-500 mr-2">•</span>
                        {term}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Valid Until */}
                <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Valid until {new Date(offer.validUntil).toLocaleDateString()}
                  </span>
                </div>

                {/* Action Button */}
                <button 
                  onClick={() => handleBookNow(offer)}
                  className="w-full btn-primary"
                >
                  Book This Deal
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No offers message */}
        {filteredOffers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-light text-gray-600 mb-4">No offers found</h3>
            <p className="text-gray-500 mb-8">Try selecting a different category to see more deals.</p>
            <button 
              onClick={() => setSelectedCategory('all')}
              className="btn-secondary"
            >
              View All Offers
            </button>
          </div>
        )}


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

export default OffersPage;