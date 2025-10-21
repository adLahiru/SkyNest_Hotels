import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import BillDetails from './BillDetails';
import PaymentManager from './PaymentManager';
import '../styles/BookingManagement.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const BookingManagement = ({ booking, onStatusChange }) => {
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const validateCheckout = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/bookings/${booking.booking_id}/checkout-validation`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setValidation(response.data);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  }, [booking.booking_id]);

  useEffect(() => {
    if (booking.booking_status === 'checked_in') {
      validateCheckout();
    }
  }, [booking.booking_id, booking.booking_status, validateCheckout]);

  const handleCheckIn = async () => {
    if (!window.confirm('Are you sure you want to check in this guest?')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/api/bookings/${booking.booking_id}/checkin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Check-in successful! Room is now occupied.');
      if (onStatusChange) {
        onStatusChange(response.data.booking);
      }
    } catch (error) {
      console.error('Check-in failed:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Check-in failed';
      alert(`Check-in failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!validation?.validations.canCheckout) {
      alert('Cannot checkout: Payment not complete or requirements not met');
      return;
    }

    if (!window.confirm('Are you sure you want to check out this guest?')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/api/bookings/${booking.booking_id}/checkout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Check-out successful! Room is now available.');
      if (onStatusChange) {
        onStatusChange(response.data.booking);
      }
    } catch (error) {
      console.error('Check-out failed:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Check-out failed';
      alert(`Check-out failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const renderBookingInfo = () => (
    <div className="booking-info">
      <h3>Booking Details</h3>
      <div className="info-grid">
        <div className="info-item">
          <span className="label">Booking ID:</span>
          <span className="value">{booking.booking_id.substring(0, 8)}</span>
        </div>
        <div className="info-item">
          <span className="label">Room:</span>
          <span className="value">{booking.room_no}</span>
        </div>
        <div className="info-item">
          <span className="label">Status:</span>
          <span className={`status ${booking.booking_status}`}>
            {booking.booking_status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <div className="info-item">
          <span className="label">Check-in:</span>
          <span className="value">{new Date(booking.checking_datetime).toLocaleString()}</span>
        </div>
        <div className="info-item">
          <span className="label">Check-out:</span>
          <span className="value">{new Date(booking.checkout_datetime).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  const renderCheckInSection = () => (
    <div className="action-section check-in">
      <h4>Check-In</h4>
      <p>Guest is ready to check in. Click the button below to proceed.</p>
      <button 
        onClick={handleCheckIn}
        className="btn-action btn-checkin"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Check In Guest'}
      </button>
    </div>
  );

  const renderCheckOutSection = () => {
    if (!validation) {
      return <div className="loading">Loading checkout validation...</div>;
    }

    const { validations, paymentDetails } = validation;

    return (
      <div className="action-section check-out">
        <h4>Check-Out Validation</h4>
        
        {/* Validation Status */}
        <div className="validation-checks">
          <div className={`check-item ${validations.isCheckedIn ? 'pass' : 'fail'}`}>
            <span className="icon">{validations.isCheckedIn ? '✓' : '✗'}</span>
            <span>Guest is checked in</span>
          </div>
          <div className={`check-item ${validations.paymentRecordExists ? 'pass' : 'fail'}`}>
            <span className="icon">{validations.paymentRecordExists ? '✓' : '✗'}</span>
            <span>Bill generated</span>
          </div>
          <div className={`check-item ${validations.paymentComplete ? 'pass' : 'fail'}`}>
            <span className="icon">{validations.paymentComplete ? '✓' : '✗'}</span>
            <span>Payment complete</span>
          </div>
        </div>

        {/* Payment Summary */}
        {paymentDetails && paymentDetails.status && (
          <div className="payment-summary-compact">
            <div className="summary-row">
              <span>Total Bill:</span>
              <span className="amount">${paymentDetails.totalCharges?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="summary-row">
              <span>Amount Paid:</span>
              <span className="amount paid">${paymentDetails.amountPaid?.toFixed(2) || '0.00'}</span>
            </div>
            <div className={`summary-row ${paymentDetails.dueAmount > 0 ? 'outstanding' : 'complete'}`}>
              <strong>Due Amount:</strong>
              <strong className="amount">${paymentDetails.dueAmount?.toFixed(2) || '0.00'}</strong>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            onClick={() => setShowBill(!showBill)}
            className="btn-secondary"
          >
            {showBill ? 'Hide Bill' : 'View Bill'}
          </button>
          <button 
            onClick={() => setShowPayment(!showPayment)}
            className="btn-secondary"
          >
            {showPayment ? 'Hide Payment' : 'Manage Payment'}
          </button>
          <button 
            onClick={handleCheckOut}
            className="btn-action btn-checkout"
            disabled={!validations.canCheckout || loading}
          >
            {loading ? 'Processing...' : 'Check Out Guest'}
          </button>
        </div>

        {/* Warning Messages */}
        {!validations.paymentRecordExists && (
          <div className="warning">
            ⚠️ Please generate the bill before checkout.
          </div>
        )}
        {validations.paymentRecordExists && !validations.paymentComplete && (
          <div className="error">
            ❌ Outstanding balance: ${paymentDetails.dueAmount?.toFixed(2)}
            <br />
            Payment must be completed before checkout.
          </div>
        )}
        {validations.canCheckout && (
          <div className="success">
            ✓ All requirements met. Ready for checkout.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="booking-management">
      {renderBookingInfo()}

      {booking.booking_status === 'confirmed' && renderCheckInSection()}
      {booking.booking_status === 'checked_in' && renderCheckOutSection()}

      {/* Bill Details Modal */}
      {showBill && (
        <div className="modal-overlay" onClick={() => setShowBill(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowBill(false)}>×</button>
            <BillDetails 
              bookingId={booking.booking_id}
              onBillGenerated={() => validateCheckout()}
            />
          </div>
        </div>
      )}

      {/* Payment Manager Modal */}
      {showPayment && (
        <div className="modal-overlay" onClick={() => setShowPayment(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPayment(false)}>×</button>
            <PaymentManager 
              bookingId={booking.booking_id}
              onPaymentComplete={() => validateCheckout()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
