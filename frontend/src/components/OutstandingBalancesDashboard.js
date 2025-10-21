import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PaymentManager from './PaymentManager';
import '../styles/OutstandingBalancesDashboard.css';
import logger from '../utils/logger';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const OutstandingBalancesDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [totalOutstanding, setTotalOutstanding] = useState(0);

  useEffect(() => {
    fetchOutstandingBalances();
  }, []);

  const fetchOutstandingBalances = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/payments/outstanding`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(response.data.bookings);
      setTotalOutstanding(parseFloat(response.data.totalOutstanding));
    } catch (error) {
      logger.error('Failed to fetch outstanding balances:', error);
      alert('Failed to load outstanding balances');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    setSelectedBooking(null);
    fetchOutstandingBalances();
  };

  if (loading) {
    return <div className="outstanding-dashboard loading">Loading...</div>;
  }

  return (
    <div className="outstanding-dashboard">
      <div className="dashboard-header">
        <h2>Outstanding Balances</h2>
        <p className="subtitle">Manage bookings with pending or partial payments</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <div className="card-icon">📋</div>
          <div className="card-content">
            <h3>{bookings.length}</h3>
            <p>Bookings with Outstanding Balance</p>
          </div>
        </div>
        <div className="card highlight">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>${totalOutstanding.toFixed(2)}</h3>
            <p>Total Outstanding Amount</p>
          </div>
        </div>
      </div>

      {/* Outstanding Bookings Table */}
      {bookings.length > 0 ? (
        <div className="bookings-table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Status</th>
                <th>Total Bill</th>
                <th>Paid</th>
                <th>Outstanding</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.booking_id}>
                  <td className="booking-id">{booking.booking_id.substring(0, 8)}</td>
                  <td>
                    <div className="guest-info">
                      <div className="guest-name">{booking.fname} {booking.lname}</div>
                      <div className="guest-email">{booking.email}</div>
                    </div>
                  </td>
                  <td>{booking.room_no}</td>
                  <td>
                    <span className={`badge ${booking.payment_status}`}>
                      {booking.payment_status.toUpperCase()}
                    </span>
                  </td>
                  <td className="amount">${booking.total_charges.toFixed(2)}</td>
                  <td className="amount paid">${booking.amount_paid.toFixed(2)}</td>
                  <td className="amount outstanding">${booking.due_amount.toFixed(2)}</td>
                  <td>
                    <button 
                      onClick={() => setSelectedBooking(booking)}
                      className="btn-manage"
                    >
                      Manage Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-outstanding">
          <div className="icon">✓</div>
          <h3>No Outstanding Balances!</h3>
          <p>All bookings are fully paid or no active bookings with payments due.</p>
        </div>
      )}

      {/* Payment Manager Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedBooking(null)}>×</button>
            <div className="modal-header">
              <h3>Payment for {selectedBooking.fname} {selectedBooking.lname}</h3>
              <p>Room {selectedBooking.room_no} • Booking ID: {selectedBooking.booking_id.substring(0, 8)}</p>
            </div>
            <PaymentManager 
              bookingId={selectedBooking.booking_id}
              onPaymentComplete={handlePaymentComplete}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OutstandingBalancesDashboard;
