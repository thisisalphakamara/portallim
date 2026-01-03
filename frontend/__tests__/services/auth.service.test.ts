import { login, logout, getCurrentUserProfile, changePassword, changeEmail } from '../services/auth.service';
import { api } from '../services/api';

// Mock the API service
jest.mock('../services/api', () => ({
    api: {
        get: jest.fn(),
        post: jest.fn(),
    },
}));

describe('Auth Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    describe('login', () => {
        it('should login successfully and store token', async () => {
            const credentials = { email: 'test@test.com', password: 'password123' };
            const mockResponse = {
                success: true,
                token: 'test-token',
                user: { id: 1, email: 'test@test.com', role: 'STUDENT' },
            };

            (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

            const result = await login(credentials);

            expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
            expect(result).toEqual(mockResponse);
            expect(localStorage.getItem('token')).toBe('test-token');
        });

        it('should not store token if login fails', async () => {
            const credentials = { email: 'test@test.com', password: 'wrong' };
            const mockResponse = {
                success: false,
                error: 'Invalid credentials',
            };

            (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

            const result = await login(credentials);

            expect(result).toEqual(mockResponse);
            expect(localStorage.getItem('token')).toBeNull();
        });

        it('should handle login errors', async () => {
            const credentials = { email: 'test@test.com', password: 'password123' };
            (api.post as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            await expect(login(credentials)).rejects.toThrow('Network error');
            expect(localStorage.getItem('token')).toBeNull();
        });
    });

    describe('logout', () => {
        it('should remove token from localStorage', () => {
            localStorage.setItem('token', 'test-token');

            logout();

            expect(localStorage.getItem('token')).toBeNull();
        });

        it('should handle logout when no token exists', () => {
            expect(() => logout()).not.toThrow();
            expect(localStorage.getItem('token')).toBeNull();
        });
    });

    describe('getCurrentUserProfile', () => {
        it('should fetch user profile when token exists', async () => {
            localStorage.setItem('token', 'test-token');
            const mockUser = {
                success: true,
                user: {
                    id: 1,
                    email: 'test@test.com',
                    fullName: 'Test User',
                    role: 'STUDENT',
                },
            };

            (api.get as jest.Mock).mockResolvedValueOnce(mockUser);

            const result = await getCurrentUserProfile();

            expect(api.get).toHaveBeenCalledWith('/auth/me');
            expect(result).toEqual(mockUser.user);
        });

        it('should return null when no token exists', async () => {
            const result = await getCurrentUserProfile();

            expect(result).toBeNull();
            expect(api.get).not.toHaveBeenCalled();
        });

        it('should return null when API call fails', async () => {
            localStorage.setItem('token', 'test-token');
            const mockResponse = {
                success: false,
                error: 'Unauthorized',
            };

            (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);

            const result = await getCurrentUserProfile();

            expect(result).toBeNull();
        });

        it('should handle API errors', async () => {
            localStorage.setItem('token', 'test-token');
            (api.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            await expect(getCurrentUserProfile()).rejects.toThrow('Network error');
        });
    });

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            const newPassword = 'newPassword123';
            const mockResponse = {
                success: true,
                message: 'Password updated successfully',
            };

            (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

            const result = await changePassword(newPassword);

            expect(api.post).toHaveBeenCalledWith('/auth/change-password', { newPassword });
            expect(result).toEqual(mockResponse);
        });

        it('should handle password change errors', async () => {
            const newPassword = 'newPassword123';
            (api.post as jest.Mock).mockRejectedValueOnce(new Error('Password too weak'));

            await expect(changePassword(newPassword)).rejects.toThrow('Password too weak');
        });
    });

    describe('changeEmail', () => {
        it('should change email successfully', async () => {
            const newEmail = 'newemail@test.com';
            const password = 'password123';
            const mockResponse = {
                success: true,
                message: 'Email updated successfully',
            };

            (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

            const result = await changeEmail(newEmail, password);

            expect(api.post).toHaveBeenCalledWith('/auth/change-email', { newEmail, password });
            expect(result).toEqual(mockResponse);
        });

        it('should handle email change errors', async () => {
            const newEmail = 'newemail@test.com';
            const password = 'wrongpassword';
            (api.post as jest.Mock).mockRejectedValueOnce(new Error('Invalid password'));

            await expect(changeEmail(newEmail, password)).rejects.toThrow('Invalid password');
        });

        it('should handle email already in use error', async () => {
            const newEmail = 'existing@test.com';
            const password = 'password123';
            const mockResponse = {
                success: false,
                error: 'Email already in use',
            };

            (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

            const result = await changeEmail(newEmail, password);

            expect(result).toEqual(mockResponse);
        });
    });
});
