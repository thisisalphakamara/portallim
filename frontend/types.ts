

export enum UserRole {
  STUDENT = 'STUDENT',
  YEAR_LEADER = 'YEAR_LEADER',
  FACULTY_ADMIN = 'FACULTY_ADMIN',
  FINANCE_OFFICER = 'FINANCE_OFFICER',
  REGISTRAR = 'REGISTRAR',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN'
}

export type Faculty = 'Faculty of Design Innovation' | 'Faculty of Multimedia Creativity' | 'Faculty of Information Technology' | 'Faculty of Business Management';

export enum RegistrationStatus {
  NOT_STARTED = 'Not Started',
  PENDING_YEAR_LEADER = 'Pending Year Leader',
  PENDING_FACULTY_ADMIN = 'Pending Faculty Admin',
  PENDING_FINANCE = 'Pending Finance',
  PENDING_REGISTRAR = 'Pending Registrar',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  faculty?: Faculty;
  program?: string;
  studentId?: string;
  nationalId?: string;
  isFirstLogin: boolean;
  phoneNumber?: string;
  sponsorType?: 'Self' | 'Parent' | 'Scholarship' | 'Other';
}

export interface Module {
  id: string;
  name: string;
  code: string;
  credits: number;
}

export interface RegistrationSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  faculty: Faculty | string;
  program: string;
  semester: string;
  academicYear: string;
  yearLevel: number;
  modules: Module[] | string[];
  status: RegistrationStatus;
  submittedAt: string;
  approvalHistory: {
    role: UserRole;
    approvedBy: string;
    date: string;
    comments?: string;
  }[];
}
