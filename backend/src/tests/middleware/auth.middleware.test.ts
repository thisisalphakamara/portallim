import jwt from 'jsonwebtoken';
import { authenticateToken, authorizeRoles } from '../../middleware/auth.middleware';
import { prisma } from '../../index';
import { Role } from '@prisma/client';

// Mock dependencies
jest.mock('../../index', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
    },
}));

describe('Auth Middleware', () => {
    let mockRequest: any;
    let mockResponse: any;
    let mockNext: jest.Mock;

    beforeEach(() => {
        mockRequest = {
            headers: {},
            user: undefined,
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe('authenticateToken', () => {
        it('should return 401 if no token is provided', async () => {
            await authenticateToken(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Access token missing',
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 401 if authorization header is missing', async () => {
            mockRequest.headers.authorization = undefined;

            await authenticateToken(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 403 if token is invalid', async () => {
            mockRequest.headers.authorization = 'Bearer invalid-token';

            await authenticateToken(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Invalid or expired token',
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 404 if user not found', async () => {
            const token = jwt.sign(
                { id: 'user-123', email: 'test@test.com', role: 'STUDENT' },
                process.env.JWT_SECRET || 'test-secret-key'
            );

            mockRequest.headers.authorization = `Bearer ${token}`;
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await authenticateToken(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'User not found',
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should authenticate valid token and attach user to request', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@test.com',
                fullName: 'Test User',
                role: 'STUDENT',
                faculty: { name: 'Engineering' },
                program: { name: 'Computer Science' },
            };

            const token = jwt.sign(
                { id: mockUser.id, email: mockUser.email, role: mockUser.role },
                process.env.JWT_SECRET || 'test-secret-key'
            );

            mockRequest.headers.authorization = `Bearer ${token}`;
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            await authenticateToken(mockRequest, mockResponse, mockNext);

            expect(mockRequest.user).toEqual(mockUser);
            expect(mockNext).toHaveBeenCalled();
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
    });

    describe('authorizeRoles', () => {
        beforeEach(() => {
            mockRequest.user = {
                id: 'user-123',
                role: Role.STUDENT,
            };
        });

        it('should allow access if user has authorized role', () => {
            const middleware = authorizeRoles(Role.STUDENT, Role.YEAR_LEADER);

            middleware(mockRequest, mockResponse, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockResponse.status).not.toHaveBeenCalled();
        });

        it('should deny access if user does not have authorized role', () => {
            const middleware = authorizeRoles(Role.SYSTEM_ADMIN, Role.REGISTRAR);

            middleware(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Unauthorized access',
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should deny access if user is not attached to request', () => {
            mockRequest.user = undefined;
            const middleware = authorizeRoles(Role.STUDENT);

            middleware(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockNext).not.toHaveBeenCalled();
        });
    });
});
