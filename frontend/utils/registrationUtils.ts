import { RegistrationStatus } from '../types';

export const getStatusLabel = (status: RegistrationStatus): string => {
  const labels: Record<RegistrationStatus, string> = {
    [RegistrationStatus.NOT_STARTED]: 'Not Started',
    [RegistrationStatus.PENDING_YEAR_LEADER]: 'Awaiting Year Leader Approval',
    [RegistrationStatus.PENDING_FINANCE]: 'Awaiting Finance Verification',
    [RegistrationStatus.PENDING_REGISTRAR]: 'Awaiting Registrar Final Approval',
    [RegistrationStatus.APPROVED]: 'Approved',
    [RegistrationStatus.REJECTED]: 'Rejected'
  };
  
  return labels[status] || status;
};

export const getStatusBadgeVariant = (status: RegistrationStatus): 'default' | 'success' | 'warning' | 'danger' => {
  if (status === RegistrationStatus.APPROVED) return 'success';
  if (status === RegistrationStatus.REJECTED) return 'danger';
  return 'default';
};

export const getYearForSemester = (semester: string): string => {
  const semesterNumber = parseInt(semester.replace('Semester ', ''));
  if (semesterNumber >= 1 && semesterNumber <= 2) return 'Year 1';
  if (semesterNumber >= 3 && semesterNumber <= 4) return 'Year 2';
  if (semesterNumber >= 5 && semesterNumber <= 6) return 'Year 3';
  if (semesterNumber >= 7 && semesterNumber <= 8) return 'Year 4';
  return 'Year 1';
};

export const getCurrentSemester = (currentYear?: number): string => {
  if (!currentYear) return 'Not specified';
  
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  
  // Determine semester based on current month and student's year
  // Assuming: Jan-Jun = Semester 1, Jul-Dec = Semester 2
  if (month >= 1 && month <= 6) {
    return `Semester ${(currentYear - 1) * 2 + 1}`;
  } else {
    return `Semester ${(currentYear - 1) * 2 + 2}`;
  }
};

export const calculateTotalCredits = (modules: Array<{ credits: number }>): number => {
  return modules.reduce((sum, module) => sum + module.credits, 0);
};

export const generateSubmissionId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
