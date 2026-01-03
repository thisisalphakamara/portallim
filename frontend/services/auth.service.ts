import { api } from './api';

export const login = async (credentials: any) => {
    const result = await api.post('/auth/login', credentials);
    if (result.success && result.token) {
        localStorage.setItem('token', result.token);
    }
    return result;
};

export const logout = () => {
    localStorage.removeItem('token');
};

export const getCurrentUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const result = await api.get('/auth/me');
    return result.success ? result.user : null;
};

export const changePassword = async (newPassword: string) => {
    return api.post('/auth/change-password', { newPassword });
};

export const changeEmail = async (newEmail: string, password: string) => {
    return api.post('/auth/change-email', { newEmail, password });
};
