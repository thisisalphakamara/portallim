import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export class ValidationService {
  // Academic validations
  static validateAcademicYear(academicYear: string): void {
    const yearPattern = /^\d{4}-\d{4}$/;
    if (!yearPattern.test(academicYear)) {
      throw new AppError('Invalid academic year format. Please use YYYY-YYYY format (e.g., 2024-2025)', 400);
    }

    const [startYear, endYear] = academicYear.split('-').map(Number);
    const currentYear = new Date().getFullYear();
    
    if (startYear < currentYear - 1 || startYear > currentYear + 2) {
      throw new AppError('Academic year is outside the valid range', 400);
    }
    
    if (endYear !== startYear + 1) {
      throw new AppError('Academic year end year must be exactly one year after start year', 400);
    }
  }

  static validateSemesterAndYear(semester: string, yearLevel: number): void {
    const validSemesters = ['Fall', 'Spring', 'Summer'];
    if (!validSemesters.includes(semester)) {
      throw new AppError('Invalid semester. Must be Fall, Spring, or Summer', 400);
    }

    if (yearLevel < 1 || yearLevel > 4) {
      throw new AppError('Year level must be between 1 and 4', 400);
    }

    // Validate semester-year combinations
    if (yearLevel === 1 && semester === 'Summer') {
      throw new AppError('First-year students cannot register for Summer semester', 400);
    }
  }

  static async validateModuleSelection(
    modules: any[], 
    studentYearLevel: number, 
    facultyId: string
  ): Promise<void> {
    if (!Array.isArray(modules) || modules.length === 0) {
      throw new AppError('At least one module must be selected', 400);
    }

    if (modules.length > 10) {
      throw new AppError('Cannot select more than 10 modules per semester', 400);
    }

    // Validate each module structure
    for (const module of modules) {
      if (!module.id || !module.name || !module.code) {
        throw new AppError('Each module must have id, name, and code', 400);
      }
    }

    // Check if modules exist and belong to the correct faculty
    const moduleIds = modules.map(m => m.id);
    const dbModules = await prisma.module.findMany({
      where: {
        id: { in: moduleIds },
        facultyId
      }
    });

    if (dbModules.length !== moduleIds.length) {
      throw new AppError('One or more selected modules are not available for your faculty', 400);
    }

    // Validate module year level compatibility
    for (const module of dbModules) {
      if (module.yearLevel !== studentYearLevel) {
        throw new AppError(`Module ${module.code} is not available for year ${studentYearLevel} students`, 400);
      }
    }

    // Check for duplicate modules
    const uniqueModules = new Set(modules.map(m => m.id));
    if (uniqueModules.size !== modules.length) {
      throw new AppError('Duplicate modules selected. Please remove duplicates.', 400);
    }

    // Validate total credits (assuming each module has credits)
    const totalCredits = dbModules.reduce((sum, module) => sum + module.credits, 0);
    if (totalCredits < 12) {
      throw new AppError('Minimum of 12 credits required per semester', 400);
    }
    if (totalCredits > 24) {
      throw new AppError('Maximum of 24 credits allowed per semester', 400);
    }
  }

  static async validateStudentRegistration(
    studentId: string, 
    semester: string, 
    academicYear: string
  ): Promise<void> {
    // Check for existing registration
    const existingRegistration = await prisma.submission.findFirst({
      where: {
        studentId,
        semester,
        academicYear
      }
    });

    if (existingRegistration) {
      throw new AppError(
        `Registration already submitted for ${semester} ${academicYear}. You cannot submit multiple registrations for the same semester.`,
        409
      );
    }

    // Check if student has any pending registrations
    const pendingRegistration = await prisma.submission.findFirst({
      where: {
        studentId,
        status: {
          in: ['PENDING_YEAR_LEADER', 'PENDING_FINANCE', 'PENDING_REGISTRAR']
        }
      }
    });

    if (pendingRegistration) {
      throw new AppError(
        'You have a pending registration. Please wait for it to be processed before submitting a new one.',
        400
      );
    }
  }

  static async validateFacultyAndProgram(facultyId: string, programId: string): Promise<void> {
    // Check if faculty exists
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId }
    });

    if (!faculty) {
      throw new AppError('Invalid faculty selected', 400);
    }

    // Check if program exists and belongs to the faculty
    const program = await prisma.program.findFirst({
      where: {
        id: programId,
        facultyId
      }
    });

    if (!program) {
      throw new AppError('Invalid program selected or program does not belong to the specified faculty', 400);
    }
  }

  static validateStudentAccountCreation(data: any): void {
    const {
      email,
      fullName,
      studentId,
      nationalId,
      passportNumber,
      password
    } = data;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Check if it's a valid institutional email
    if (!email.endsWith('@limkokwing.edu.my') && !email.endsWith('@limkokwing.net')) {
      throw new AppError('Must use a valid Limkokwing institutional email address', 400);
    }

    // Name validation
    if (!fullName || fullName.trim().length < 2) {
      throw new AppError('Full name must be at least 2 characters long', 400);
    }

    if (!/^[a-zA-Z\s'-]+$/.test(fullName)) {
      throw new AppError('Full name can only contain letters, spaces, hyphens, and apostrophes', 400);
    }

    // Student ID validation
    if (!studentId || studentId.trim().length < 5) {
      throw new AppError('Student ID must be at least 5 characters long', 400);
    }

    if (!/^[a-zA-Z0-9-]+$/.test(studentId)) {
      throw new AppError('Student ID can only contain letters, numbers, and hyphens', 400);
    }

    // National ID validation (if provided)
    if (nationalId && !/^[a-zA-Z0-9-]+$/.test(nationalId)) {
      throw new AppError('National ID can only contain letters, numbers, and hyphens', 400);
    }

    // Passport number validation (if provided)
    if (passportNumber && !/^[a-zA-Z0-9-]+$/.test(passportNumber)) {
      throw new AppError('Passport number can only contain letters, numbers, and hyphens', 400);
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      throw new AppError(
        'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
        400
      );
    }

    if (password.length < 8 || password.length > 128) {
      throw new AppError('Password must be between 8 and 128 characters long', 400);
    }
  }

  static async validateApprovalWorkflow(
    submissionId: string,
    userRole: string,
    userFacultyId: string
  ): Promise<void> {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { student: true }
    });

    if (!submission) {
      throw new AppError('Registration not found', 404);
    }

    // Faculty-based access control
    if (userRole === 'YEAR_LEADER' && userFacultyId !== submission.facultyId) {
      throw new AppError('You can only approve registrations in your faculty', 403);
    }

    // Sequential workflow validation
    const validTransitions: Record<string, string[]> = {
      'YEAR_LEADER': ['PENDING_YEAR_LEADER'],
      'FINANCE_OFFICER': ['PENDING_FINANCE'],
      'REGISTRAR': ['PENDING_REGISTRAR']
    };

    const allowedStatuses = validTransitions[userRole];
    if (!allowedStatuses || !allowedStatuses.includes(submission.status)) {
      throw new AppError('Invalid approval stage or unauthorized action', 400);
    }
  }

  static validateRejectionReason(reason: string): void {
    if (!reason || reason.trim().length < 5) {
      throw new AppError('Rejection reason must be at least 5 characters long', 400);
    }

    if (reason.length > 500) {
      throw new AppError('Rejection reason cannot exceed 500 characters', 400);
    }
  }
}
