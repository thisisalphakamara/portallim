import { api } from './api';

export const getSystemSettings = async () => {
    return api.get('/settings');
};

export const updateSystemSettings = async (data: { currentAcademicYear: string, currentSession: string, isRegistrationOpen: boolean }) => {
    return api.put('/settings', data);
};
