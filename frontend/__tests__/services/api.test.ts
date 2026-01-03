import { api } from '../services/api';

// Mock fetch
global.fetch = jest.fn();

describe('API Service', () => {
    const mockToken = 'test-token';

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        (global.fetch as jest.Mock).mockClear();
    });

    describe('GET requests', () => {
        it('should make successful GET request', async () => {
            const mockData = { success: true, data: { id: 1, name: 'Test' } };
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => mockData,
            });

            const result = await api.get('/test-endpoint');

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/test-endpoint'),
                expect.objectContaining({
                    headers: expect.any(Object),
                })
            );
            expect(result).toEqual(mockData);
        });

        it('should include authorization header when token exists', async () => {
            localStorage.setItem('token', mockToken);
            const mockData = { success: true };
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => mockData,
            });

            await api.get('/test-endpoint');

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: `Bearer ${mockToken}`,
                    }),
                })
            );
        });

        it('should handle GET request errors', async () => {
            const mockError = { success: false, error: 'Not found' };
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 404,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => mockError,
            });

            await expect(api.get('/test-endpoint')).rejects.toThrow();
        });
    });

    describe('POST requests', () => {
        it('should make successful POST request', async () => {
            const postData = { name: 'Test', value: 123 };
            const mockResponse = { success: true, id: 1 };
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => mockResponse,
            });

            const result = await api.post('/test-endpoint', postData);

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/test-endpoint'),
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.any(Object),
                    body: JSON.stringify(postData),
                })
            );
            expect(result).toEqual(mockResponse);
        });

        it('should handle POST request errors', async () => {
            const mockError = { success: false, error: 'Validation failed' };
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 400,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => mockError,
            });

            await expect(api.post('/test-endpoint', {})).rejects.toThrow();
        });
    });

    describe('PUT requests', () => {
        it('should make successful PUT request', async () => {
            const putData = { id: 1, name: 'Updated' };
            const mockResponse = { success: true };
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => mockResponse,
            });

            const result = await api.put('/test-endpoint', putData);

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/test-endpoint'),
                expect.objectContaining({
                    method: 'PUT',
                    headers: expect.any(Object),
                    body: JSON.stringify(putData),
                })
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('DELETE requests', () => {
        it('should make successful DELETE request', async () => {
            const mockResponse = { success: true };
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => mockResponse,
            });

            const result = await api.delete('/test-endpoint');

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/test-endpoint'),
                expect.objectContaining({
                    method: 'DELETE',
                    headers: expect.any(Object),
                })
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('Error handling', () => {
        it('should handle HTML error responses', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                headers: new Headers({ 'content-type': 'text/html' }),
                text: async () => '<!DOCTYPE html><html>Error</html>',
            });

            await expect(api.get('/test-endpoint')).rejects.toThrow(/HTML instead of JSON/);
        });

        it('should handle network errors', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            await expect(api.get('/test-endpoint')).rejects.toThrow('Network error');
        });

        it('should handle invalid JSON responses', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => {
                    throw new Error('Invalid JSON');
                },
            });

            await expect(api.get('/test-endpoint')).rejects.toThrow();
        });
    });
});
