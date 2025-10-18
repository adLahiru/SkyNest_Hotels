import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, DollarSign } from 'lucide-react';
import axios from 'axios';

const ManagerStaff = ({ branchId }) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchStaff();
  }, [branchId]);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8084/api/users?branch_id=${branchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Filter only staff (not guests)
        const staffMembers = response.data.data.filter(user => !user.is_guest);
        setStaff(staffMembers);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'MANAGER': return 'bg-blue-100 text-blue-800';
      case 'RECEPTIONIST': return 'bg-green-100 text-green-800';
      case 'HOUSEKEEPING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredStaff = filter === 'all' 
    ? staff 
    : staff.filter(member => member.role === filter);

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
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-gray-600 mt-1">View and manage staff in your branch</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Staff</option>
            <option value="MANAGER">Managers</option>
            <option value="RECEPTIONIST">Receptionists</option>
            <option value="HOUSEKEEPING">Housekeeping</option>
          </select>
        </div>
      </div>

      {/* Staff Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Total Staff</p>
          <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Managers</p>
          <p className="text-2xl font-bold text-blue-600">
            {staff.filter(s => s.role === 'MANAGER').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Receptionists</p>
          <p className="text-2xl font-bold text-green-600">
            {staff.filter(s => s.role === 'RECEPTIONIST').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Housekeeping</p>
          <p className="text-2xl font-bold text-yellow-600">
            {staff.filter(s => s.role === 'HOUSEKEEPING').length}
          </p>
        </div>
      </div>

      {/* Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((member) => (
          <div key={member.user_id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <h3 className="font-bold text-gray-900">{member.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(member.role)}`}>
                    {member.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-gray-600 text-sm">
                <Mail className="w-4 h-4 mr-2" />
                <span className="truncate">{member.email}</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <Phone className="w-4 h-4 mr-2" />
                <span>{member.phone}</span>
              </div>
              {member.hire_date && (
                <div className="flex items-center text-gray-600 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Hired: {new Date(member.hire_date).toLocaleDateString()}</span>
                </div>
              )}
              {member.salary && (
                <div className="flex items-center text-gray-600 text-sm">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>${member.salary.toLocaleString()}/month</span>
                </div>
              )}
            </div>

            {member.retired_date && (
              <div className="mt-4 pt-4 border-t">
                <span className="text-xs text-red-600">
                  Retired: {new Date(member.retired_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No staff members found</p>
        </div>
      )}
    </div>
  );
};

export default ManagerStaff;
