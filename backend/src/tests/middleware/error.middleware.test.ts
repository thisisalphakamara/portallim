import { AppError, asyncHandler, errorHandler } from '../../middleware/error.middleware';
import { Request, Response, NextFunction } from 'express';

describe('Error Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe('AppError', () => {
        it('should create error with message and status code', () => {
            const error = new AppError('Test error', 400);

            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(400);
            expect(error.isOperational).toBe(true);
        });

        it('should default to status code 500', () => {
            const error = new AppError('Test error');

            expect(error.statusCode).toBe(500);
        });

        it('should capture stack trace', () => {
            const error = new AppError('Test error', 400);

            expect(error.stack).toBeDefined();
        });
    });

    describe('asyncHandler', () => {
        it('should call next with error if async function throws', async () => {
            const error = new Error('Async error');
            const asyncFn = asyncHandler(async (req, res, next) => {
                throw error;
            });

            await asyncFn(
                mockRequest as Request,
                mockResponse as Response,
                mockNext as NextFunction
            );

            expect(mockNext).toHaveBeenCalledWith(error);
        });

        it('should execute async function successfully', async () => {
            const asyncFn = asyncHandler(async (req, res, next) => {
                res.json({ success: true });
            });

            await asyncFn(
                mockRequest as Request,
                mockResponse as Response,
                mockNext as NextFunction
            );

            expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('errorHandler', () => {
        it('should handle AppError correctly', () => {
            const error = new AppError('Test error', 400);

            errorHandler(
                error,
                mockRequest as Request,
                mockResponse as Response,
                mockNext as NextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: 'Test error',
                })
            );
        });

        it('should handle generic errors with 500 status', () => {
            const error = new Error('Generic error');

            errorHandler(
                error,
                mockRequest as Request,
                mockResponse as Response,
                mockNext as NextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: 'Generic error',
                })
            );
        });

        it('should include stack trace in development mode', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            const error = new Error('Test error');

            errorHandler(
                error,
                mockRequest as Request,
                mockResponse as Response,
                mockNext as NextFunction
            );

            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    stack: expect.any(String),
                })
            );

            process.env.NODE_ENV = originalEnv;
        });

        it('should not include stack trace in production mode', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            const error = new Error('Test error');

            errorHandler(
                error,
                mockRequest as Request,
                mockResponse as Response,
                mockNext as NextFunction
            );

            const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
            expect(jsonCall.stack).toBeUndefined();

            process.env.NODE_ENV = originalEnv;
        });
    });
});
