import React, { useState, useEffect } from 'react';
import { FileText, Search, Download } from 'lucide-react';
import reportService from '../../services/reportService';

const ServiceUsageReport = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [serviceTypeFilter, setServiceTypeFilter] = useState('');

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filters = {};
      if (serviceTypeFilter) filters.serviceType = serviceTypeFilter;
      
      const result = await reportService.getServiceUsage(filters);
      
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

  const serviceTypes = ['FOOD', 'LAUNDRY', 'SPA', 'TRANSPORT', 'OTHER'];

  const getServiceTypeColor = (type) => {
    const colors = {
      'FOOD': 'bg-orange-100 text-orange-800',
      'LAUNDRY': 'bg-blue-100 text-blue-800',
      'SPA': 'bg-purple-100 text-purple-800',
      'TRANSPORT': 'bg-green-100 text-green-800',
      'OTHER': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Service Usage Breakdown</h2>
              <p className="text-gray-600">Analyze service consumption patterns</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Type
            </label>
            <select
              value={serviceTypeFilter}
              onChange={(e) => setServiceTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Services</option>
              {serviceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
            >
              <Search className="w-5 h-5 mr-2" />
              {loading ? 'Loading...' : 'Apply Filters'}
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Results */}
      {!loading && reportData && (
        <div>
          {/* Usage Statistics by Type */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics by Service Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportData.usageStats?.map((stat, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getServiceTypeColor(stat.service_type)}`}>
                      {stat.service_type}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Usage Count:</span>
                      <span className="font-semibold text-gray-900">{stat.usage_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Quantity:</span>
                      <span className="font-semibold text-gray-900">{stat.total_quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-semibold text-green-600">
                        ${Number(stat.total_revenue || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {/* Revenue Bar */}
                  <div className="mt-3 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min((stat.total_revenue / Math.max(...(reportData.usageStats?.map(s => s.total_revenue) || [1]))) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {(!reportData.usageStats || reportData.usageStats.length === 0) && (
              <p className="text-center text-gray-500 py-4">No usage statistics available</p>
            )}
          </div>

          {/* Detailed Usage Data */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Detailed Service Usage</h3>
              <button className="flex items-center px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Charge</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.serviceUsageData?.length > 0 ? (
                    reportData.serviceUsageData.map((service, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{service.service_name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getServiceTypeColor(service.service_type)}`}>
                            {service.service_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{service.branch_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{service.room_no}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{service.guest_name}</td>
                        <td className="px-4 py-3 text-sm text-center font-semibold">{service.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          ${Number(service.service_charge || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600">
                          ${Number(service.total_charge || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(service.usage_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                        No service usage data found
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
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Loading service usage data...</p>
        </div>
      )}
    </div>
  );
};

export default ServiceUsageReport;
