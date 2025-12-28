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

export const getModulesByFaculty = async (facultyId: string) => {
    return api.get(`/data/modules/${facultyId}`);
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
