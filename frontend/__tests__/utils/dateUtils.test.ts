import { formatDate, formatDateTime, formatShortDate, formatIntake } from '../utils/dateUtils';

describe('Date Utils', () => {
    describe('formatDate', () => {
        it('should format date correctly', () => {
            const dateString = '2024-01-15T10:30:00Z';
            const formatted = formatDate(dateString);
            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe('string');
            expect(formatted).toContain('January');
            expect(formatted).toContain('2024');
        });

        it('should handle different date formats', () => {
            const dateString = '2024-12-25';
            const formatted = formatDate(dateString);
            expect(formatted).toContain('December');
            expect(formatted).toContain('2024');
        });
    });

    describe('formatDateTime', () => {
        it('should format date and time correctly', () => {
            const dateString = '2024-01-15T10:30:00Z';
            const formatted = formatDateTime(dateString);
            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe('string');
            expect(formatted).toContain('Jan');
            expect(formatted).toContain('2024');
        });

        it('should include time in the output', () => {
            const dateString = '2024-01-15T14:30:00Z';
            const formatted = formatDateTime(dateString);
            expect(formatted).toBeDefined();
            // Should contain time information
            expect(formatted.length).toBeGreaterThan(10);
        });
    });

    describe('formatShortDate', () => {
        it('should format date in short format', () => {
            const dateString = '2024-01-15T10:30:00Z';
            const formatted = formatShortDate(dateString);
            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe('string');
        });

        it('should handle different date strings', () => {
            const dateString = '2024-12-31';
            const formatted = formatShortDate(dateString);
            expect(formatted).toBeDefined();
            expect(formatted.length).toBeGreaterThan(0);
        });
    });

    describe('formatIntake', () => {
        it('should format intake month-year correctly', () => {
            const intake = '2024-09';
            const formatted = formatIntake(intake);
            expect(formatted).toBeDefined();
            expect(formatted).toContain('September');
            expect(formatted).toContain('2024');
        });

        it('should handle January intake', () => {
            const intake = '2024-01';
            const formatted = formatIntake(intake);
            expect(formatted).toContain('January');
            expect(formatted).toContain('2024');
        });

        it('should return original string if format is invalid', () => {
            const intake = 'invalid-format';
            const formatted = formatIntake(intake);
            expect(formatted).toBe(intake);
        });

        it('should handle December intake', () => {
            const intake = '2024-12';
            const formatted = formatIntake(intake);
            expect(formatted).toContain('December');
            expect(formatted).toContain('2024');
        });
    });
});
