/**
 * Utility functions for the application
 */

import { UserRole } from '../types';

/**
 * Get user-friendly display name for a role
 */
export function getRoleDisplayName(role: UserRole): string {
    const roleNames: Record<UserRole, string> = {
        [UserRole.STUDENT]: 'Student',
        [UserRole.YEAR_LEADER]: 'Year Leader',
        [UserRole.FACULTY_ADMIN]: 'Faculty Admin',
        [UserRole.FINANCE_OFFICER]: 'Finance Officer',
        [UserRole.REGISTRAR]: 'Registrar',
        [UserRole.SYSTEM_ADMIN]: 'System Admin',
    };

    return roleNames[role] || role;
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format a date to a short format
 */
export function formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
