import React, { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, CheckCircle, XCircle, Download } from 'lucide-react';
import reportService from '../../services/reportService';

const GuestBillingReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.getGuestBilling();
      
      if (result.success) {
        setReportData(result.data);
      } else {
        setError(result.message || 'Failed to fetch report');
      }
    } catch (err) {
      setError('An error occurred while fetching the report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = reportData?.billingData?.filter(record => {
    if (filterStatus === 'ALL') return true;
    return record.payment_status === filterStatus;
  }) || [];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'FULLY_PAID':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'PARTIALLY_PAID':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'UNPAID':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'FULLY_PAID':
        return 'bg-green-100 text-green-800';
      case 'PARTIALLY_PAID':
        return 'bg-yellow-100 text-yellow-800';
      case 'UNPAID':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Guest Billing Summary</h2>
              <p className="text-gray-600">Track payments and outstanding balances</p>
            </div>
          </div>
          <button
            onClick={fetchReport}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      )}

      {/* Results */}
      {!loading && reportData && (
        <div>
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary?.total_bookings || 0}</p>
                </div>
                <DollarSign className="w-10 h-10 text-blue-500 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${Number(reportData.summary?.total_paid || 0).toFixed(2)}
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Unpaid</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${Number(reportData.summary?.total_unpaid || 0).toFixed(2)}
                  </p>
                </div>
                <XCircle className="w-10 h-10 text-red-500 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Partially Paid</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {reportData.summary?.partially_paid_count || 0}
                  </p>
                </div>
                <AlertCircle className="w-10 h-10 text-yellow-500 opacity-50" />
              </div>
            </div>
          </div>

          {/* Status Filter and Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Billing Details</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Filter:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ALL">All Status</option>
                    <option value="UNPAID">Unpaid</option>
                    <option value="PARTIALLY_PAID">Partially Paid</option>
                    <option value="FULLY_PAID">Fully Paid</option>
                  </select>
                </div>
                <button className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unpaid</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.length > 0 ? (
                    filteredData.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{record.guest_name}</div>
                            <div className="text-xs text-gray-500">{record.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{record.branch_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{record.room_no}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(record.checking_datetime).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          ${Number(record.total_amount || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-green-600">
                          ${Number(record.amount_paid || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-red-600">
                          ${Number(record.unpaid_balance || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(record.payment_status)}
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(record.payment_status)}`}>
                              {record.payment_status?.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        No billing records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !reportData && !error && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Loading billing data...</p>
        </div>
      )}
    </div>
  );
};

export default GuestBillingReport;
