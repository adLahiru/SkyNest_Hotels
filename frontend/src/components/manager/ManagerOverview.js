import React from 'react';
import { Building2, Home, Users, Calendar, DollarSign, UserCheck, UserX, DoorOpen } from 'lucide-react';

const ManagerOverview = ({ stats, user }) => {
  return (
    <div className="space-y-6">
      {/* Branch Info Card */}
      {stats?.branch && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{stats.branch.branch_name}</h2>
              <p className="text-blue-100 mb-4">{stats.branch.address}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-blue-100 text-sm">Contact</p>
                  <p className="font-medium">{stats.branch.phone}</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Current Occupancy */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Occupancy</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.rooms?.occupied || 0}/{stats?.rooms?.total || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.rooms?.total > 0 
                  ? Math.round((stats?.rooms?.occupied / stats?.rooms?.total) * 100) 
                  : 0}% Full
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DoorOpen className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Monthly Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                ${stats?.revenue?.thisMonth?.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-green-500 mt-1">+12% from last month</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Check-ins */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Check-ins</h3>
            <div className="bg-green-100 p-2 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="space-y-3">
            {stats?.todayCheckIns?.length > 0 ? (
              stats.todayCheckIns.slice(0, 5).map((checkIn, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{checkIn.guest_name}</p>
                    <p className="text-sm text-gray-500">Room {checkIn.room_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(checkIn.check_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    <p className="text-xs text-gray-500">{checkIn.room_type}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No check-ins scheduled for today</p>
            )}
          </div>
        </div>

        {/* Today's Check-outs */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Check-outs</h3>
            <div className="bg-red-100 p-2 rounded-lg">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="space-y-3">
            {stats?.todayCheckOuts?.length > 0 ? (
              stats.todayCheckOuts.slice(0, 5).map((checkOut, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{checkOut.guest_name}</p>
                    <p className="text-sm text-gray-500">Room {checkOut.room_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(checkOut.check_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    <p className="text-xs text-gray-500">{checkOut.room_type}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No check-outs scheduled for today</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
          <div className="bg-blue-100 p-2 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Guest</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Room</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Check-in</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Check-out</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentBookings?.length > 0 ? (
                stats.recentBookings.slice(0, 5).map((booking, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{booking.guest_name}</td>
                    <td className="py-3 px-4">Room {booking.room_number}</td>
                    <td className="py-3 px-4">
                      {new Date(booking.check_in).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(booking.check_out).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-gray-500">
                    No recent bookings
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerOverview;
