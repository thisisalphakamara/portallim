import { api } from './api';

export const getRegistrations = async () => {
    return api.get('/registrations');
};

export const submitRegistration = async (data: any) => {
    return api.post('/registrations/submit', data);
};

export const approveRegistration = async (id: string, comments: string) => {
    return api.post(`/registrations/${id}/approve`, { comments });
};

export const rejectRegistration = async (id: string, comments: string) => {
    return api.post(`/registrations/${id}/reject`, { comments });
};
