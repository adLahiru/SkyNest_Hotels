import React, { useState } from 'react';
import { Calendar, Users, Bed, MapPin, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const BookingPage = ({ user, selectedRoom, selectedBranch, onBackToRooms }) => {
  // Map room type fields to expected format
  const roomName = selectedRoom?.type || selectedRoom?.name || '';
  const roomPrice = selectedRoom?.daily_rate || selectedRoom?.price || 0;
  const roomCapacity = selectedRoom?.capacity || selectedRoom?.occupancy || 2;
  const branchName = selectedBranch?.branch_name || selectedBranch?.name || '';
  const branchId = selectedBranch?.branch_id || selectedBranch?.id || '';

  const [bookingForm, setBookingForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    checkIn: '',
    checkOut: '',
    guests: roomCapacity.toString(),
    roomType: selectedRoom?.type || 'standard',
    roomId: selectedRoom?.room_type_id || selectedRoom?.id || '',
    roomName: roomName,
    specialRequests: '',
    location: branchId,
    branchName: branchName,
    totalPrice: roomPrice
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);



  const validateForm = () => {
    const errors = {};
    
    if (!bookingForm.name.trim()) errors.name = 'Name is required';
    if (!bookingForm.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(bookingForm.email)) errors.email = 'Email is invalid';
    if (!bookingForm.phone.trim()) errors.phone = 'Phone number is required';
    if (!bookingForm.checkIn) errors.checkIn = 'Check-in date is required';
    if (!bookingForm.checkOut) errors.checkOut = 'Check-out date is required';
    
    if (bookingForm.checkIn && bookingForm.checkOut) {
      const checkIn = new Date(bookingForm.checkIn);
      const checkOut = new Date(bookingForm.checkOut);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkIn < today) errors.checkIn = 'Check-in date cannot be in the past';
      if (checkOut <= checkIn) errors.checkOut = 'Check-out date must be after check-in date';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateNights = () => {
    if (bookingForm.checkIn && bookingForm.checkOut) {
      const checkIn = new Date(bookingForm.checkIn);
      const checkOut = new Date(bookingForm.checkOut);
      const diffTime = checkOut - checkIn;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    return roomPrice * nights;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setShowConfirmation(true);
      setIsSubmitting(false);
    }, 2000);
  };

  const resetForm = () => {
    setShowConfirmation(false);
    // Navigate back to branch selection or handle as needed
    if (onBackToRooms) {
      onBackToRooms();
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-4xl font-light text-gray-800 mb-6">Booking Confirmed!</h1>
            
            <div className="bg-gray-50 rounded-2xl p-8 mb-8 text-left">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Booking Details</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Guest Name:</span>
                  <span className="font-medium">{bookingForm.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{bookingForm.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{bookingForm.branchName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Room:</span>
                  <span className="font-medium">{bookingForm.roomName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">{new Date(bookingForm.checkIn).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">{new Date(bookingForm.checkOut).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests:</span>
                  <span className="font-medium">{bookingForm.guests}</span>
                </div>
                <div className="flex justify-between border-t pt-4">
                  <span className="text-gray-600">Total ({calculateNights()} nights):</span>
                  <span className="text-2xl font-bold text-amber-600">${calculateTotal()}</span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-8">
              A confirmation email has been sent to {bookingForm.email}. 
              Our team will contact you within 24 hours to finalize your reservation.
            </p>
            
            <div className="space-y-4">
              <button onClick={resetForm} className="btn-primary w-full">
                Make Another Booking
              </button>
              <p className="text-sm text-gray-500">
                Booking Reference: SKN{Date.now().toString().slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 pt-32">
      <div className="max-w-6xl mx-auto px-6">
        {/* Back Button */}
        {onBackToRooms && (
          <button 
            onClick={onBackToRooms}
            className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 mb-6 transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Room Selection</span>
          </button>
        )}

        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-light text-gray-800 mb-4">Complete Your Booking</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            You're almost there! Complete your booking for {roomName} at {branchName}.
          </p>
        </div>

        {/* Selected Room Summary */}
        {selectedRoom && selectedBranch && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-amber-800 mb-4">Booking Summary</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-amber-600 font-medium">Location:</span>
                  <p className="text-gray-800">{branchName}</p>
                </div>
                <div>
                  <span className="text-amber-600 font-medium">Room:</span>
                  <p className="text-gray-800">{roomName}</p>
                </div>
                <div>
                  <span className="text-amber-600 font-medium">Price:</span>
                  <p className="text-gray-800">${roomPrice} per night</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto">
          {/* Booking Form */}
          <div>
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                    <Users className="w-6 h-6 mr-3 text-amber-600" />
                    Guest Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={bookingForm.name}
                        onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                        className={`form-input ${formErrors.name ? 'border-red-500' : ''}`}
                        placeholder="SkyNest"
                      />
                      {formErrors.name && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {formErrors.name}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={bookingForm.email}
                        onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                        className={`form-input ${formErrors.email ? 'border-red-500' : ''}`}
                        placeholder="abc@gmail.com"
                      />
                      {formErrors.email && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                      className={`form-input ${formErrors.phone ? 'border-red-500' : ''}`}
                      placeholder="+94 123 456721"
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stay Details */}
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                    <Calendar className="w-6 h-6 mr-3 text-amber-600" />
                    Stay Details
                  </h3>
                  
                  <div className="space-y-6">

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Check-in Date *
                        </label>
                        <input
                          type="date"
                          value={bookingForm.checkIn}
                          onChange={(e) => setBookingForm({...bookingForm, checkIn: e.target.value})}
                          className={`form-input ${formErrors.checkIn ? 'border-red-500' : ''}`}
                          min={new Date().toISOString().split('T')[0]}
                        />
                        {formErrors.checkIn && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {formErrors.checkIn}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Check-out Date *
                        </label>
                        <input
                          type="date"
                          value={bookingForm.checkOut}
                          onChange={(e) => setBookingForm({...bookingForm, checkOut: e.target.value})}
                          className={`form-input ${formErrors.checkOut ? 'border-red-500' : ''}`}
                          min={bookingForm.checkIn || new Date().toISOString().split('T')[0]}
                        />
                        {formErrors.checkOut && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {formErrors.checkOut}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Guests (Max: {roomCapacity})
                        </label>
                        <select
                          value={bookingForm.guests}
                          onChange={(e) => setBookingForm({...bookingForm, guests: e.target.value})}
                          className="form-input"
                        >
                          {Array.from({length: roomCapacity}, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>
                              {num} Guest{num > 1 ? 's' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        value={bookingForm.specialRequests}
                        onChange={(e) => setBookingForm({...bookingForm, specialRequests: e.target.value})}
                        rows="4"
                        className="form-input"
                        placeholder="Any special requirements or requests..."
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full py-4 text-lg rounded-xl font-semibold transition-all duration-300 ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'btn-primary'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner mr-3"></div>
                      Processing Booking...
                    </div>
                  ) : (
                    'Complete Booking'
                  )}
                </button>
              </form>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default BookingPage;