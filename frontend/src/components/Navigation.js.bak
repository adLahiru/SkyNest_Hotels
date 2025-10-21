import React, { useState } from 'react';
import { Menu, X, Bed, User, LogOut } from 'lucide-react';

const Navigation = ({ currentPage, setCurrentPage, isLoggedIn, user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Define staff roles that should see dashboard
  const isStaff = user && ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING'].includes(user.role);

  // Navigation items based on user role
  const navItems = isStaff 
    ? [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'booking', label: 'Bookings' },
        { id: 'offers', label: 'Offers' }
      ]
    : [
        { id: 'home', label: 'Home' },
        { id: 'booking', label: 'Booking' },
        { id: 'offers', label: 'Offers' },
        { id: 'contact', label: 'Contact' }
      ];

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-2xl border-b border-blue-700">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handlePageChange('home')}>
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-xl float">
              <Bed className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-light tracking-wider text-white">SKY NEST HOTELS</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.id)}
                className={`nav-link px-8 py-3 rounded-full text-sm font-semibold tracking-wider uppercase transition-all duration-300 ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xl transform scale-105'
                    : 'text-white hover:bg-white/10 border border-white/20 hover:border-amber-400/50'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            {/* Login/User Menu */}
            {!isLoggedIn ? (
              <button
                onClick={() => handlePageChange('login')}
                className="px-8 py-3 rounded-full text-sm font-semibold tracking-wider uppercase transition-all duration-300 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-xl hover:from-green-600 hover:to-green-700 transform hover:scale-105"
              >
                Login
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">{user?.name || 'User'}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        handlePageChange('profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4 animate-fade-in-down">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.id)}
                className={`w-full px-6 py-3 rounded-xl text-left uppercase font-semibold transition-all duration-300 ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            {/* Mobile Login/User Menu */}
            {!isLoggedIn ? (
              <button
                onClick={() => handlePageChange('login')}
                className="w-full px-6 py-3 rounded-xl text-left uppercase font-semibold transition-all duration-300 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
              >
                Login
              </button>
            ) : (
              <div className="space-y-2">
                <div className="px-6 py-3 bg-white/10 rounded-xl border border-white/20">
                  <p className="text-sm text-gray-300">Signed in as</p>
                  <p className="text-white font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    handlePageChange('profile');
                    setMenuOpen(false);
                  }}
                  className="w-full px-6 py-3 rounded-xl text-left uppercase font-semibold transition-all duration-300 bg-purple-500 text-white hover:bg-purple-600 flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full px-6 py-3 rounded-xl text-left uppercase font-semibold transition-all duration-300 bg-red-500 text-white hover:bg-red-600 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navigation;