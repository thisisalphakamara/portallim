import { getRoleDisplayName, formatDate, formatDateShort } from '../utils/helpers';
import { UserRole } from '../types';

describe('Helpers', () => {
    describe('getRoleDisplayName', () => {
        it('should return correct display name for STUDENT role', () => {
            const displayName = getRoleDisplayName(UserRole.STUDENT);
            expect(displayName).toBe('Student');
        });

        it('should return correct display name for YEAR_LEADER role', () => {
            const displayName = getRoleDisplayName(UserRole.YEAR_LEADER);
            expect(displayName).toBe('Year Leader');
        });

        it('should return correct display name for FINANCE_OFFICER role', () => {
            const displayName = getRoleDisplayName(UserRole.FINANCE_OFFICER);
            expect(displayName).toBe('Finance Officer');
        });

        it('should return correct display name for REGISTRAR role', () => {
            const displayName = getRoleDisplayName(UserRole.REGISTRAR);
            expect(displayName).toBe('Registrar');
        });

        it('should return correct display name for SYSTEM_ADMIN role', () => {
            const displayName = getRoleDisplayName(UserRole.SYSTEM_ADMIN);
            expect(displayName).toBe('System Admin');
        });
    });

    describe('formatDate', () => {
        it('should format date with time correctly', () => {
            const dateString = '2024-01-15T10:30:00Z';
            const formatted = formatDate(dateString);
            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe('string');
            expect(formatted).toContain('January');
            expect(formatted).toContain('2024');
        });

        it('should include time in formatted output', () => {
            const dateString = '2024-01-15T14:30:00Z';
            const formatted = formatDate(dateString);
            expect(formatted).toBeDefined();
            expect(formatted.length).toBeGreaterThan(10);
        });
    });

    describe('formatDateShort', () => {
        it('should format date in short format', () => {
            const dateString = '2024-01-15T10:30:00Z';
            const formatted = formatDateShort(dateString);
            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe('string');
            expect(formatted).toContain('Jan');
            expect(formatted).toContain('2024');
        });

        it('should handle different months correctly', () => {
            const dateString = '2024-12-25T10:30:00Z';
            const formatted = formatDateShort(dateString);
            expect(formatted).toContain('Dec');
            expect(formatted).toContain('2024');
        });
    });
});
