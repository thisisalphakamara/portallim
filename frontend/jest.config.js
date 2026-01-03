module.exports = {
    preset: 'ts-jest/presets/js-with-ts-esm',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>'],
    testMatch: ['**/__tests__/**/*.{ts,tsx}', '**/?(*.)+(spec|test).{ts,tsx}'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    collectCoverageFrom: [
        '**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/__tests__/**',
        '!index.tsx',
        '!vite-env.d.ts',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    verbose: true,
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    globals: {
        'ts-jest': {
            useESM: true,
            tsconfig: {
                jsx: 'react',
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
            },
        },
    },
    transformIgnorePatterns: [
        'node_modules/(?!(@supabase)/)',
    ],
};
