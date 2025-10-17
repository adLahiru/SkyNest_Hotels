import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, CreditCard, FileText } from 'lucide-react';
import axios from 'axios';

const ManagerFinancial = ({ branchId, stats }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('month');

  useEffect(() => {
    fetchPayments();
  }, [branchId, dateFilter]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch payments for this branch
      const response = await axios.get(`http://localhost:8084/api/payments?branch_id=${branchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPayments(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate financial metrics
  const calculateMetrics = () => {
    const now = new Date();
    const thisMonth = payments.filter(p => {
      const paymentDate = new Date(p.payment_date);
      return paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear();
    });

    const lastMonth = payments.filter(p => {
      const paymentDate = new Date(p.payment_date);
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
      return paymentDate.getMonth() === lastMonthDate.getMonth() && 
             paymentDate.getFullYear() === lastMonthDate.getFullYear();
    });

    const thisMonthTotal = thisMonth.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const lastMonthTotal = lastMonth.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const growth = lastMonthTotal > 0 
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1)
      : 0;

    return {
      thisMonthTotal,
      lastMonthTotal,
      growth,
      totalPayments: payments.length,
      thisMonthPayments: thisMonth.length
    };
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Overview</h2>
          <p className="text-gray-600 mt-1">Track revenue and payments for your branch</p>
        </div>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">This Month</p>
              <p className="text-3xl font-bold text-gray-900">
                ${metrics.thisMonthTotal.toLocaleString()}
              </p>
              <div className="flex items-center mt-1">
                {metrics.growth >= 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">+{metrics.growth}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-xs text-red-500">{metrics.growth}%</span>
                  </>
                )}
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Last Month</p>
              <p className="text-3xl font-bold text-gray-900">
                ${metrics.lastMonthTotal.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Previous period</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Transactions</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.thisMonthPayments}</p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <CreditCard className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Avg Transaction</p>
              <p className="text-3xl font-bold text-gray-900">
                ${metrics.thisMonthPayments > 0 
                  ? (metrics.thisMonthTotal / metrics.thisMonthPayments).toFixed(0)
                  : 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Per booking</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FileText className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Booking ID</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Amount</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Method</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.slice(0, 10).map((payment) => (
                <tr key={payment.payment_id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-6">
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-6 font-mono text-sm">{payment.booking_id}</td>
                  <td className="py-3 px-6 font-semibold text-green-600">
                    ${parseFloat(payment.amount).toLocaleString()}
                  </td>
                  <td className="py-3 px-6">
                    <span className="capitalize">{payment.payment_method}</span>
                  </td>
                  <td className="py-3 px-6">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      payment.payment_status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : payment.payment_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No transactions found
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
          <h4 className="text-gray-700 font-medium mb-2">Occupancy Rate</h4>
          <p className="text-3xl font-bold text-green-700">
            {stats?.rooms?.total > 0 
              ? Math.round((stats?.rooms?.occupied / stats?.rooms?.total) * 100) 
              : 0}%
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {stats?.rooms?.occupied || 0} of {stats?.rooms?.total || 0} rooms
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
          <h4 className="text-gray-700 font-medium mb-2">Revenue Per Room</h4>
          <p className="text-3xl font-bold text-blue-700">
            ${stats?.rooms?.total > 0
              ? (metrics.thisMonthTotal / stats.rooms.total).toFixed(0)
              : 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Average this month</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
          <h4 className="text-gray-700 font-medium mb-2">Payment Success Rate</h4>
          <p className="text-3xl font-bold text-purple-700">
            {payments.length > 0
              ? Math.round((payments.filter(p => p.payment_status === 'completed').length / payments.length) * 100)
              : 0}%
          </p>
          <p className="text-sm text-gray-600 mt-1">Successful transactions</p>
        </div>
      </div>
    </div>
  );
};

export default ManagerFinancial;
