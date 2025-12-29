import React from 'react';
import { StatCard } from '../../ui';

interface DashboardStats {
  pendingTasks: number;
  totalSubmissions: number;
  approved: number;
  rejected: number;
}

interface DashboardHeaderProps {
  stats: DashboardStats;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <StatCard 
        label="Pending" 
        value={stats.pendingTasks} 
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        className="border-l-4 border-l-yellow-400"
      />
      <StatCard 
        label="Total" 
        value={stats.totalSubmissions} 
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        className="border-l-4 border-l-black"
      />
      <StatCard 
        label="Approved" 
        value={stats.approved} 
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        className="border-l-4 border-l-green-500"
      />
      <StatCard 
        label="Rejected" 
        value={stats.rejected} 
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        className="border-l-4 border-l-red-500"
      />
    </div>
  );
};

export default DashboardHeader;
