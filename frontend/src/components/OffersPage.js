import React, { useState, useEffect } from 'react';
import { Tag, Calendar, TrendingDown, Check, AlertCircle, Loader } from 'lucide-react';
import { discountService } from '../services';

const OffersPage = ({ setCurrentPage }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map backend discount to display format
  const mapDiscountToOffer = (d) => {
    const isPercentage = d.type === 'rate';
    const discountText = isPercentage ? `${d.discount_value}%` : `$${d.discount_value}`;
    
    // Format title: EARLY_BIRD_25 → Early Bird 25
    const title = d.discount_name
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');

    // Generate description based on applies_to
    const appliesTo = d.applies_to === 'SERVICES' 
      ? 'hotel services' 
      : d.applies_to === 'SERVICES_AND_ROOMS' 
      ? 'rooms and services' 
      : 'room bookings';

    const description = isPercentage
      ? `Get ${d.discount_value}% off on ${appliesTo}`
      : `Save $${d.discount_value} on ${appliesTo}`;

    // Format dates
    const startDate = d.start_date ? new Date(d.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Now';
    const endDate = d.end_date ? new Date(d.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Ongoing';

    return {
      id: d.discount_id,
      title,
      code: d.discount_name,
      discountText,
      discountValue: d.discount_value,
      isPercentage,
      description,
      appliesTo: d.applies_to,
      startDate,
      endDate,
      rawStartDate: d.start_date,
      rawEndDate: d.end_date
    };
  };

  // Fetch active discounts from backend
  useEffect(() => {
    let mounted = true;

    const fetchDiscounts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await discountService.getAllDiscounts({ active_only: 'true' });
        
        if (response.success && mounted) {
          const discountList = response.discounts?.discounts || [];
          
          if (discountList.length === 0) {
            setError('No active offers available at the moment.');
          } else {
            const mappedOffers = discountList.map(mapDiscountToOffer);
            setOffers(mappedOffers);
          }
        } else if (mounted) {
          setError(response.message || 'Failed to load offers. Please try again later.');
          console.error('Failed to fetch discounts:', response);
        }
      } catch (err) {
        if (mounted) {
          setError('Unable to connect to the server. Please check your connection.');
          console.error('Error loading discounts:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDiscounts();

    return () => {
      mounted = false;
    };
  }, []);

  const handleBookNow = (offer) => {
    console.log('Booking offer:', offer);
    setCurrentPage('booking');
  };

  const copyPromoCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      alert(`Promo code "${code}" copied to clipboard!`);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Special Offers & Discounts
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Take advantage of our exclusive offers and save on your next stay
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="w-12 h-12 text-amber-600 animate-spin mb-4" />
            <p className="text-gray-600 text-lg">Loading available offers...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Offers Grid */}
        {!loading && !error && offers.length > 0 && (
          <>
            <div className="mb-6 text-center">
              <p className="text-gray-700">
                <span className="font-semibold text-amber-600">{offers.length}</span> active offer{offers.length !== 1 ? 's' : ''} available
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Discount Badge Header */}
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingDown className="w-8 h-8 mr-2" />
                      <span className="text-5xl font-bold">{offer.discountText}</span>
                    </div>
                    <div className="text-amber-100 text-sm font-medium uppercase tracking-wide">
                      {offer.isPercentage ? 'Percentage Discount' : 'Fixed Discount'}
                    </div>
                  </div>

                  {/* Offer Details */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {offer.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {offer.description}
                    </p>

                    {/* Valid Period */}
                    <div className="flex items-start mb-4 text-sm text-gray-600">
                      <Calendar className="w-5 h-5 mr-2 flex-shrink-0 text-amber-600" />
                      <div>
                        <div className="font-medium text-gray-700">Valid Period:</div>
                        <div>{offer.startDate} - {offer.endDate}</div>
                      </div>
                    </div>

                    {/* Applies To */}
                    <div className="flex items-center mb-4 text-sm">
                      <Check className="w-5 h-5 mr-2 text-green-600" />
                      <span className="text-gray-700">
                        Applies to: <span className="font-medium">{offer.appliesTo.replace(/_/g, ' ')}</span>
                      </span>
                    </div>

                    {/* Promo Code */}
                    <div className="mb-6">
                      <div className="text-sm text-gray-600 mb-2">Promo Code:</div>
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 font-mono font-bold text-amber-600 text-center">
                          {offer.code}
                        </div>
                        <button
                          onClick={() => copyPromoCode(offer.code)}
                          className="ml-2 p-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                          title="Copy code"
                        >
                          <Tag className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>
                    </div>

                    {/* Book Now Button */}
                    <button
                      onClick={() => handleBookNow(offer)}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Book Now & Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && offers.length === 0 && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Tag className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              No Active Offers
            </h3>
            <p className="text-gray-600 mb-6">
              There are no active discount offers at the moment. Please check back later for great deals!
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default OffersPage;