import { ValidationService } from '../../services/validation.service';

describe('ValidationService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('validateAcademicYear', () => {
        it('should accept valid academic year format', () => {
            expect(() => {
                ValidationService.validateAcademicYear('2024/2025');
            }).not.toThrow();
        });

        it('should reject invalid academic year format', () => {
            expect(() => {
                ValidationService.validateAcademicYear('2024');
            }).toThrow();
        });

        it('should reject academic year with invalid years', () => {
            expect(() => {
                ValidationService.validateAcademicYear('2024/2023');
            }).toThrow();
        });
    });

    describe('validateSemesterAndYear', () => {
        it('should accept valid semester and year', () => {
            expect(() => {
                ValidationService.validateSemesterAndYear('SEMESTER_1', 1);
            }).not.toThrow();

            expect(() => {
                ValidationService.validateSemesterAndYear('SEMESTER_2', 3);
            }).not.toThrow();
        });

        it('should reject invalid semester', () => {
            expect(() => {
                ValidationService.validateSemesterAndYear('INVALID', 1);
            }).toThrow();
        });

        it('should reject invalid year level', () => {
            expect(() => {
                ValidationService.validateSemesterAndYear('SEMESTER_1', 0);
            }).toThrow();

            expect(() => {
                ValidationService.validateSemesterAndYear('SEMESTER_1', 5);
            }).toThrow();
        });
    });

    describe('validateRejectionReason', () => {
        it('should accept valid rejection reason', () => {
            expect(() => {
                ValidationService.validateRejectionReason('This is a valid reason for rejection.');
            }).not.toThrow();
        });

        it('should reject empty rejection reason', () => {
            expect(() => {
                ValidationService.validateRejectionReason('');
            }).toThrow();
        });

        it('should reject rejection reason that is too short', () => {
            expect(() => {
                ValidationService.validateRejectionReason('Too short');
            }).toThrow();
        });
    });

    describe('validateStudentAccountCreation', () => {
        it('should accept valid student account data', () => {
            const validData = {
                fullName: 'John Doe',
                email: 'john.doe@student.limkokwing.edu.sl',
                studentId: 'STU2024001',
                facultyId: 'faculty-123',
                programId: 'program-456',
                yearLevel: 1,
                phoneNumber: '+23276123456',
                sponsorType: 'SELF_SPONSORED',
            };

            expect(() => {
                ValidationService.validateStudentAccountCreation(validData);
            }).not.toThrow();
        });

        it('should reject data with missing required fields', () => {
            const invalidData = {
                fullName: 'John Doe',
                email: 'john.doe@student.limkokwing.edu.sl',
            };

            expect(() => {
                ValidationService.validateStudentAccountCreation(invalidData);
            }).toThrow();
        });

        it('should reject invalid email format', () => {
            const invalidData = {
                fullName: 'John Doe',
                email: 'invalid-email',
                studentId: 'STU2024001',
                facultyId: 'faculty-123',
                programId: 'program-456',
                yearLevel: 1,
                phoneNumber: '+23276123456',
                sponsorType: 'SELF_SPONSORED',
            };

            expect(() => {
                ValidationService.validateStudentAccountCreation(invalidData);
            }).toThrow();
        });

        it('should reject invalid year level', () => {
            const invalidData = {
                fullName: 'John Doe',
                email: 'john.doe@student.limkokwing.edu.sl',
                studentId: 'STU2024001',
                facultyId: 'faculty-123',
                programId: 'program-456',
                yearLevel: 5,
                phoneNumber: '+23276123456',
                sponsorType: 'SELF_SPONSORED',
            };

            expect(() => {
                ValidationService.validateStudentAccountCreation(invalidData);
            }).toThrow();
        });
    });
});
