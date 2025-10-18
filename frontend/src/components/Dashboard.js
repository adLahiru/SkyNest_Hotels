import React from 'react';
import authService from '../services/authService';
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboardTabbed';
import ReceptionistDashboard from './ReceptionistDashboard';
import HousekeepingDashboard from './HousekeepingDashboard';

const Dashboard = () => {
  const user = authService.getCurrentUser();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-28 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">Please login to access the dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on role
  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard user={user} />;
    
    case 'MANAGER':
      return <ManagerDashboard user={user} />;
    
    case 'RECEPTIONIST':
      return <ReceptionistDashboard user={user} />;
    
    case 'HOUSEKEEPING':
      return <HousekeepingDashboard user={user} />;
    
    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-28 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-700">Dashboard not available for your role.</p>
            </div>
          </div>
        </div>
      );
  }
};

export default Dashboard;
