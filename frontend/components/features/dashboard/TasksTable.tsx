import React from 'react';
import { RegistrationSubmission } from '../../../types';
import { Table, Button } from '../../ui';
import { formatShortDate, truncateId } from '../../../utils';

interface TasksTableProps {
  tasks: RegistrationSubmission[];
  onReview: (submission: RegistrationSubmission) => void;
}

const TasksTable: React.FC<TasksTableProps> = ({ tasks, onReview }) => {
  const columns = [
    {
      header: 'Student ID',
      accessor: (row: RegistrationSubmission) => (
        <span className="font-mono font-bold">#{truncateId(row.studentId)}</span>
      )
    },
    {
      header: 'Name',
      accessor: (row: RegistrationSubmission) => (
        <span className="font-bold">{row.studentName}</span>
      )
    },
    {
      header: 'Semester',
      accessor: 'semester' as keyof RegistrationSubmission
    },
    {
      header: 'Submitted',
      accessor: (row: RegistrationSubmission) => formatShortDate(row.submittedAt)
    },
    {
      header: 'Status',
      accessor: (row: RegistrationSubmission) => (
        <span className="px-2 py-1 border border-black text-[10px] font-bold">
          {row.status}
        </span>
      )
    },
    {
      header: 'Action',
      accessor: (row: RegistrationSubmission) => (
        <Button size="sm" onClick={() => onReview(row)}>
          Review
        </Button>
      ),
      className: 'text-right'
    }
  ];

  return (
    <Table
      columns={columns}
      data={tasks}
      emptyMessage="No pending tasks for your attention"
      headerClassName="bg-black text-white"
    />
  );
};

export default TasksTable;
