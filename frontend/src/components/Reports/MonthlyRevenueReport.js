import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, ArrowUp, ArrowDown, Download } from 'lucide-react';
import reportService from '../../services/reportService';
import logger from '../../utils/logger';

const MonthlyRevenueReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.getMonthlyRevenue(selectedYear, selectedMonth);
      
      if (result.success) {
        setReportData(result.data);
      } else {
        setError(result.message || 'Failed to fetch report');
      }
    } catch (err) {
      setError('An error occurred while fetching the report');
      logger.error('Error in report', err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

  const totalRevenue = reportData?.revenueData?.reduce((sum, branch) => sum + (Number(branch.total_revenue) || 0), 0) || 0;
  const totalRoomRevenue = reportData?.revenueData?.reduce((sum, branch) => sum + (Number(branch.room_revenue) || 0), 0) || 0;
  const totalServiceRevenue = reportData?.revenueData?.reduce((sum, branch) => sum + (Number(branch.service_revenue) || 0), 0) || 0;

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-8 h-8 text-indigo-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Monthly Revenue Per Branch</h2>
            <p className="text-gray-600">Compare branch performance and growth</p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex flex-wrap gap-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Generate Report'}
            </button>
          </div>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Results */}
      {!loading && reportData && (
        <div>
          {/* Overall Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-md p-6 text-white">
              <p className="text-sm opacity-90 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
              <p className="text-xs opacity-75 mt-2">
                {months[selectedMonth - 1]} {selectedYear}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
              <p className="text-sm opacity-90 mb-1">Room Revenue</p>
              <p className="text-3xl font-bold">${totalRoomRevenue.toFixed(2)}</p>
              <p className="text-xs opacity-75 mt-2">
                {((totalRoomRevenue / totalRevenue) * 100 || 0).toFixed(1)}% of total
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
              <p className="text-sm opacity-90 mb-1">Service Revenue</p>
              <p className="text-3xl font-bold">${totalServiceRevenue.toFixed(2)}</p>
              <p className="text-xs opacity-75 mt-2">
                {((totalServiceRevenue / totalRevenue) * 100 || 0).toFixed(1)}% of total
              </p>
            </div>
          </div>

          {/* Branch Revenue Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenue by Branch</h3>
              <button className="flex items-center px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Booking</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.revenueData?.length > 0 ? (
                    reportData.revenueData.map((branch, index) => {
                      const growth = Number(branch.revenue_growth_percent);
                      const isPositive = growth >= 0;
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{branch.branch_name}</div>
                              <div className="text-xs text-gray-500">{branch.address}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">
                            {branch.total_bookings || 0}
                          </td>
                          <td className="px-4 py-3 text-sm text-green-600 font-semibold">
                            ${Number(branch.room_revenue || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-purple-600 font-semibold">
                            ${Number(branch.service_revenue || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-indigo-600">
                            ${Number(branch.total_revenue || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            ${Number(branch.avg_booking_value || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            {branch.revenue_growth_percent !== null ? (
                              <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {isPositive ? (
                                  <ArrowUp className="w-4 h-4 mr-1" />
                                ) : (
                                  <ArrowDown className="w-4 h-4 mr-1" />
                                )}
                                <span className="text-sm font-semibold">
                                  {Math.abs(growth).toFixed(1)}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">N/A</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        No revenue data found for the selected period
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
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Select a period and click "Generate Report"</p>
        </div>
      )}
    </div>
  );
};

export default MonthlyRevenueReport;
