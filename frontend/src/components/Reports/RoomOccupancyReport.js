import React, { useState } from 'react';
import { Calendar, Search, Download } from 'lucide-react';
import reportService from '../../services/reportService';
import logger from '../../utils/logger';

const RoomOccupancyReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  
  // Filter states
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.getRoomOccupancy(startDate, endDate);
      
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
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-4">
          <Calendar className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Room Occupancy Report</h2>
            <p className="text-gray-600">Track room utilization and occupancy rates</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              <Search className="w-5 h-5 mr-2" />
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Results */}
      {!loading && reportData && (
        <div>
          {/* Occupancy Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Occupancy Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportData.occupancyStats?.map((stat, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">{stat.branch_name}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Rooms:</span>
                      <span className="font-semibold">{stat.total_rooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Occupied:</span>
                      <span className="font-semibold text-blue-600">{stat.occupied_rooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate:</span>
                      <span className={`font-bold ${
                        stat.occupancy_rate >= 80 ? 'text-green-600' :
                        stat.occupancy_rate >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {stat.occupancy_rate}%
                      </span>
                    </div>
                  </div>
                  {/* Visual Progress Bar */}
                  <div className="mt-3 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        stat.occupancy_rate >= 80 ? 'bg-green-500' :
                        stat.occupancy_rate >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${stat.occupancy_rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Room Data */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Detailed Occupancy Data</h3>
              <button className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.occupancyData?.length > 0 ? (
                    reportData.occupancyData.map((room, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{room.branch_name}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{room.room_no}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{room.room_type}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            room.booking_id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {room.booking_id ? 'Occupied' : 'Available'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{room.guest_name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {room.checking_datetime ? new Date(room.checking_datetime).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {room.checkout_datetime ? new Date(room.checkout_datetime).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{room.days_occupied || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        No occupancy data found for the selected period
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
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Select dates and click "Generate Report" to view occupancy data</p>
        </div>
      )}
    </div>
  );
};

export default RoomOccupancyReport;
