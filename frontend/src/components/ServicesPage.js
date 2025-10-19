import React, { useState, useEffect } from 'react';
import { Search, Tag, DollarSign, ShoppingBag, Star, Clock, Sparkles } from 'lucide-react';
import serviceCatalogueService from '../services/serviceCatalogueService';

const ServicesPage = ({ user }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    fetchServices();
  }, [categoryFilter]);

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
  }, [services]);

  const fetchServices = async () => {
    setLoading(true);
    const filters = {
      is_active: 1 // Only show active services
    };
    
    if (categoryFilter) filters.category = categoryFilter;
    
    const result = await serviceCatalogueService.getAllServices(filters);
    if (result.success) {
      const servicesData = Array.isArray(result.services) ? result.services : [];
      setServices(servicesData);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(servicesData.map(s => s.category))].filter(Boolean);
      setCategories(uniqueCategories);
    } else {
      setServices([]);
      setCategories([]);
    }
    setLoading(false);
  };

  const filteredServices = Array.isArray(services) ? services.filter(service => {
    const matchesSearch = !searchQuery || 
      service.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) : [];

  // Service images mapping
  const getServiceImage = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes('spa') || name.includes('massage')) return '/Images/f_a6ac69d2b315fc52106206940c54e2e36375e06e.jpg';
    if (name.includes('dining') || name.includes('restaurant') || name.includes('food')) return '/Images/umbrella-pool-chair.jpg';
    if (name.includes('pool') || name.includes('swim')) return '/Images/istockphoto-1452529483-612x612.jpg';
    if (name.includes('gym') || name.includes('fitness')) return '/Images/6256702-middle.png';
    if (name.includes('laundry') || name.includes('cleaning')) return '/Images/park-hyatt-sydney.png';
    return '/Images/umbrella-pool-chair.jpg'; // Default image
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 pt-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-16 reveal ${isVisible['services-header'] ? 'active' : ''}`} id="services-header">
          <h1 className="text-5xl md:text-6xl font-light text-gray-800 mb-4">
            Hotel Services & Amenities
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover our premium services designed to make your stay extraordinary and memorable.
          </p>
        </div>

        {/* Featured Services Banner */}
        <div className={`mb-16 reveal ${isVisible['featured-banner'] ? 'active' : ''}`} id="featured-banner">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-light mb-4">✨ Premium Services</h2>
            <p className="text-xl mb-6 opacity-90">Experience luxury and comfort with our exclusive amenities!</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className={`mb-12 reveal ${isVisible['category-filter'] ? 'active' : ''}`} id="category-filter">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setCategoryFilter('')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                categoryFilter === ''
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-blue-300'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>All Services</span>
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  categoryFilter === category
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-blue-300'
                }`}
              >
                <Tag className="w-5 h-5" />
                <span>{category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className={`mb-12 max-w-2xl mx-auto reveal ${isVisible['search-bar'] ? 'active' : ''}`} id="search-bar">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
            />
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-light text-gray-600 mb-4">No services found</h3>
            <p className="text-gray-500 mb-8">Try adjusting your search or category filter.</p>
            <button 
              onClick={() => { setSearchQuery(''); setCategoryFilter(''); }}
              className="btn-secondary"
            >
              View All Services
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service, index) => (
              <div 
                key={service.service_id}
                className={`bg-white rounded-3xl overflow-hidden shadow-xl card-hover reveal ${isVisible[`service-${service.service_id}`] ? 'active' : ''}`}
                id={`service-${service.service_id}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Service Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={getServiceImage(service.service_name)} 
                    alt={service.service_name}
                    className="w-full h-full object-cover image-hover"
                    onError={(e) => {
                      e.target.src = '/Images/umbrella-pool-chair.jpg';
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center">
                      <DollarSign className="w-4 h-4" />
                      {Number(service.unit_price).toFixed(2)}
                    </div>
                  </div>
                  {service.is_active && (
                    <div className="absolute top-4 left-4">
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Available
                      </div>
                    </div>
                  )}
                </div>

                {/* Service Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">{service.service_name}</h3>
                  
                  {service.category && (
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <Tag className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="font-medium">{service.category}</span>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Service Rate</div>
                      <div className="flex items-center space-x-2">
                        <span className="text-3xl font-bold text-blue-600">
                          ${Number(service.unit_price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Status</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        service.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {service.is_active ? 'Available Now' : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    className="w-full btn-primary"
                    disabled={!service.is_active}
                  >
                    {service.is_active ? 'Request Service' : 'Currently Unavailable'}
                  </button>
                </div>
              </div>
            ))}
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

        .card-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .image-hover {
          transition: transform 0.5s ease;
        }

        .card-hover:hover .image-hover {
          transform: scale(1.1);
        }

        .btn-primary {
          padding: 12px 24px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          padding: 12px 32px;
          background: white;
          color: #374151;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          border-color: #3b82f6;
          color: #3b82f6;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default ServicesPage;
