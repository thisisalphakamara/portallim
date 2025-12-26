import React, { useState } from 'react';
import { UserRole } from '../types';
import { FACULTIES } from '../constants';
import { StatCard, Table, Select, Button } from './ui';

interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  role: UserRole;
  targetUser?: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

interface SystemStats {
  totalUsers: number;
  activeStudents: number;
  staffMembers: number;
  pendingRegistrations: number;
  systemUptime: string;
  lastBackup: string;
}

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: '1',
    action: 'ACCOUNT_CREATED',
    performedBy: 'John Registrar',
    role: UserRole.REGISTRAR,
    targetUser: 'Alex Rivera',
    details: 'Created student account with ID S1001',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    ipAddress: '192.168.1.100',
  },
  {
    id: '2',
    action: 'REGISTRATION_APPROVED',
    performedBy: 'Mary Leader',
    role: UserRole.YEAR_LEADER,
    targetUser: 'Alex Rivera',
    details: 'Approved registration #abc123 - Year Leader stage',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    ipAddress: '192.168.1.101',
  },
  {
    id: '3',
    action: 'LOGIN_SUCCESS',
    performedBy: 'Admin User',
    role: UserRole.SYSTEM_ADMIN,
    details: 'Successful login from admin panel',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    ipAddress: '192.168.1.1',
  },
  {
    id: '4',
    action: 'LOGIN_FAILED',
    performedBy: 'unknown@email.com',
    role: UserRole.STUDENT,
    details: 'Failed login attempt - incorrect password (attempt 3/5)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    ipAddress: '203.45.67.89',
  },
  {
    id: '5',
    action: 'PASSWORD_CHANGED',
    performedBy: 'Alex Rivera',
    role: UserRole.STUDENT,
    details: 'Password changed successfully (first login)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    ipAddress: '192.168.1.150',
  },
];

const MOCK_STATS: SystemStats = {
  totalUsers: 1247,
  activeStudents: 1089,
  staffMembers: 158,
  pendingRegistrations: 45,
  systemUptime: '99.9%',
  lastBackup: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
};

const SystemAdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'audit' | 'users' | 'settings'>('overview');
  const [auditFilter, setAuditFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = MOCK_AUDIT_LOGS.filter(log => {
    if (auditFilter === 'all') return true;
    return log.action.toLowerCase().includes(auditFilter.toLowerCase());
  }).filter(log => {
    if (!searchQuery) return true;
    return (
      log.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetUser?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionStyle = (action: string) => {
    if (action.includes('FAILED') || action.includes('REJECTED')) return 'bg-red-100 text-red-800 border border-red-200';
    if (action.includes('APPROVED') || action.includes('SUCCESS') || action.includes('CREATED')) return 'bg-green-100 text-green-800 border border-green-200';
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const auditColumns = [
    {
      header: 'Timestamp',
      accessor: (log: AuditLog) => <span className="font-mono text-gray-500">{formatTimestamp(log.timestamp)}</span>
    },
    {
      header: 'Action',
      accessor: (log: AuditLog) => (
        <span className={`px-2 py-1 rounded text-[10px] font-bold ${getActionStyle(log.action)}`}>
          {log.action}
        </span>
      )
    },
    {
      header: 'Performed By',
      accessor: (log: AuditLog) => (
        <div>
          <p className="font-bold">{log.performedBy}</p>
          <p className="text-xs text-gray-500">{log.role}</p>
        </div>
      )
    },
    {
      header: 'Target',
      accessor: (log: AuditLog) => log.targetUser || '-'
    },
    {
      header: 'Details',
      accessor: 'details' as keyof AuditLog,
      className: 'text-gray-600'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">System Admin</h2>
          <p className="text-sm text-gray-500 mt-1">Manage system configuration and monitor activity</p>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex space-x-2 border-b border-gray-200 min-w-max">
          {(['overview', 'audit', 'users', 'settings'] as const).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeSection === section
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
            >
              {section}
            </button>
          ))}
        </div>
      </div>

      {activeSection === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard
              label="Total Users"
              value={MOCK_STATS.totalUsers.toString()}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            />
            <StatCard
              label="Active Students"
              value={MOCK_STATS.activeStudents.toString()}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
            />
            <StatCard
              label="Staff"
              value={MOCK_STATS.staffMembers.toString()}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            />
            <StatCard
              label="Pending"
              value={MOCK_STATS.pendingRegistrations.toString()}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h4 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                System Health
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-bold text-gray-700">System Uptime</span>
                  <span className="text-sm font-mono font-bold text-green-600">{MOCK_STATS.systemUptime}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-bold text-gray-700">Last Backup</span>
                  <span className="text-sm font-mono text-gray-600">{formatTimestamp(MOCK_STATS.lastBackup)}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-bold text-gray-700">Database Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold">HEALTHY</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Quick Actions</h4>
              <div className="space-y-3">
                <button className="w-full p-4 border border-gray-200 rounded-lg text-xs font-bold uppercase hover:bg-black hover:text-white hover:border-black transition-all text-left flex justify-between group">
                  <span>Run System Backup</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button className="w-full p-4 border border-gray-200 rounded-lg text-xs font-bold uppercase hover:bg-black hover:text-white hover:border-black transition-all text-left flex justify-between group">
                  <span>Clear Cache</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button className="w-full p-4 border border-gray-200 rounded-lg text-xs font-bold uppercase hover:bg-black hover:text-white hover:border-black transition-all text-left flex justify-between group">
                  <span>Export Audit Logs</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Users by Faculty</h4>
            <div className="space-y-6">
              {FACULTIES.map((faculty, index) => (
                <div key={faculty} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-700">{faculty}</span>
                      <span className="text-xs font-mono font-bold">{[312, 287, 245, 198][index]}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full transition-all duration-1000"
                        style={{ width: `${[100, 92, 78, 63][index]}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'audit' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {['all', 'login', 'account', 'registration', 'password'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setAuditFilter(filter)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors ${auditFilter === filter
                      ? 'bg-black text-white border-black'
                      : 'bg-white border-gray-200 hover:border-gray-400 text-gray-600'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <Table
            columns={auditColumns}
            data={filteredLogs}
            emptyMessage="No audit logs found matching your criteria"
          />

          <div className="flex items-center justify-between text-xs px-2">
            <p className="text-gray-500 font-medium">Showing {filteredLogs.length} of {MOCK_AUDIT_LOGS.length} logs</p>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" disabled>Previous</Button>
              <Button size="sm" variant="outline" disabled>Next</Button>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'users' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h4 className="text-sm font-bold uppercase tracking-widest mb-4">User Management</h4>
            <p className="text-sm text-gray-500 mb-6">
              System Administrators are responsible for creating and managing staff accounts (Registrar, Finance, Faculty Admin, and Year Leaders). Student accounts are managed exclusively by the Registrar department.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" fullWidth onClick={() => setActiveSection('users')}>Manage Staff Roles</Button>
              <Button variant="outline" fullWidth>Security Audit</Button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Login Security</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div>
                  <p className="text-sm font-bold">Maximum Login Attempts</p>
                  <p className="text-xs text-gray-500">Lock account after failed attempts</p>
                </div>
                <div className="w-40">
                  <Select
                    options={[
                      { value: '3', label: '3 attempts' },
                      { value: '5', label: '5 attempts' },
                      { value: '10', label: '10 attempts' }
                    ]}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div>
                  <p className="text-sm font-bold">Lockout Duration</p>
                  <p className="text-xs text-gray-500">Time before account unlocks</p>
                </div>
                <div className="w-40">
                  <Select
                    options={[
                      { value: '15', label: '15 minutes' },
                      { value: '30', label: '30 minutes' },
                      { value: '60', label: '1 hour' },
                      { value: 'manual', label: 'Manual unlock only' }
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Registration Settings</h4>
            <div className="space-y-4">
              {[
                { label: 'Registration Period Active', desc: 'Allow students to submit registrations' },
                { label: 'Email Notifications', desc: 'Send email on registration status changes' },
                { label: 'SMS Notifications', desc: 'Send SMS on registration status changes' }
              ].map((setting, i) => (
                <label key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-bold">{setting.label}</p>
                    <p className="text-xs text-gray-500">{setting.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-black rounded" />
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Academic Year</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Current Academic Year"
                options={[
                  { value: '2024/2025', label: '2024/2025' },
                  { value: '2025/2026', label: '2025/2026' }
                ]}
              />
              <Select
                label="Current Semester"
                options={[
                  { value: '1', label: 'Semester 1' },
                  { value: '2', label: 'Semester 2' },
                  { value: '3', label: 'Summer Session' }
                ]}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button size="lg">Save All Settings</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemAdminDashboard;
