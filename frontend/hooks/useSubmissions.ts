import { useState, useCallback } from 'react';
import { RegistrationSubmission, RegistrationStatus, UserRole } from '../types';
import { useLocalStorage } from './useLocalStorage';

export const useSubmissions = () => {
  const [submissions, setSubmissions] = useLocalStorage<RegistrationSubmission[]>('registrations', []);

  const addSubmission = useCallback((submission: RegistrationSubmission) => {
    setSubmissions((prev) => [submission, ...prev]);
  }, [setSubmissions]);

  const updateSubmissionStatus = useCallback((id: string, newStatus: RegistrationStatus) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  }, [setSubmissions]);

  const approveSubmission = useCallback((id: string, userRole: UserRole, userName: string, comments?: string) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;

        let nextStatus = s.status;
        if (userRole === UserRole.YEAR_LEADER) nextStatus = RegistrationStatus.PENDING_FINANCE;
        else if (userRole === UserRole.FINANCE_OFFICER) nextStatus = RegistrationStatus.PENDING_REGISTRAR;
        else if (userRole === UserRole.REGISTRAR) nextStatus = RegistrationStatus.APPROVED;

        return {
          ...s,
          status: nextStatus,
          approvalHistory: [
            ...s.approvalHistory,
            {
              role: userRole,
              approvedBy: userName,
              date: new Date().toISOString(),
              comments
            }
          ]
        };
      })
    );
  }, [setSubmissions]);

  const rejectSubmission = useCallback((id: string, reason: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: RegistrationStatus.REJECTED } : s))
    );
  }, [setSubmissions]);

  return {
    submissions,
    addSubmission,
    updateSubmissionStatus,
    approveSubmission,
    rejectSubmission
  };
};
