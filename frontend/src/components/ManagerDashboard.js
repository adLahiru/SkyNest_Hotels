import React, { useState, useEffect } from 'react';
import { Building2, Users, DoorOpen, Calendar, DollarSign, Home, UserCheck, UserX } from 'lucide-react';
import dashboardService from '../services/dashboardService';

const ManagerDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    const result = await dashboardService.getManagerStats();
    if (result.success) {
      setStats(result.data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse flex space-x-4">
              <div className="w-12 h-12 bg-blue-400 rounded-full"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-blue-400 rounded w-3/4"></div>
                <div className="h-4 bg-blue-400 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Manager Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}! Managing {stats?.branch?.name || 'your branch'}</p>
        </div>

        {/* Branch Info Card */}
        {stats?.branch && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 mb-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{stats.branch.name}</h2>
                <p className="text-blue-100 mb-4">{stats.branch.location}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-100 text-sm">Contact</p>
                    <p className="font-medium">{stats.branch.contact_number}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Email</p>
                    <p className="font-medium">{stats.branch.email}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Building2 className="w-10 h-10" />
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Rooms */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Rooms</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.rooms?.total || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.rooms?.available || 0} Available
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Home className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Staff Count */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Staff Members</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.staffCount || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Active Staff</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.bookings?.total || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.bookings?.active || 0} Active
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Branch Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${Number(stats?.revenue || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">All Time</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <DollarSign className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Room Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Status Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">{stats?.rooms?.available || 0}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-red-600">{stats?.rooms?.occupied || 0}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-yellow-600">{stats?.rooms?.maintenance || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.rooms?.total || 0}</p>
            </div>
          </div>
        </div>

        {/* Today's Operations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Today's Check-ins */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Check-ins</h3>
              <div className="bg-green-100 p-2 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
            </div>
            {stats?.todayCheckIns && stats.todayCheckIns.length > 0 ? (
              <div className="space-y-3">
                {stats.todayCheckIns.map((booking) => (
                  <div key={booking.booking_id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                    <div>
                      <p className="font-medium text-gray-900">{booking.guest_name}</p>
                      <p className="text-sm text-gray-600">Room {booking.room_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">{booking.status}</p>
                      <p className="text-xs text-gray-500">{new Date(booking.check_in).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <UserCheck className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No check-ins scheduled for today</p>
              </div>
            )}
          </div>

          {/* Today's Check-outs */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Today's Check-outs</h3>
              <div className="bg-orange-100 p-2 rounded-lg">
                <UserX className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            {stats?.todayCheckOuts && stats.todayCheckOuts.length > 0 ? (
              <div className="space-y-3">
                {stats.todayCheckOuts.map((booking) => (
                  <div key={booking.booking_id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <div>
                      <p className="font-medium text-gray-900">{booking.guest_name}</p>
                      <p className="text-sm text-gray-600">Room {booking.room_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">{booking.status}</p>
                      <p className="text-xs text-gray-500">{new Date(booking.check_out).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <UserX className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No check-outs scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Branch Bookings</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats?.recentBookings?.map((booking) => (
                  <tr key={booking.booking_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{booking.guest_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{booking.room_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(booking.check_in).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(booking.check_out).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      ${Number(booking.total_amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
