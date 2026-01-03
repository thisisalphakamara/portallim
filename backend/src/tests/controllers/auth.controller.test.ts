import { Request, Response } from 'express';
import { login, changePassword, changeEmail, getMe } from '../../controllers/auth.controller';
import { prisma } from '../../index';
import { supabase } from '../../utils/supabase';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Mock dependencies
jest.mock('../../index', () => ({
    prisma: {
        user: {
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        auditLog: {
            create: jest.fn(),
        },
    },
}));

jest.mock('../../utils/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: jest.fn(),
            admin: {
                updateUserById: jest.fn(),
            },
        },
    },
}));

jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

describe('Auth Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
        mockRequest = {
            body: {},
            user: undefined,
            ip: '127.0.0.1',
        };
        mockResponse = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should successfully login with valid credentials', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@test.com',
                fullName: 'Test User',
                role: 'STUDENT',
                supabaseId: 'supabase-123',
                loginAttempts: 0,
                lockedUntil: null,
                isFirstLogin: false,
                faculty: { name: 'Engineering' },
                program: { name: 'Computer Science' },
                facultyId: 'faculty-123',
                studentId: 'STU001',
                phoneNumber: '+23276123456',
                sponsorType: 'SELF_SPONSORED',
            };

            mockRequest.body = {
                email: 'test@test.com',
                password: 'password123',
            };

            (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
            (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
                data: { session: { access_token: 'token' } },
                error: null,
            });
            (jwt.sign as jest.Mock).mockReturnValue('jwt-token');
            (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

            await login(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    token: 'jwt-token',
                    user: expect.objectContaining({
                        id: mockUser.id,
                        email: mockUser.email,
                        role: mockUser.role,
                    }),
                })
            );
        });

        it('should return error for invalid email', async () => {
            mockRequest.body = {
                email: 'invalid@test.com',
                password: 'password123',
            };

            (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

            try {
                await login(mockRequest as Request, mockResponse as Response);
            } catch (error: any) {
                expect(error.message).toContain('Invalid email or password');
                expect(error.statusCode).toBe(401);
            }
        });

        it('should handle account lockout after max login attempts', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@test.com',
                fullName: 'Test User',
                role: 'STUDENT',
                supabaseId: 'supabase-123',
                loginAttempts: 4,
                lockedUntil: null,
                faculty: null,
                program: null,
            };

            mockRequest.body = {
                email: 'test@test.com',
                password: 'wrongpassword',
            };

            (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
            (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
                data: null,
                error: { message: 'Invalid credentials' },
            });
            (prisma.user.update as jest.Mock).mockResolvedValue({
                ...mockUser,
                loginAttempts: 5,
            });

            try {
                await login(mockRequest as Request, mockResponse as Response);
            } catch (error: any) {
                expect(error.statusCode).toBe(401);
                expect(prisma.user.update).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data: expect.objectContaining({
                            loginAttempts: 5,
                        }),
                    })
                );
            }
        });

        it('should reject login for locked account', async () => {
            const futureDate = new Date(Date.now() + 15 * 60 * 1000);
            const mockUser = {
                id: 'user-123',
                email: 'test@test.com',
                fullName: 'Test User',
                role: 'STUDENT',
                supabaseId: 'supabase-123',
                loginAttempts: 5,
                lockedUntil: futureDate,
                faculty: null,
                program: null,
            };

            mockRequest.body = {
                email: 'test@test.com',
                password: 'password123',
            };

            (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

            try {
                await login(mockRequest as Request, mockResponse as Response);
            } catch (error: any) {
                expect(error.message).toContain('Account locked');
                expect(error.statusCode).toBe(403);
            }
        });
    });

    describe('changePassword', () => {
        it('should successfully change password', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@test.com',
                supabaseId: 'supabase-123',
            };

            mockRequest.body = { newPassword: 'newPassword123' };
            (mockRequest as any).user = { id: 'user-123' };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (supabase.auth.admin.updateUserById as jest.Mock).mockResolvedValue({
                error: null,
            });
            (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

            await changePassword(mockRequest as any, mockResponse as Response);

            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: 'Password updated successfully.',
            });
        });

        it('should return error if user not found', async () => {
            mockRequest.body = { newPassword: 'newPassword123' };
            (mockRequest as any).user = { id: 'user-123' };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            try {
                await changePassword(mockRequest as any, mockResponse as Response);
            } catch (error: any) {
                expect(error.message).toBe('User not found');
                expect(error.statusCode).toBe(404);
            }
        });
    });

    describe('changeEmail', () => {
        it('should successfully change email', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'old@test.com',
                supabaseId: 'supabase-123',
            };

            mockRequest.body = {
                newEmail: 'new@test.com',
                password: 'password123',
            };
            (mockRequest as any).user = { id: 'user-123' };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
                error: null,
            });
            (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
            (supabase.auth.admin.updateUserById as jest.Mock).mockResolvedValue({
                error: null,
            });
            (prisma.user.update as jest.Mock).mockResolvedValue({
                ...mockUser,
                email: 'new@test.com',
            });
            (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

            await changeEmail(mockRequest as any, mockResponse as Response);

            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: 'Email updated successfully. Please use your new email for future logins.',
                newEmail: 'new@test.com',
            });
        });

        it('should reject if new email is same as current', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@test.com',
                supabaseId: 'supabase-123',
            };

            mockRequest.body = {
                newEmail: 'test@test.com',
                password: 'password123',
            };
            (mockRequest as any).user = { id: 'user-123' };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            try {
                await changeEmail(mockRequest as any, mockResponse as Response);
            } catch (error: any) {
                expect(error.message).toBe('New email must be different from current email');
                expect(error.statusCode).toBe(400);
            }
        });

        it('should reject if email already in use', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'old@test.com',
                supabaseId: 'supabase-123',
            };

            const existingUser = {
                id: 'user-456',
                email: 'new@test.com',
            };

            mockRequest.body = {
                newEmail: 'new@test.com',
                password: 'password123',
            };
            (mockRequest as any).user = { id: 'user-123' };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
                error: null,
            });
            (prisma.user.findFirst as jest.Mock).mockResolvedValue(existingUser);

            try {
                await changeEmail(mockRequest as any, mockResponse as Response);
            } catch (error: any) {
                expect(error.message).toBe('Email address already in use');
                expect(error.statusCode).toBe(400);
            }
        });
    });

    describe('getMe', () => {
        it('should return current user data', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@test.com',
                fullName: 'Test User',
                role: 'STUDENT',
                isFirstLogin: false,
                faculty: { name: 'Engineering' },
                program: { name: 'Computer Science' },
                facultyId: 'faculty-123',
                studentId: 'STU001',
                phoneNumber: '+23276123456',
                sponsorType: 'SELF_SPONSORED',
            };

            (mockRequest as any).user = { id: 'user-123' };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            await getMe(mockRequest as any, mockResponse as Response);

            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                user: expect.objectContaining({
                    id: mockUser.id,
                    email: mockUser.email,
                    fullName: mockUser.fullName,
                    role: mockUser.role,
                }),
            });
        });

        it('should return error if user not found', async () => {
            (mockRequest as any).user = { id: 'user-123' };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            try {
                await getMe(mockRequest as any, mockResponse as Response);
            } catch (error: any) {
                expect(error.message).toBe('User not found');
                expect(error.statusCode).toBe(404);
            }
        });
    });
});
