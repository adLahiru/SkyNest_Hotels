import React, { useState, useEffect } from 'react';
import { MapPin, Star, ArrowRight, Wifi, Car, Coffee, Flower2, Utensils, Loader2, AlertCircle } from 'lucide-react';
import branchService from '../services/branchService';
import roomService from '../services/roomService';

const BranchSelectionPage = ({ onBranchSelect }) => {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch branches from API
  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching branches from API...');
      // Use public endpoint (no authentication required)
      const response = await branchService.getAllBranchesPublic();
      console.log('Branches API response:', response);
      
      if (response.success && response.branches) {
        console.log('Branches found:', response.branches.length);
        
        // Fetch room count for each branch
        const branchesWithRoomCount = await Promise.all(
          response.branches.map(async (branch) => {
            let roomCount = 0;
            try {
              // Use public endpoint for rooms
              console.log(`Fetching rooms for branch ${branch.branch_name} (${branch.branch_id})...`);
              const roomsResponse = await roomService.getAllRoomsPublic({ branch_id: branch.branch_id });
              console.log(`Rooms response for ${branch.branch_name}:`, roomsResponse);
              
              if (roomsResponse.success && Array.isArray(roomsResponse.rooms)) {
                roomCount = roomsResponse.rooms.length;
              } else {
                console.warn(`Failed to get rooms for ${branch.branch_name}:`, roomsResponse.message);
                roomCount = 0;
              }
              
              console.log(`Branch ${branch.branch_name}: ${roomCount} rooms`);
            } catch (err) {
              console.error(`Error fetching rooms for branch ${branch.branch_name}:`, err);
              roomCount = 0;
            }
              
            // Convert BLOB photo to base64 if exists
            let imageUrl = '/Images/park-hyatt-sydney.png'; // Default image
            if (branch.photo) {
              // If photo is already a base64 string or URL
              if (typeof branch.photo === 'string') {
                imageUrl = branch.photo.startsWith('data:') ? branch.photo : `data:image/jpeg;base64,${branch.photo}`;
              }
            }
            
            return {
              id: branch.branch_id,
              name: branch.branch_name,
              location: branch.branch_name.replace('Sky Nest ', '').replace('SkyNest ', ''),
              address: branch.address,
              email: branch.email || 'info@skynest.com',
              phone: branch.phone || 'N/A',
              description: `Experience our exceptional hospitality at ${branch.branch_name}. Discover luxury and comfort in this beautiful location.`,
              image: imageUrl,
              fallback: '/Images/park-hyatt-sydney.png',
              features: ['City View', 'Business Center', 'Fine Dining', 'Free WiFi'],
              amenities: [
                { icon: Wifi, name: 'Free WiFi' },
                { icon: Car, name: 'Parking' },
                { icon: Coffee, name: '24/7 Service' },
                { icon: Utensils, name: 'Restaurant' }
              ],
              rating: 4.5 + Math.random() * 0.4, // Random rating between 4.5-4.9
              rooms: roomCount,
              priceRange: '$120 - $500',
              manager_name: branch.manager_name || 'Not assigned',
              manager_id: branch.manager_id
            };
          })
        );
        
        console.log('Processed branches:', branchesWithRoomCount);
        setBranches(branchesWithRoomCount);
      } else {
        console.error('API response not successful:', response);
        setError(response.message || 'Failed to load branches');
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // More specific error messages
      if (err.response?.status === 401) {
        setError('Authentication required. Please login to view branches.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view branches.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.message === 'Network Error') {
        setError('Cannot connect to server. Please check if the backend is running on port 8084.');
      } else {
        setError(err.response?.data?.message || 'Unable to load branches. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

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
        <div className="text-center mb-16" id="header">
          <h1 className="text-5xl md:text-6xl font-light text-gray-800 mb-4">
            Choose Your Destination
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Select from our stunning locations across Sri Lanka. Each branch offers unique experiences 
            while maintaining our signature luxury and hospitality.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-16 h-16 text-amber-500 animate-spin mb-4" />
            <p className="text-gray-600 text-lg">Loading our branches...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-red-800 mb-2">Unable to Load Branches</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <button 
                onClick={fetchBranches}
                className="btn-primary px-6 py-3 rounded-xl font-semibold"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Branches Grid - Display in 3 columns with perfect alignment */}
        {!loading && !error && branches.length > 0 && (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {branches.map((branch, index) => (
              <div 
                key={branch.id}
                className={`branch-card bg-white rounded-3xl overflow-hidden shadow-xl card-hover cursor-pointer transform transition-all duration-500 ${selectedBranch === branch.id ? 'scale-105 ring-4 ring-amber-400' : 'hover:scale-105'}`}
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
                    <span className="text-sm font-semibold text-gray-800">{branch.rating.toFixed(1)}</span>
                  </div>

                  {/* Location Badge */}
                  <div className="absolute bottom-4 left-4 bg-amber-500 text-white px-4 py-2 rounded-full flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{branch.location}</span>
                  </div>
                </div>

                {/* Branch Content - Fixed height for alignment */}
                <div className="branch-content flex flex-col p-8">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">{branch.name}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed flex-grow">{branch.description}</p>

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

                  {/* Select Button - Aligned at bottom */}
                  <button 
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 mt-auto ${
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
        )}

        {/* No Branches Found */}
        {!loading && !error && branches.length === 0 && (
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Branches Available</h3>
            <p className="text-gray-600">Please check back later for available locations.</p>
          </div>
        )}

        {/* Help Text */}
        {!loading && !error && branches.length > 0 && (
          <div className="text-center mt-16" id="help-text">
            <div className="max-w-2xl mx-auto p-6 bg-blue-50 rounded-2xl">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Need Help Choosing?</h3>
              <p className="text-blue-600 text-sm leading-relaxed">
                Each of our branches offers unique experiences tailored to your preferences. 
                Click on any branch to see available rooms and make your reservation.
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* Cards are visible by default - no reveal animation delay */
        .branch-card {
          opacity: 1;
          transform: translateY(0);
        }

        /* Perfect alignment for branch cards */
        .branch-card {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .branch-content {
          min-height: 700px;
        }

        /* Ensure all cards in a row have same height */
        @media (min-width: 768px) {
          .grid.md\\:grid-cols-2 .branch-card,
          .grid.lg\\:grid-cols-3 .branch-card {
            height: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default BranchSelectionPage;