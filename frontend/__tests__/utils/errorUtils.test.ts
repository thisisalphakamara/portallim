import { ErrorUtils } from '../utils/errorUtils';

describe('ErrorUtils', () => {
    describe('extractErrorMessage', () => {
        it('should extract error from string', () => {
            const error = 'Simple error message';
            const message = ErrorUtils.extractErrorMessage(error);
            expect(message).toBe('Simple error message');
        });

        it('should extract error from error object with error property', () => {
            const error = { error: 'Error message' };
            const message = ErrorUtils.extractErrorMessage(error);
            expect(message).toBe('Error message');
        });

        it('should extract error from error object with message property', () => {
            const error = { message: 'Error message' };
            const message = ErrorUtils.extractErrorMessage(error);
            expect(message).toBe('Error message');
        });

        it('should extract error from response data', () => {
            const error = {
                response: {
                    data: {
                        error: 'Server error message',
                    },
                },
            };
            const message = ErrorUtils.extractErrorMessage(error);
            expect(message).toBe('Server error message');
        });

        it('should handle validation errors array', () => {
            const error = {
                response: {
                    data: {
                        details: ['Error 1', 'Error 2', 'Error 3'],
                    },
                },
            };
            const message = ErrorUtils.extractErrorMessage(error);
            expect(message).toBe('Error 1, Error 2, Error 3');
        });

        it('should handle validation errors string', () => {
            const error = {
                response: {
                    data: {
                        details: 'Validation error details',
                    },
                },
            };
            const message = ErrorUtils.extractErrorMessage(error);
            expect(message).toBe('Validation error details');
        });

        it('should handle network connection errors', () => {
            const error = { code: 'ECONNREFUSED' };
            const message = ErrorUtils.extractErrorMessage(error);
            expect(message).toContain('Unable to connect to the server');
        });

        it('should handle network errors', () => {
            const error = { code: 'NETWORK_ERROR' };
            const message = ErrorUtils.extractErrorMessage(error);
            expect(message).toContain('Network error');
        });

        it('should handle timeout errors', () => {
            const error = { code: 'ECONNABORTED' };
            const message = ErrorUtils.extractErrorMessage(error);
            expect(message).toContain('Request timed out');
        });

        it('should return default message for unknown errors', () => {
            const error = {};
            const message = ErrorUtils.extractErrorMessage(error);
            expect(message).toBe('An unexpected error occurred. Please try again.');
        });
    });

    describe('isNetworkError', () => {
        it('should return true for connection refused', () => {
            const error = { code: 'ECONNREFUSED' };
            expect(ErrorUtils.isNetworkError(error)).toBe(true);
        });

        it('should return true for network error code', () => {
            const error = { code: 'NETWORK_ERROR' };
            expect(ErrorUtils.isNetworkError(error)).toBe(true);
        });

        it('should return true for network error message', () => {
            const error = { message: 'Network Error occurred' };
            expect(ErrorUtils.isNetworkError(error)).toBe(true);
        });

        it('should return false for non-network errors', () => {
            const error = { code: 'OTHER_ERROR' };
            expect(ErrorUtils.isNetworkError(error)).toBe(false);
        });
    });

    describe('isAuthError', () => {
        it('should return true for 401 status', () => {
            const error = { response: { status: 401 } };
            expect(ErrorUtils.isAuthError(error)).toBe(true);
        });

        it('should return true for 403 status', () => {
            const error = { response: { status: 403 } };
            expect(ErrorUtils.isAuthError(error)).toBe(true);
        });

        it('should return true for direct status property', () => {
            const error = { status: 401 };
            expect(ErrorUtils.isAuthError(error)).toBe(true);
        });

        it('should return false for non-auth errors', () => {
            const error = { response: { status: 400 } };
            expect(ErrorUtils.isAuthError(error)).toBe(false);
        });
    });

    describe('isValidationError', () => {
        it('should return true for 400 status', () => {
            const error = { response: { status: 400 } };
            expect(ErrorUtils.isValidationError(error)).toBe(true);
        });

        it('should return false for non-400 status', () => {
            const error = { response: { status: 500 } };
            expect(ErrorUtils.isValidationError(error)).toBe(false);
        });
    });

    describe('isServerError', () => {
        it('should return true for 500 status', () => {
            const error = { response: { status: 500 } };
            expect(ErrorUtils.isServerError(error)).toBe(true);
        });

        it('should return true for 503 status', () => {
            const error = { response: { status: 503 } };
            expect(ErrorUtils.isServerError(error)).toBe(true);
        });

        it('should return false for non-server errors', () => {
            const error = { response: { status: 400 } };
            expect(ErrorUtils.isServerError(error)).toBe(false);
        });
    });

    describe('getErrorType', () => {
        it('should return network for network errors', () => {
            const error = { code: 'ECONNREFUSED' };
            expect(ErrorUtils.getErrorType(error)).toBe('network');
        });

        it('should return auth for authentication errors', () => {
            const error = { response: { status: 401 } };
            expect(ErrorUtils.getErrorType(error)).toBe('auth');
        });

        it('should return validation for validation errors', () => {
            const error = { response: { status: 400 } };
            expect(ErrorUtils.getErrorType(error)).toBe('validation');
        });

        it('should return server for server errors', () => {
            const error = { response: { status: 500 } };
            expect(ErrorUtils.getErrorType(error)).toBe('server');
        });

        it('should return unknown for unrecognized errors', () => {
            const error = {};
            expect(ErrorUtils.getErrorType(error)).toBe('unknown');
        });
    });

    describe('getErrorAction', () => {
        it('should return appropriate action for network errors', () => {
            const error = { code: 'NETWORK_ERROR' };
            const action = ErrorUtils.getErrorAction(error);
            expect(action).toContain('check your internet connection');
        });

        it('should return appropriate action for auth errors', () => {
            const error = { response: { status: 401 } };
            const action = ErrorUtils.getErrorAction(error);
            expect(action).toContain('log in again');
        });

        it('should return appropriate action for validation errors', () => {
            const error = { response: { status: 400 } };
            const action = ErrorUtils.getErrorAction(error);
            expect(action).toContain('check your input');
        });

        it('should return appropriate action for server errors', () => {
            const error = { response: { status: 500 } };
            const action = ErrorUtils.getErrorAction(error);
            expect(action).toContain('Server error');
        });

        it('should return default action for unknown errors', () => {
            const error = {};
            const action = ErrorUtils.getErrorAction(error);
            expect(action).toContain('try again');
        });
    });
});
