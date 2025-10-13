import React, { useState } from 'react';
import IntroPage from './components/IntroPage';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import BranchSelectionPage from './components/BranchSelectionPage';
import RoomSelectionPage from './components/RoomSelectionPage';
import BookingPage from './components/BookingPage';
import OffersPage from './components/OffersPage';
import ContactPage from './components/ContactPage';
import LoginPage from './components/LoginPage';
import UserProfilePage from './components/UserProfilePage';
import Footer from './components/Footer';
import './styles/App.css';

const App = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  // Booking flow state
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [pendingBookingRoom, setPendingBookingRoom] = useState(null); // For login redirect
  const [returnToPage, setReturnToPage] = useState(null); // For login redirect

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    
    // Handle login redirect logic
    if (pendingBookingRoom && selectedBranch) {
      // User was trying to book a room, redirect to booking page
      setSelectedRoom(pendingBookingRoom);
      setCurrentPage('booking-form');
      setPendingBookingRoom(null);
    } else if (returnToPage) {
      setCurrentPage(returnToPage);
      setReturnToPage(null);
    } else {
      setCurrentPage('home');
    }
  };

  const handleLogout = () => {
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

  const handleBackToBranches = () => {
    setSelectedBranch(null);
    setSelectedRoom(null);
    setCurrentPage('branch-selection');
  };

  const handleBackToRooms = () => {
    setSelectedRoom(null);
    setCurrentPage('room-selection');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      
      case 'booking':
      case 'branch-selection':
        return (
          <BranchSelectionPage 
            onBranchSelect={handleBranchSelect}
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
          />
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