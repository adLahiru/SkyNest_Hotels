import React, { useState, useEffect } from 'react';
import { MapPin, Star, ArrowRight, Wifi, Car, Coffee, Utensils, Loader2, AlertCircle } from 'lucide-react';
import branchService from '../services/branchService';


const BranchSelectionPage = ({ onBranchSelect, onLoginRequired, setCurrentPage }) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
  const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');
      const isAuth = !!(token && user);
      console.log('Auth Check:', { token: !!token, user: !!user, isAuth });
      setIsAuthenticated(isAuth);
    };

    const fetchBranches = async () => {
      try {
        const response = await branchService.getPublicAvailableBranches();
        console.log('Branch data:', response);
        if (response.success) {
          setBranches(response.branches || []);
        } else {
          setError(response.message || 'Failed to load branches');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching branches:', error);
        setError('Failed to load branches. Please try again later.');
        setLoading(false);
      }
    };

    // Check auth status whenever component renders
    checkAuth();
    fetchBranches();

    // Set up an interval to check auth status periodically
    const authCheckInterval = setInterval(checkAuth, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(authCheckInterval);
  }, []);

  const handleBranchSelect = (branch) => {
    if (!isAuthenticated) {
      // Save branch and redirect to login, then return to branch-selection
      if (onLoginRequired) {
        onLoginRequired(branch);
      } else if (setCurrentPage) {
        setCurrentPage('login');
      }
      return;
    }
    setSelectedBranch(branch.branch_id);
    setTimeout(() => {
      onBranchSelect(branch);
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <h2 className="text-2xl font-semibold text-red-800 mb-4">Error</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 pt-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-light text-gray-800 mb-4">
            Choose Your Destination
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Select from our stunning locations across Sri Lanka. Each branch offers unique experiences 
            while maintaining our signature luxury and hospitality.
          </p>
        </div>

        {/* Branches Grid - Enhanced Design */}
        {branches.length > 0 ? (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {branches.map((branch, index) => (
              <div 
                key={branch.branch_id}
                className={`branch-card bg-white rounded-3xl overflow-hidden shadow-xl card-hover cursor-pointer transform transition-all duration-500 ${selectedBranch === branch.branch_id ? 'scale-105 ring-4 ring-amber-400' : 'hover:scale-105'}`}
                id={`branch-${branch.branch_id}`}
                style={{ animationDelay: `${index * 0.2}s` }}
                onClick={() => handleBranchSelect(branch)}
              >
                {/* Branch Image */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={branch.photo || '/assets/images/external/home/hero-background.jpg'}
                    alt={branch.branch_name}
                    className="w-full h-full object-cover image-hover"
                    onError={(e) => {
                      e.target.src = '/assets/images/external/home/hero-background.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  {/* Rating Badge (static for now) */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                    <span className="text-sm font-semibold text-gray-800">4.8</span>
                  </div>
                  {/* Location Badge */}
                  <div className="absolute bottom-4 left-4 bg-amber-500 text-white px-4 py-2 rounded-full flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">
                      {(() => {
                        if (branch?.address && typeof branch.address === 'string') {
                          const parts = branch.address.split(',').map(s => s.trim()).filter(Boolean);
                          // Show second-to-last segment if available (city), else last (country), else branch name
                          if (parts.length >= 2) return parts[parts.length - 2];
                          if (parts.length === 1) return parts[0];
                        }
                        return branch?.branch_name || 'SkyNest';
                      })()}
                    </span>
                  </div>
                </div>

                {/* Branch Content - Fixed height for alignment */}
                <div className="branch-content flex flex-col p-8">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">{branch.branch_name}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed flex-grow">Experience our exceptional hospitality at {branch.branch_name}. Discover luxury and comfort in this beautiful location.</p>

                  {/* Branch Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-amber-600">12</div>
                      <div className="text-sm text-gray-500">Rooms</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-amber-600">$120 - $500</div>
                      <div className="text-sm text-gray-500">Per Night</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Features</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {['City View', 'Business Center', 'Fine Dining', 'Free WiFi'].map((feature, idx) => (
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
                      {[Wifi, Car, Coffee, Utensils].map((IconComponent, idx) => (
                        <div key={idx} className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                          <IconComponent className="w-3 h-3" />
                          <span>{['Free WiFi', 'Parking', '24/7 Service', 'Restaurant'][idx]}</span>
                        </div>
                      ))}
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
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 mt-auto ${selectedBranch === branch.branch_id ? 'bg-amber-500 text-white transform scale-105' : 'btn-primary hover:shadow-xl'}`}
                  >
                    {!isAuthenticated ? (
                      <>
                        <ArrowRight className="w-5 h-5" />
                        <span>Login to Continue</span>
                      </>
                    ) : (
                      <>
                        <span>{selectedBranch === branch.branch_id ? 'Selected' : 'Select This Branch'}</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Branches Available</h3>
            <p className="text-gray-600">Please check back later for available locations.</p>
          </div>
        )}
        {/* Help Text */}
        {branches.length > 0 && (
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
          .grid.md\:grid-cols-2 .branch-card,
          .grid.lg\:grid-cols-3 .branch-card {
            height: 100%;
          }
        }
      `}</style>
      </div>
    </div>
  );
};

export default BranchSelectionPage;