import { api } from './api';

export const createStaffAccount = async (data: any) => {
    return api.post('/admin/create-staff', data);
};

export const createStudentAccount = async (data: any) => {
    return api.post('/registrar/create-student', data);
};

export const getFaculties = async () => {
    return api.get('/data/faculties');
};

export const getProgramsByFaculty = async (facultyId: string) => {
    return api.get(`/data/programs/${facultyId}`);
};

// In the current MVP, modules are global (shared across faculties).
// We keep the function name for backwards compatibility, but the
// facultyId argument is intentionally ignored.
export const getModulesByFaculty = async (_facultyId: string, semester?: number, yearLevel?: number) => {
    const params = new URLSearchParams();
    if (semester !== undefined) params.append('semester', semester.toString());
    if (yearLevel !== undefined) params.append('yearLevel', yearLevel.toString());
    const queryString = params.toString();
    return api.get(`/data/modules${queryString ? `?${queryString}` : ''}`);
};

export const getSystemStats = async () => {
    return api.get('/admin/stats');
};

export const getAuditLogs = async () => {
    return api.get('/admin/audit-logs');
};

export const getAllStaff = async () => {
    return api.get('/admin/staff');
};

export const getStudents = async () => {
    return api.get('/registrar/students');
};

export const deleteStudentAccount = async (email: string) => {
    return api.delete(`/registrar/students/${encodeURIComponent(email)}`);
};

export const deleteStaffAccount = async (email: string) => {
    return api.delete(`/admin/staff/${encodeURIComponent(email)}`);
};

// Quick Actions
export const runSystemBackup = async () => {
    return api.post('/admin/backup', {});
};

export const clearSystemCache = async () => {
    return api.post('/admin/clear-cache', {});
};

export const exportAuditLogs = async (params?: { startDate?: string; endDate?: string; format?: 'json' | 'csv' }) => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return api.get(`/admin/export-logs${queryString}`);
};
