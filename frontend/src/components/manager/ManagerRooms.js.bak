import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import axios from 'axios';

const ManagerRooms = ({ branchId }) => {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    room_no: '',
    floor_no: '',
    room_type_id: '',
    state: 'available'
  });

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8084/api/rooms/branch/${branchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setRooms(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8084/api/room-types', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setRoomTypes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching room types:', error);
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8084/api/rooms', {
        ...formData,
        branch_id: branchId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Room added successfully!');
        setShowAddModal(false);
        setFormData({ room_no: '', floor_no: '', room_type_id: '', state: 'available' });
        fetchRooms();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding room');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:8084/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Room deleted successfully!');
        fetchRooms();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting room');
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Rooms Management</h2>
          <p className="text-gray-600 mt-1">Manage rooms in your branch</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Room
        </button>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-6 font-medium text-gray-700">Room No</th>
              <th className="text-left py-3 px-6 font-medium text-gray-700">Floor</th>
              <th className="text-left py-3 px-6 font-medium text-gray-700">Type</th>
              <th className="text-left py-3 px-6 font-medium text-gray-700">State</th>
              <th className="text-left py-3 px-6 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.room_id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-6 font-medium">{room.room_no}</td>
                <td className="py-3 px-6">{room.floor_no}</td>
                <td className="py-3 px-6">{room.room_type}</td>
                <td className="py-3 px-6">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    room.state === 'available' ? 'bg-green-100 text-green-800' :
                    room.state === 'occupied' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {room.state}
                  </span>
                </td>
                <td className="py-3 px-6">
                  <button
                    onClick={() => handleDeleteRoom(room.room_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rooms.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No rooms found. Add your first room!
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Add New Room</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Number
                </label>
                <input
                  type="text"
                  value={formData.room_no}
                  onChange={(e) => setFormData({...formData, room_no: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor Number
                </label>
                <input
                  type="number"
                  value={formData.floor_no}
                  onChange={(e) => setFormData({...formData, floor_no: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type
                </label>
                <select
                  value={formData.room_type_id}
                  onChange={(e) => setFormData({...formData, room_type_id: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select a room type</option>
                  {roomTypes.map((type) => (
                    <option key={type.room_type_id} value={type.room_type_id}>
                      {type.type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
              >
                Add Room
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerRooms;
