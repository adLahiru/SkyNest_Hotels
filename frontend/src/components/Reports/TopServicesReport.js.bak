import React, { useState, useEffect, useCallback } from 'react';
import { Award, TrendingUp, Users, DollarSign, Download } from 'lucide-react';
import reportService from '../../services/reportService';

const TopServicesReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(10);
  const [activeTab, setActiveTab] = useState('usage'); // 'usage', 'revenue', 'preferences'

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.getTopServices(null, null, limit);
      
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
  }, [limit]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const getServiceTypeColor = (type) => {
    const colors = {
      'FOOD': 'bg-orange-500',
      'LAUNDRY': 'bg-blue-500',
      'SPA': 'bg-purple-500',
      'TRANSPORT': 'bg-green-500',
      'OTHER': 'bg-gray-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank === 2) return 'bg-gray-400 text-white';
    if (rank === 3) return 'bg-orange-600 text-white';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Award className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Top-Used Services & Trends</h2>
              <p className="text-gray-600">Identify popular services and customer preferences</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Top Services Limit
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={15}>Top 15</option>
              <option value={20}>Top 20</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="flex items-center px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Refresh Report'}
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
        </div>
      )}

      {/* Results */}
      {!loading && reportData && (
        <div>
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('usage')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'usage'
                      ? 'border-yellow-600 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Top by Usage
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('revenue')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'revenue'
                      ? 'border-yellow-600 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Top by Revenue
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'preferences'
                      ? 'border-yellow-600 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Service Preferences
                  </div>
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Top by Usage Tab */}
              {activeTab === 'usage' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Most Used Services</h3>
                    <button className="flex items-center px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </button>
                  </div>
                  <div className="space-y-3">
                    {reportData.topServicesByUsage?.map((service, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mr-4 ${getRankColor(index + 1)}`}>
                              #{index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900">{service.service_name}</h4>
                                <span className={`px-2 py-0.5 text-xs text-white rounded-full ${getServiceTypeColor(service.service_type)}`}>
                                  {service.service_type}
                                </span>
                              </div>
                              <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Usage:</span>
                                  <span className="ml-1 font-semibold text-blue-600">{service.usage_count}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Quantity:</span>
                                  <span className="ml-1 font-semibold">{service.total_quantity}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Customers:</span>
                                  <span className="ml-1 font-semibold text-purple-600">{service.unique_customers}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Revenue:</span>
                                  <span className="ml-1 font-semibold text-green-600">
                                    ${Number(service.total_revenue || 0).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top by Revenue Tab */}
              {activeTab === 'revenue' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Highest Revenue Services</h3>
                    <button className="flex items-center px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </button>
                  </div>
                  <div className="space-y-3">
                    {reportData.topServicesByRevenue?.map((service, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mr-4 ${getRankColor(index + 1)}`}>
                              #{index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900">{service.service_name}</h4>
                                <span className={`px-2 py-0.5 text-xs text-white rounded-full ${getServiceTypeColor(service.service_type)}`}>
                                  {service.service_type}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Revenue:</span>
                                  <span className="ml-1 font-bold text-green-600 text-lg">
                                    ${Number(service.total_revenue || 0).toFixed(2)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Usage Count:</span>
                                  <span className="ml-1 font-semibold">{service.usage_count}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Unit Charge:</span>
                                  <span className="ml-1 font-semibold">${Number(service.charge || 0).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Service Type Preferences</h3>
                  <div className="space-y-4">
                    {reportData.serviceTypePreferences?.map((pref, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className={`px-3 py-1 text-sm font-semibold text-white rounded-full ${getServiceTypeColor(pref.service_type)}`}>
                              {pref.service_type}
                            </span>
                            <span className="ml-3 text-sm text-gray-600">
                              {pref.usage_percentage}% of total usage
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-200 rounded-full h-3 mb-3">
                          <div
                            className={`h-3 rounded-full ${getServiceTypeColor(pref.service_type)}`}
                            style={{ width: `${pref.usage_percentage}%` }}
                          />
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Bookings:</span>
                            <span className="ml-1 font-semibold">{pref.booking_count}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Customers:</span>
                            <span className="ml-1 font-semibold">{pref.customer_count}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Quantity:</span>
                            <span className="ml-1 font-semibold">{pref.total_quantity}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Revenue:</span>
                            <span className="ml-1 font-semibold text-green-600">
                              ${Number(pref.total_revenue || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !reportData && !error && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Loading top services data...</p>
        </div>
      )}
    </div>
  );
};

export default TopServicesReport;
