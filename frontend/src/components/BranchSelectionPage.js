import React, { useState, useEffect } from 'react';
import { MapPin, Star, LogIn } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8084/api';

const BranchSelectionPage = ({ onBranchSelect, setCurrentPage }) => {
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
        const response = await axios.get(`${API_URL}/branches/public`);
        console.log('Branch data:', response.data);
        setBranches(response.data.data || []);
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
      // Navigate to login page using setCurrentPage
      if (setCurrentPage) {
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

        {/* Branches Grid */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {branches.map((branch) => (
            <div 
              key={branch.branch_id}
              className={`bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                selectedBranch === branch.branch_id ? 'ring-4 ring-amber-400 transform scale-105' : 'hover:scale-105'
              }`}
              onClick={() => handleBranchSelect(branch)}
            >
              {/* Branch Image */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={branch.photo || '/assets/images/external/home/hero-background.jpg'}
                  alt={branch.branch_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/assets/images/external/home/hero-background.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                
                {/* Location Badge */}
                <div className="absolute bottom-4 left-4 bg-amber-500 text-white px-4 py-2 rounded-full flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{branch.branch_name.split(' ')[2] || 'Unknown'}</span>
                </div>
              </div>

              {/* Branch Content */}
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">{branch.branch_name}</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-600">{branch.address}</span>
                  </div>
                  {branch.email && (
                    <div className="text-gray-600">
                      <span className="font-semibold">Email:</span> {branch.email}
                    </div>
                  )}
                  {branch.phone && (
                    <div className="text-gray-600">
                      <span className="font-semibold">Phone:</span> {branch.phone}
                    </div>
                  )}
                  <button 
                    className={`w-full mt-4 py-3 px-4 rounded-xl text-white font-semibold transition-all duration-300 ${
                      selectedBranch === branch.branch_id 
                        ? 'bg-amber-600' 
                        : 'bg-amber-500 hover:bg-amber-600'
                    } flex items-center justify-center gap-2`}
                  >
                    {!isAuthenticated ? (
                      <>
                        <LogIn className="w-5 h-5" />
                        <span>Login to Continue</span>
                      </>
                    ) : (
                      selectedBranch === branch.branch_id ? 'Selected' : 'Select Branch'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BranchSelectionPage;