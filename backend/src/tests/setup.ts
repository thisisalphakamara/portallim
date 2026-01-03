// Test setup file for backend
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_KEY = 'test-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
};
