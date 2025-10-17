import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Home as HomeIcon, 
  DoorOpen, 
  Users, 
  DollarSign 
} from 'lucide-react';
import dashboardService from '../services/dashboardService';

// Import tab components (will be created next)
import ManagerOverview from './manager/ManagerOverview';
import ManagerRoomTypes from './manager/ManagerRoomTypes';
import ManagerRooms from './manager/ManagerRooms';
import ManagerStaff from './manager/ManagerStaff';
import ManagerFinancial from './manager/ManagerFinancial';

const ManagerDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
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

  const tabs = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'roomtypes', name: 'Room Types', icon: HomeIcon },
    { id: 'rooms', name: 'Rooms', icon: DoorOpen },
    { id: 'staff', name: 'Staff', icon: Users },
    { id: 'financial', name: 'Financial', icon: DollarSign },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-28 px-8">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-28 px-8 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Manager Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}! Managing {stats?.branch?.branch_name || 'your branch'}</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-1 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && <ManagerOverview stats={stats} user={user} />}
            {activeTab === 'roomtypes' && <ManagerRoomTypes branchId={user?.branch_id} />}
            {activeTab === 'rooms' && <ManagerRooms branchId={user?.branch_id} />}
            {activeTab === 'staff' && <ManagerStaff branchId={user?.branch_id} />}
            {activeTab === 'financial' && <ManagerFinancial branchId={user?.branch_id} stats={stats} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
