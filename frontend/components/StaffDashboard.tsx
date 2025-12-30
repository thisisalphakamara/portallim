import React from 'react';
import { User, UserRole, RegistrationSubmission } from '../types';
import YearLeaderDashboard from './YearLeaderDashboard';
import FinanceOfficerDashboard from './FinanceOfficerDashboard';
import RegistrarDashboard from './RegistrarDashboard';

interface StaffDashboardProps {
  user: User;
  submissions: RegistrationSubmission[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ user, submissions, onApprove, onReject }) => {
  if (user.role === UserRole.YEAR_LEADER) {
    return <YearLeaderDashboard user={user} submissions={submissions} onApprove={onApprove} onReject={onReject} />;
  }

  if (user.role === UserRole.FINANCE_OFFICER) {
    return <FinanceOfficerDashboard user={user} submissions={submissions} onApprove={onApprove} onReject={onReject} />;
  }

  if (user.role === UserRole.REGISTRAR) {
    return <RegistrarDashboard user={user} submissions={submissions} onApprove={onApprove} onReject={onReject} />;
  }

  return null;
};

export default StaffDashboard;
