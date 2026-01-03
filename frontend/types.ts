export enum UserRole {
  STUDENT = 'STUDENT',
  YEAR_LEADER = 'YEAR_LEADER',
  FINANCE_OFFICER = 'FINANCE_OFFICER',
  REGISTRAR = 'REGISTRAR',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN'
}

export interface FacultyType {
  id: string;
  name: string;
}

export interface ProgramType {
  id: string;
  name: string;
  facultyId: string;
}

export type Faculty = string;

export enum RegistrationStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING_YEAR_LEADER = 'PENDING_YEAR_LEADER',
  PENDING_FINANCE = 'PENDING_FINANCE',
  PENDING_REGISTRAR = 'PENDING_REGISTRAR',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  faculty?: string;
  facultyId?: string;
  program?: string;
  studentId?: string;
  nationalId?: string;
  isFirstLogin: boolean;
  phoneNumber?: string;
  sponsorType?: 'Self' | 'Parent' | 'Scholarship' | 'Other';
  enrollmentIntake?: string;
  registrationStatus?: string;
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
  academicStudentId?: string;
  studentName: string;
  studentEmail: string;
  phoneNumber: string;
  nationalId?: string;
  faculty: string;
  program: string;
  semester: string;
  academicYear: string;
  enrollmentIntake: string;
  yearLevel: number;
  studentClass?: string;
  sponsorType?: 'Self' | 'Parent' | 'Scholarship' | 'Other';
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
