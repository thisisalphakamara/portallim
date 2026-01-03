import React, { useState, useMemo } from 'react';
import { User, RegistrationSubmission, RegistrationStatus } from '../types';
import ApprovalModal from './ApprovalModal';
import { DashboardHeader, TasksTable, SubmissionsTable, DashboardFilters } from './features/dashboard';
import { useSearch, useFilter } from '../hooks';

interface YearLeaderDashboardProps {
  user: User;
  submissions: RegistrationSubmission[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const YearLeaderDashboard: React.FC<YearLeaderDashboardProps> = ({
  user,
  submissions,
  onApprove,
  onReject
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<RegistrationSubmission | null>(null);

  const filteredByFaculty = useMemo(() =>
    submissions.filter(s => s.faculty === user.faculty),
    [submissions, user.faculty]
  );

  const myTasks = useMemo(() =>
    filteredByFaculty.filter(s => s.status === RegistrationStatus.PENDING_YEAR_LEADER),
    [filteredByFaculty]
  );

  const { searchQuery, setSearchQuery, filteredData: searchedData } = useSearch({
    data: filteredByFaculty,
    searchFields: ['studentName', 'id']
  });

  const { filterValue: statusFilter, setFilterValue: setStatusFilter, filteredData: displayedSubmissions } = useFilter<RegistrationSubmission>({
    data: searchedData,
    filterFn: (item: RegistrationSubmission, filter) => {
      if (filter === 'pending') return item.status !== RegistrationStatus.APPROVED && item.status !== RegistrationStatus.REJECTED;
      if (filter === 'approved') return item.status === RegistrationStatus.APPROVED;
      if (filter === 'rejected') return item.status === RegistrationStatus.REJECTED;
      return true;
    }
  });

  const stats = useMemo(() => ({
    pendingTasks: myTasks.length,
    totalSubmissions: filteredByFaculty.length,
    approved: filteredByFaculty.filter(s => s.status === RegistrationStatus.APPROVED).length,
    rejected: filteredByFaculty.filter(s => s.status === RegistrationStatus.REJECTED).length
  }), [myTasks, filteredByFaculty]);

  const handleApproveWithComments = (id: string, comments: string) => {
    onApprove(id);
  };

  const handleRejectWithReason = (id: string, reason: string) => {
    onReject(id);
  };

  return (
    <div className="space-y-12">
      {selectedSubmission && (
        <ApprovalModal
          submission={selectedSubmission}
          userRole={user.role}
          onApprove={handleApproveWithComments}
          onReject={handleRejectWithReason}
          onClose={() => setSelectedSubmission(null)}
        />
      )}

      <DashboardHeader stats={stats} />

      <div className="space-y-4">
        <h3 className="text-xl font-bold uppercase tracking-widest">Active Approval Tasks</h3>
        {myTasks.length > 0 ? (
          <TasksTable tasks={myTasks} onReview={setSelectedSubmission} />
        ) : (
          <div className="bg-gray-50 border border-black p-12 text-center space-y-4">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400">No pending tasks for your faculty</p>
            {submissions.some(s => s.status === RegistrationStatus.PENDING_YEAR_LEADER && s.faculty !== user.faculty) && (
              <p className="text-[10px] font-bold uppercase text-amber-600 bg-amber-50 inline-block px-3 py-1 border border-amber-100">
                ⚠️ Note: There are pending registrations for other faculties.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-bold uppercase tracking-widest">All Registrations</h3>
          <DashboardFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter as string}
            onStatusFilterChange={setStatusFilter}
          />
        </div>
        <SubmissionsTable
          submissions={displayedSubmissions}
          onRowClick={setSelectedSubmission}
          userRole={user.role}
        />
      </div>
    </div>
  );
};

export default YearLeaderDashboard;
