import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Clock, Home, Users, DoorOpen, CheckCircle, XCircle } from 'lucide-react';
import dashboardService from '../services/dashboardService';

const ReceptionistDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    const result = await dashboardService.getReceptionistStats();
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Receptionist Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}! Here's today's operations.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Today's Check-ins */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Today's Check-ins</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.quickStats?.todayCheckIns || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Scheduled</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Today's Check-outs */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Today's Check-outs</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.quickStats?.todayCheckOuts || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Scheduled</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <UserX className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Available Rooms */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Available Rooms</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.quickStats?.availableRooms || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Ready for booking</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Home className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Occupied Rooms */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Occupied Rooms</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.quickStats?.occupiedRooms || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Current guests</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <DoorOpen className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Today's Check-ins Table */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserCheck className="w-5 h-5 mr-2 text-green-600" />
            Today's Check-ins
          </h3>
          {stats?.todayCheckIns && stats.todayCheckIns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.todayCheckIns.map((booking) => (
                    <tr key={booking.booking_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{booking.guest_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{booking.room_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{booking.room_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(booking.check_in).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          booking.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {booking.status === 'CONFIRMED' && (
                          <button className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Check In
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <UserCheck className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No check-ins scheduled for today</p>
            </div>
          )}
        </div>

        {/* Today's Check-outs Table */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserX className="w-5 h-5 mr-2 text-orange-600" />
            Today's Check-outs
          </h3>
          {stats?.todayCheckOuts && stats.todayCheckOuts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.todayCheckOuts.map((booking) => (
                    <tr key={booking.booking_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{booking.guest_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{booking.room_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{booking.room_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(booking.check_out).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          booking.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'CHECKED_OUT' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {booking.status === 'CHECKED_IN' && (
                          <button className="flex items-center px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Check Out
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <UserX className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No check-outs scheduled for today</p>
            </div>
          )}
        </div>

        {/* Pending Bookings and Available Rooms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Bookings */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-yellow-600" />
              Pending Bookings
            </h3>
            {stats?.pendingBookings && stats.pendingBookings.length > 0 ? (
              <div className="space-y-3">
                {stats.pendingBookings.slice(0, 5).map((booking) => (
                  <div key={booking.booking_id} className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{booking.guest_name}</p>
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button className="flex items-center px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Confirm
                      </button>
                      <button className="flex items-center px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                        <XCircle className="w-3 h-3 mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No pending bookings</p>
              </div>
            )}
          </div>

          {/* Available Rooms */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Home className="w-5 h-5 mr-2 text-blue-600" />
              Available Rooms
            </h3>
            {stats?.availableRooms && stats.availableRooms.length > 0 ? (
              <div className="space-y-3">
                {stats.availableRooms.slice(0, 5).map((room) => (
                  <div key={room.room_id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Room {room.room_number}</p>
                        <p className="text-sm text-gray-600">{room.room_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-600">${Number(room.price).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">per night</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Home className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No rooms available</p>
              </div>
            )}
          </div>
        </div>

        {/* Current Guests */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            Current Guests
          </h3>
          {stats?.currentGuests && stats.currentGuests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.currentGuests.map((guest) => (
                    <tr key={guest.booking_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{guest.guest_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{guest.room_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{guest.room_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(guest.check_in).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(guest.check_out).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No current guests</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
