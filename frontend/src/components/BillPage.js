import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Calendar, 
  Bed, 
  MapPin, 
  User, 
  Mail, 
  Phone,
  Tag,
  TrendingDown,
  Check,
  X,
  Loader,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Download,
  PlusCircle
} from 'lucide-react';
import { discountService } from '../services';

const BillPage = ({ bookingData, onBack, onConfirm, onMakeAnotherBooking }) => {
  // State management
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [validationSuccess, setValidationSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Calculate base amounts
  const calculateNights = () => {
    if (bookingData?.checkIn && bookingData?.checkOut) {
      const checkIn = new Date(bookingData.checkIn);
      const checkOut = new Date(bookingData.checkOut);
      const diffTime = checkOut - checkIn;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
  };

  const nights = calculateNights();
  const roomPrice = bookingData?.roomPrice || bookingData?.totalPrice || 0;
  const subtotal = roomPrice * nights;
  const taxRate = 0.10; // 10% tax
  const taxAmount = subtotal * taxRate;

  // Calculate discount amount
  const calculateDiscountAmount = () => {
    if (!appliedDiscount) return 0;

    if (appliedDiscount.type === 'rate') {
      // Percentage discount
      return Math.round((subtotal * appliedDiscount.discount_value) / 100);
    } else {
      // Fixed amount discount
      return Math.min(appliedDiscount.discount_value, subtotal);
    }
  };

  const discountAmount = calculateDiscountAmount();
  const totalAfterDiscount = subtotal - discountAmount;
  const finalTotal = totalAfterDiscount + taxAmount;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Validate and apply discount code
  const handleApplyDiscount = async () => {
    if (!promoCode.trim()) {
      setValidationError('Please enter a promo code');
      return;
    }

    setIsValidating(true);
    setValidationError('');
    setValidationSuccess('');

    try {
      // Fetch all active discounts and find matching code
      const response = await discountService.getAllDiscounts({ active_only: 'true' });

      if (response.success) {
        const discounts = response.discounts?.discounts || [];
        const matchedDiscount = discounts.find(
          (d) => d.discount_name.toUpperCase() === promoCode.toUpperCase()
        );

        if (matchedDiscount) {
          // Check if discount applies to rooms
          if (matchedDiscount.applies_to === 'ROOMS' || 
              matchedDiscount.applies_to === 'SERVICES_AND_ROOMS') {
            setAppliedDiscount(matchedDiscount);
            setValidationSuccess(`Discount applied: ${matchedDiscount.discount_value}${matchedDiscount.type === 'rate' ? '%' : '$'} off!`);
            setValidationError('');
          } else {
            setValidationError('This discount does not apply to room bookings');
          }
        } else {
          setValidationError('Invalid promo code or discount has expired');
        }
      } else {
        setValidationError('Unable to validate promo code. Please try again.');
      }
    } catch (error) {
      console.error('Error validating discount:', error);
      setValidationError('Error validating promo code. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  // Remove applied discount
  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setPromoCode('');
    setValidationSuccess('');
    setValidationError('');
  };

  // Handle payment confirmation
  const handleConfirmPayment = async () => {
    setIsProcessing(true);

    // Prepare booking data with discount
    const finalBookingData = {
      ...bookingData,
      nights,
      subtotal,
      discount: appliedDiscount ? {
        code: appliedDiscount.discount_name,
        type: appliedDiscount.type,
        value: appliedDiscount.discount_value,
        amount: discountAmount
      } : null,
      taxAmount,
      finalTotal,
      bookingDate: new Date().toISOString()
    };

    // Simulate booking confirmation processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowConfirmation(true);
    }, 1500);
  };

  // Handle final confirmation
  const handleFinalConfirm = () => {
    const finalBookingData = {
      ...bookingData,
      nights,
      subtotal,
      discount: appliedDiscount ? {
        code: appliedDiscount.discount_name,
        type: appliedDiscount.type,
        value: appliedDiscount.discount_value,
        amount: discountAmount
      } : null,
      taxAmount,
      finalTotal,
      bookingDate: new Date().toISOString()
    };

    if (onConfirm) {
      onConfirm(finalBookingData);
    }
  };

  // Handle download confirmation
  const handleDownloadConfirmation = () => {
    // Create a printable version
    const bookingReference = `SKY${new Date().getTime().toString().slice(-8)}`;
    const printContent = `
      ============================================
      SKYNEST HOTELS - BOOKING CONFIRMATION
      ============================================
      
      Booking Reference: ${bookingReference}
      Date: ${new Date().toLocaleDateString()}
      
      GUEST INFORMATION
      ----------------
      Name: ${bookingData?.name}
      Email: ${bookingData?.email}
      Phone: ${bookingData?.phone}
      
      BOOKING DETAILS
      ---------------
      Branch: ${bookingData?.branchName}
      Room Type: ${bookingData?.roomType}
      Room: ${bookingData?.roomName}
      Check-in: ${formatDate(bookingData?.checkIn)}
      Check-out: ${formatDate(bookingData?.checkOut)}
      Nights: ${nights}
      Guests: ${bookingData?.guests}
      
      PAYMENT SUMMARY
      ---------------
      Room Charges: ${formatCurrency(subtotal)}
      ${appliedDiscount ? `Discount (${appliedDiscount.discount_name}): -${formatCurrency(discountAmount)}` : ''}
      Tax (10%): ${formatCurrency(taxAmount)}
      Total Amount: ${formatCurrency(finalTotal)}
      
      ${bookingData?.specialRequests ? `Special Requests: ${bookingData.specialRequests}` : ''}
      
      ============================================
      Thank you for choosing SkyNest Hotels!
      ============================================
    `;
    
    // Create a blob and download
    const blob = new Blob([printContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SkyNest_Booking_${bookingReference}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Handle make another booking
  const handleMakeAnotherBooking = () => {
    if (onMakeAnotherBooking) {
      onMakeAnotherBooking();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 pt-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-amber-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Booking
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Booking Summary
              </h1>
              <p className="text-gray-600 mt-2">Review your booking details and apply discount before confirming</p>
            </div>
            <Receipt className="w-12 h-12 text-amber-600" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column - Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Guest Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-amber-600" />
                Guest Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <User className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="font-medium w-24">Name:</span>
                  <span>{bookingData?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Mail className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="font-medium w-24">Email:</span>
                  <span>{bookingData?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Phone className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="font-medium w-24">Phone:</span>
                  <span>{bookingData?.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Bed className="w-5 h-5 mr-2 text-amber-600" />
                Booking Details
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-start pb-3 border-b">
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900 flex items-center mt-1">
                      <MapPin className="w-4 h-4 mr-1 text-amber-600" />
                      {bookingData?.branchName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Room Type</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {bookingData?.roomName || bookingData?.roomType || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-start pb-3 border-b">
                  <div>
                    <p className="text-sm text-gray-500">Check-in</p>
                    <p className="font-medium text-gray-900 flex items-center mt-1">
                      <Calendar className="w-4 h-4 mr-1 text-green-600" />
                      {formatDate(bookingData?.checkIn)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Check-out</p>
                    <p className="font-medium text-gray-900 flex items-center mt-1">
                      <Calendar className="w-4 h-4 mr-1 text-red-600" />
                      {formatDate(bookingData?.checkOut)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Number of Nights</p>
                    <p className="font-semibold text-gray-900 text-lg mt-1">{nights}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Guests</p>
                    <p className="font-semibold text-gray-900 text-lg mt-1">{bookingData?.guests || 1}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rate per Night</p>
                    <p className="font-semibold text-amber-600 text-lg mt-1">
                      {formatCurrency(roomPrice)}
                    </p>
                  </div>
                </div>

                {bookingData?.specialRequests && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-500 mb-2">Special Requests</p>
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                      {bookingData.specialRequests}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Promo Code Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-amber-600" />
                Apply Promo Code
              </h2>

              {!appliedDiscount ? (
                <div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && handleApplyDiscount()}
                      placeholder="Enter promo code"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      disabled={isValidating}
                    />
                    <button
                      onClick={handleApplyDiscount}
                      disabled={isValidating || !promoCode.trim()}
                      className="px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                      {isValidating ? (
                        <>
                          <Loader className="w-5 h-5 mr-2 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        'Apply'
                      )}
                    </button>
                  </div>

                  {validationError && (
                    <div className="mt-3 flex items-center text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {validationError}
                    </div>
                  )}

                  <p className="mt-3 text-sm text-gray-500">
                    Have a promo code? Enter it above to get a discount on your booking.
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-900">
                          {appliedDiscount.discount_name}
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          {appliedDiscount.type === 'rate' 
                            ? `${appliedDiscount.discount_value}% discount` 
                            : `${formatCurrency(appliedDiscount.discount_value)} discount`}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          You save {formatCurrency(discountAmount)}!
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveDiscount}
                      className="text-green-600 hover:text-green-800 transition-colors"
                      title="Remove discount"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column - Price Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <TrendingDown className="w-5 h-5 mr-2 text-amber-600" />
                Price Summary
              </h2>

              <div className="space-y-4 mb-6">
                {/* Subtotal */}
                <div className="flex justify-between text-gray-700">
                  <span>Room ({nights} night{nights !== 1 ? 's' : ''})</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>

                {/* Discount */}
                {appliedDiscount && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      Discount
                    </span>
                    <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                {/* Tax */}
                <div className="flex justify-between text-gray-700">
                  <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
                  <span className="font-medium">{formatCurrency(taxAmount)}</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-amber-600">
                      {formatCurrency(finalTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>

              {/* Security Note */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500 text-center">
                  🔒 Your booking information is secure and encrypted
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Booking Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 rounded-t-2xl">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-white rounded-full p-3">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-center mb-2">Booking Confirmed!</h2>
              <p className="text-center text-green-100">
                Your reservation has been successfully confirmed
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              
              {/* Booking Reference */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 text-center">
                <p className="text-sm text-amber-700 mb-1">Booking Reference</p>
                <p className="text-2xl font-bold text-amber-900">
                  SKY{new Date().getTime().toString().slice(-8)}
                </p>
              </div>

              {/* Guest Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2 text-green-600" />
                  Guest Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold text-gray-900">{bookingData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold text-gray-900">{bookingData?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-semibold text-gray-900">{bookingData?.phone}</span>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Bed className="w-5 h-5 mr-2 text-green-600" />
                  Booking Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Branch:</span>
                    <span className="font-semibold text-gray-900">{bookingData?.branchName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Type:</span>
                    <span className="font-semibold text-gray-900">{bookingData?.roomType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room:</span>
                    <span className="font-semibold text-gray-900">{bookingData?.roomName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-semibold text-gray-900">{formatDate(bookingData?.checkIn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-semibold text-gray-900">{formatDate(bookingData?.checkOut)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nights:</span>
                    <span className="font-semibold text-gray-900">{nights} night{nights !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-semibold text-gray-900">{bookingData?.guests}</span>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Receipt className="w-5 h-5 mr-2 text-green-600" />
                  Payment Summary
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Charges:</span>
                    <span className="text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedDiscount.discount_name}):</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (10%):</span>
                    <span className="text-gray-900">{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                      <span className="text-2xl font-bold text-green-600">{formatCurrency(finalTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {bookingData?.specialRequests && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Special Requests</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{bookingData.specialRequests}</p>
                  </div>
                </div>
              )}

              {/* Confirmation Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 text-center">
                  📧 A confirmation email has been sent to <strong>{bookingData?.email}</strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Download Confirmation Button */}
                <button
                  onClick={handleDownloadConfirmation}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Confirmation
                </button>

                {/* Make Another Booking Button */}
                <button
                  onClick={handleMakeAnotherBooking}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Make Another Booking
                </button>

                {/* Done Button */}
                <button
                  onClick={handleFinalConfirm}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Done
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default BillPage;
