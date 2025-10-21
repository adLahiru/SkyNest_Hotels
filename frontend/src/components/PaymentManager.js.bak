import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/PaymentManager.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PaymentManager = ({ bookingId, onPaymentComplete }) => {
  const [paymentHistory, setPaymentHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');

  const fetchPaymentHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/payments/history/${bookingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPaymentHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      alert('Failed to load payment details');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  const handlePayment = async (e) => {
    e.preventDefault();

    const paymentAmount = parseFloat(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (paymentHistory && paymentAmount > paymentHistory.summary.due_amount) {
      alert(`Amount exceeds remaining balance of $${paymentHistory.summary.due_amount.toFixed(2)}`);
      return;
    }

    setProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/payments/process`,
        {
          bookingId,
          amount: paymentAmount,
          paymentMethod,
          transactionReference: transactionRef || null,
          notes: notes || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Payment processed successfully!\nRemaining balance: $${response.data.remainingBalance.toFixed(2)}`);

      // Reset form
      setAmount('');
      setTransactionRef('');
      setNotes('');

      // Refresh payment history
      await fetchPaymentHistory();

      // Notify parent component
      if (onPaymentComplete) {
        onPaymentComplete(response.data);
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Payment processing failed';
      alert(`Payment failed: ${errorMessage}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="payment-manager loading">Loading payment details...</div>;
  }

  if (!paymentHistory) {
    return <div className="payment-manager error">Unable to load payment details</div>;
  }

  const { summary, transactions } = paymentHistory;
  const canPay = summary.payment_status !== 'paid' && summary.due_amount > 0;

  return (
    <div className="payment-manager">
      <h3>Payment Information</h3>

      {/* Payment Summary */}
      <div className="payment-summary">
        <div className="summary-item">
          <span>Total Bill:</span>
          <span className="amount">${summary.total_charges.toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span>Amount Paid:</span>
          <span className="amount paid">${summary.amount_paid.toFixed(2)}</span>
        </div>
        <div className={`summary-item ${summary.due_amount > 0 ? 'outstanding' : 'complete'}`}>
          <strong>Outstanding Balance:</strong>
          <strong className="amount">${summary.due_amount.toFixed(2)}</strong>
        </div>
        <div className="summary-item">
          <span>Status:</span>
          <span className={`status ${summary.payment_status}`}>
            {summary.payment_status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Payment Form */}
      {canPay && (
        <form onSubmit={handlePayment} className="payment-form">
          <h4>Make a Payment</h4>

          <div className="form-group">
            <label>Amount (Max: ${summary.due_amount.toFixed(2)})</label>
            <div className="amount-input-group">
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={summary.due_amount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
              <button
                type="button"
                onClick={() => setAmount(summary.due_amount.toString())}
                className="btn-secondary"
              >
                Pay Full Amount
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select 
              value={paymentMethod} 
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="mobile_payment">Mobile Payment</option>
            </select>
          </div>

          <div className="form-group">
            <label>Transaction Reference (Optional)</label>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g., Card last 4 digits, check number"
            />
          </div>

          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this payment"
              rows="3"
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Process Payment'}
          </button>
        </form>
      )}

      {/* Transaction History */}
      <div className="transaction-history">
        <h4>Payment History</h4>
        {transactions && transactions.length > 0 ? (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Processed By</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(txn => (
                <tr key={txn.transaction_id}>
                  <td>{new Date(txn.transaction_date).toLocaleString()}</td>
                  <td className="amount">${txn.amount.toFixed(2)}</td>
                  <td>{txn.payment_method}</td>
                  <td>{txn.transaction_reference || '-'}</td>
                  <td>{txn.processed_by_fname} {txn.processed_by_lname}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-transactions">No payments recorded yet</p>
        )}
      </div>
    </div>
  );
};

export default PaymentManager;
