import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/BillDetails.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const BillDetails = ({ bookingId, onBillGenerated }) => {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchBill = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/payments/bill/${bookingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBill(response.data);
    } catch (error) {
      console.error('Failed to fetch bill:', error);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBill();
  }, [fetchBill]);

  const handleGenerateBill = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/payments/generate-bill`,
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Bill generated successfully!');
      await fetchBill();
      
      if (onBillGenerated) {
        onBillGenerated(response.data);
      }
    } catch (error) {
      console.error('Bill generation error:', error);
      alert('Failed to generate bill');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="bill-details loading">Loading bill...</div>;
  }

  if (!bill) {
    return <div className="bill-details error">Unable to load bill</div>;
  }

  const { guestInfo, roomDetails, roomCharges, services, serviceCharges, payment } = bill;

  return (
    <div className="bill-details">
      <div className="bill-header">
        <h2>Booking Bill</h2>
        <div className="booking-id">Booking ID: {bookingId.substring(0, 8)}</div>
      </div>

      {/* Guest Information */}
      <div className="bill-section guest-info">
        <h3>Guest Information</h3>
        <div className="info-row">
          <span className="label">Name:</span>
          <span className="value">{guestInfo.name}</span>
        </div>
        <div className="info-row">
          <span className="label">Email:</span>
          <span className="value">{guestInfo.email}</span>
        </div>
      </div>

      {/* Room Charges Section */}
      <div className="bill-section room-charges">
        <h3>Room Charges</h3>
        <div className="bill-item">
          <span>Room: {roomDetails.room_no} ({roomDetails.room_type})</span>
        </div>
        <div className="bill-item">
          <span>Check-in:</span>
          <span>{new Date(roomDetails.check_in).toLocaleString()}</span>
        </div>
        <div className="bill-item">
          <span>Check-out:</span>
          <span>{new Date(roomDetails.check_out).toLocaleString()}</span>
        </div>
        <div className="bill-item">
          <span>Number of Nights:</span>
          <span>{roomDetails.nights}</span>
        </div>
        <div className="bill-item subtotal">
          <span>Daily Rate × {roomDetails.nights} nights:</span>
          <span className="amount">${roomCharges.toFixed(2)}</span>
        </div>
      </div>

      {/* Service Charges Section */}
      <div className="bill-section service-charges">
        <h3>Service Charges</h3>
        {services && services.length > 0 ? (
          <>
            {services.map(service => (
              <div key={service.usage_id} className="bill-item">
                <div className="service-details">
                  <span className="service-name">{service.service_name}</span>
                  <small className="service-date">
                    {new Date(service.usage_date).toLocaleDateString()}
                  </small>
                </div>
                <div className="service-amount">
                  <span className="quantity">Qty: {service.quantity} × ${service.unit_price}</span>
                  <span className="amount">${service.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
            <div className="bill-item subtotal">
              <span>Total Service Charges:</span>
              <span className="amount">${serviceCharges.toFixed(2)}</span>
            </div>
          </>
        ) : (
          <div className="bill-item">
            <span>No services used</span>
            <span className="amount">$0.00</span>
          </div>
        )}
      </div>

      {/* Bill Summary */}
      {payment ? (
        <div className="bill-section bill-summary">
          <div className="bill-item">
            <span>Subtotal:</span>
            <span className="amount">${(roomCharges + serviceCharges).toFixed(2)}</span>
          </div>
          {payment.total_charges && (
            <>
              <div className="bill-item total">
                <strong>Total Charges:</strong>
                <strong className="amount">${payment.total_charges.toFixed(2)}</strong>
              </div>
              <div className="bill-item paid">
                <span>Amount Paid:</span>
                <span className="amount paid">${payment.amount_paid.toFixed(2)}</span>
              </div>
              <div className={`bill-item due ${payment.due_amount > 0 ? 'outstanding' : 'complete'}`}>
                <strong>Due Amount:</strong>
                <strong className="amount">${payment.due_amount.toFixed(2)}</strong>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="bill-section bill-summary">
          <div className="bill-item total">
            <strong>Estimated Total:</strong>
            <strong className="amount">${(roomCharges + serviceCharges).toFixed(2)}</strong>
          </div>
          <button 
            onClick={handleGenerateBill}
            className="btn-generate"
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate Official Bill'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BillDetails;
