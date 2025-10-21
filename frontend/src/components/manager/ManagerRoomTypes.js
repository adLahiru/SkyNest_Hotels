import React, { useState, useEffect } from 'react';
import { Home, Users, DollarSign, Info } from 'lucide-react';
import axios from 'axios';
import logger from '../../utils/logger';

const ManagerRoomTypes = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8084/api/room-types', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setRoomTypes(response.data.data);
      }
    } catch (error) {
      logger.error('Error fetching room types:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex space-x-4">
          <div className="w-12 h-12 bg-blue-400 rounded-full"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-blue-400 rounded w-3/4"></div>
            <div className="h-4 bg-blue-400 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Room Types</h2>
          <p className="text-gray-600 mt-1">View available room types (Read-only)</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-lg">
          <Home className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roomTypes.map((roomType) => (
          <div key={roomType.room_type_id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Room Type Image */}
            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              {roomType.photo ? (
                <img 
                  src={`data:image/jpeg;base64,${roomType.photo}`} 
                  alt={roomType.type}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Home className="w-20 h-20 text-white opacity-50" />
              )}
            </div>

            {/* Room Type Details */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{roomType.type}</h3>
              
              {roomType.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{roomType.description}</p>
              )}

              <div className="space-y-3">
                {/* Capacity */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-sm">Capacity</span>
                  </div>
                  <span className="font-semibold text-gray-900">{roomType.capacity} guests</span>
                </div>

                {/* Daily Rate */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span className="text-sm">Daily Rate</span>
                  </div>
                  <span className="font-semibold text-green-600">${roomType.daily_rate}</span>
                </div>

                {/* Amenities */}
                {roomType.amenities && (
                  <div className="pt-3 border-t">
                    <div className="flex items-start">
                      <Info className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Amenities</p>
                        <p className="text-sm text-gray-700 line-clamp-3">{roomType.amenities}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {roomTypes.length === 0 && (
        <div className="text-center py-12">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No room types available</p>
        </div>
      )}
    </div>
  );
};

export default ManagerRoomTypes;
