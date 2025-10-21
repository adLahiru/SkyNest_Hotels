import React, { useState } from 'react';
import { FileText, TrendingUp } from 'lucide-react';
import MonthlyRevenueReport from './MonthlyRevenueReport';

const ReportsMain = ({ user }) => {
  const [activeReport, setActiveReport] = useState(null);

  const reports = [
    {
      id: 'monthly-revenue',
      name: 'Monthly Revenue Per Branch',
      description: 'Compare branch performance and growth trends',
      icon: TrendingUp,
      color: 'indigo',
      component: MonthlyRevenueReport,
      adminOnly: false
    }
  ];

  // Filter reports based on user role
  const availableReports = reports.filter(report => {
    if (report.adminOnly && user?.role !== 'ADMIN') {
      return false;
    }
    return true;
  });

  if (activeReport || availableReports.length === 1) {
    const ReportComponent = (activeReport || availableReports[0]).component;
    return (
      <div className="p-6">
        {availableReports.length > 1 && (
          <button
            onClick={() => setActiveReport(null)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Reports
          </button>
        )}
        <ReportComponent user={user} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-gray-600 mt-2">
          Comprehensive reports to help you make data-driven decisions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableReports.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.id}
              onClick={() => setActiveReport(report)}
              className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-${report.color}-500 p-6`}
            >
              <div className={`w-12 h-12 bg-${report.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 text-${report.color}-600`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {report.name}
              </h3>
              <p className="text-sm text-gray-600">
                {report.description}
              </p>
              {report.adminOnly && (
                <span className="inline-block mt-3 px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">
                  Admin Only
                </span>
              )}
            </div>
          );
        })}
      </div>

      {availableReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No reports available for your role</p>
        </div>
      )}
    </div>
  );
};

export default ReportsMain;
