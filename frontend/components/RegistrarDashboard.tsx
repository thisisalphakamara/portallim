
import React, { useState, useMemo } from 'react';
import { User, RegistrationSubmission, RegistrationStatus } from '../types';
import ApprovalModal from './ApprovalModal';
import { DashboardHeader, TasksTable, SubmissionsTable, DashboardFilters } from './features/dashboard';
import { useSearch, useFilter } from '../hooks';
import RegistrationSlipsSection from './RegistrationSlipsSection';

interface RegistrarDashboardProps {
  user: User;
  submissions: RegistrationSubmission[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const RegistrarDashboard: React.FC<RegistrarDashboardProps> = ({
  user,
  submissions,
  onApprove,
  onReject
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<RegistrationSubmission | null>(null);

  const myTasks = useMemo(() =>
    submissions.filter(s => s.status === RegistrationStatus.PENDING_REGISTRAR),
    [submissions]
  );

  const { searchQuery, setSearchQuery, filteredData: searchedData } = useSearch({
    data: submissions,
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
    totalSubmissions: submissions.length,
    approved: submissions.filter(s => s.status === RegistrationStatus.APPROVED).length,
    rejected: submissions.filter(s => s.status === RegistrationStatus.REJECTED).length
  }), [myTasks, submissions]);

  const handleApproveWithComments = (id: string, comments: string) => {
    onApprove(id, comments);
  };

  const handleRejectWithReason = (id: string, reason: string) => {
    onReject(id, reason);
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
          <div className="bg-gray-50 border border-black p-12 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400">No pending registrar tasks</p>
          </div>
        )}
      </div>

      <RegistrationSlipsSection submissions={submissions} registrarName={user.name} />

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

export default RegistrarDashboard;
