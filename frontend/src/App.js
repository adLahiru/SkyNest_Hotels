import React, { useState, useEffect } from 'react';
import IntroPage from './components/IntroPage';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import BranchSelectionPage from './components/BranchSelectionPage';
import RoomSelectionPage from './components/RoomSelectionPage';
import BookingPage from './components/BookingPage';
import BillPage from './components/BillPage';
import OffersPage from './components/OffersPage';
import ContactPage from './components/ContactPage';
import LoginPage from './components/LoginPage';
import UserProfilePage from './components/UserProfilePage';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import authService from './services/authService';
import './styles/App.css';

const App = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  // Booking flow state
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [billData, setBillData] = useState(null);
  const [pendingBookingRoom, setPendingBookingRoom] = useState(null); // For login redirect
  const [returnToPage, setReturnToPage] = useState(null); // For login redirect

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuth = () => {
      if (authService.isAuthenticated()) {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setIsLoggedIn(true);
          setUser(currentUser);
        }
      }
    };
    
    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    
    // Check if user is staff (should see dashboard)
    const isStaff = ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING'].includes(userData.role);
    
    // Handle login redirect logic
    if (pendingBookingRoom && selectedBranch) {
      // User was trying to book a room, redirect to booking page
      setSelectedRoom(pendingBookingRoom);
      setCurrentPage('booking-form');
      setPendingBookingRoom(null);
    } else if (returnToPage) {
      setCurrentPage(returnToPage);
      setReturnToPage(null);
    } else if (isStaff) {
      // Staff members should go to dashboard after login
      setCurrentPage('dashboard');
    } else {
      // Regular guests go to home
      setCurrentPage('home');
    }
  };

  const handleLogout = async () => {
    // Call backend logout API
    await authService.logout();
    
    setIsLoggedIn(false);
    setUser(null);
    setSelectedBranch(null);
    setSelectedRoom(null);
    setPendingBookingRoom(null);
    setReturnToPage(null);
    setCurrentPage('home');
  };

  const handleUpdateUser = (updatedUserData) => {
    setUser({ ...user, ...updatedUserData });
  };

  // Booking flow handlers
  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    setCurrentPage('room-selection');
  };

  const handleRoomSelect = (room, branch) => {
    setSelectedRoom(room);
    setSelectedBranch(branch);
    setCurrentPage('booking-form');
  };

  const handleLoginRequired = (room) => {
    setPendingBookingRoom(room);
    setCurrentPage('login');
  };

  const handleBranchLoginRequired = (branch) => {
    // Save the selected branch and set return page
    setSelectedBranch(branch);
    setReturnToPage('branch-selection');
    setCurrentPage('login');
  };

  const handleBackToBranches = () => {
    setSelectedBranch(null);
    setSelectedRoom(null);
    setCurrentPage('branch-selection');
  };

  const handleBackToRooms = () => {
    setSelectedRoom(null);
    setCurrentPage('room-selection');
  };

  const handleProceedToBill = (bookingData) => {
    setBillData(bookingData);
    setCurrentPage('bill');
  };

  const handleBackToBooking = () => {
    setCurrentPage('booking-form');
  };

  const handleConfirmPayment = async (finalBillData) => {
    // TODO: Implement booking storage in database
    console.log('Confirming booking:', finalBillData);
    // For now, show a success message
    alert('Booking confirmed successfully! Thank you for choosing SkyNest Hotels.');
    // Reset booking flow
    setSelectedBranch(null);
    setSelectedRoom(null);
    setBillData(null);
    setCurrentPage('home');
  };

  const handleMakeAnotherBooking = () => {
    // Reset booking state but keep user logged in
    setSelectedBranch(null);
    setSelectedRoom(null);
    setBillData(null);
    setCurrentPage('branch-selection');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      
      case 'dashboard':
        return <Dashboard />;
      
      case 'booking':
      case 'branch-selection':
        return (
          <BranchSelectionPage 
            onBranchSelect={handleBranchSelect}
            onLoginRequired={handleBranchLoginRequired}
            setCurrentPage={setCurrentPage}
          />
        );
      
      case 'room-selection':
        return (
          <RoomSelectionPage 
            selectedBranch={selectedBranch}
            onRoomSelect={handleRoomSelect}
            onBackToBranches={handleBackToBranches}
            isLoggedIn={isLoggedIn}
            onLoginRequired={handleLoginRequired}
          />
        );
      
      case 'booking-form':
        return (
          <BookingPage 
            user={user}
            selectedRoom={selectedRoom}
            selectedBranch={selectedBranch}
            onBackToRooms={handleBackToRooms}
            onProceedToBill={handleProceedToBill}
          />
        );

      case 'bill':
        return billData ? (
          <BillPage 
            bookingData={billData}
            onBack={handleBackToBooking}
            onConfirm={handleConfirmPayment}
            onMakeAnotherBooking={handleMakeAnotherBooking}
          />
        ) : (
          <HomePage setCurrentPage={setCurrentPage} />
        );
        
      case 'offers':
        return <OffersPage setCurrentPage={setCurrentPage} />;
        
      case 'contact':
        return <ContactPage />;
        
      case 'login':
        return (
          <LoginPage 
            onLogin={handleLogin} 
            setCurrentPage={setCurrentPage}
          />
        );
        
      case 'profile':
        return isLoggedIn ? (
          <UserProfilePage 
            user={user}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
          />
        ) : (
          <LoginPage 
            onLogin={handleLogin} 
            setCurrentPage={setCurrentPage}
          />
        );
        
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Intro/Landing Page */}
      {showIntro && <IntroPage onEnter={() => setShowIntro(false)} />}
      
      {/* Main Website */}
      {!showIntro && (
        <>
          <Navigation 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage}
            isLoggedIn={isLoggedIn}
            user={user}
            onLogout={handleLogout}
          />
          
          <div className="page-transition">
            {renderCurrentPage()}
          </div>

          <Footer />
        </>
      )}
    </div>
  );
};

export default App;