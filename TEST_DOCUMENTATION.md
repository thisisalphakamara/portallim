# Test Suite Documentation

## Overview
This document provides comprehensive information about the test suite for the Limkokwing Online Registration System.

## Test Coverage

### Backend Tests

#### 1. **Controllers** (`src/tests/controllers/`)
- **auth.controller.test.ts**: Tests for authentication endpoints
  - Login functionality with valid/invalid credentials
  - Account lockout after failed attempts
  - Password change functionality
  - Email change functionality
  - User profile retrieval
  - Token generation and validation

#### 2. **Middleware** (`src/tests/middleware/`)
- **auth.middleware.test.ts**: Tests for authentication middleware
  - Token validation
  - User authentication
  - Role-based authorization
  - Error handling for missing/invalid tokens

- **error.middleware.test.ts**: Tests for error handling
  - AppError class functionality
  - Async error handling
  - Error response formatting
  - Development vs production error responses

#### 3. **Services** (`src/tests/services/`)
- **validation.service.test.ts**: Tests for validation logic
  - Academic year validation
  - Semester and year level validation
  - Module selection validation
  - Student registration validation
  - Faculty and program validation
  - Rejection reason validation

#### 4. **Utils** (`src/tests/utils/`)
- **supabase.test.ts**: Tests for Supabase client initialization

### Frontend Tests

#### 1. **Services** (`__tests__/services/`)
- **api.test.ts**: Tests for API service
  - GET requests
  - POST requests
  - PUT requests
  - DELETE requests
  - Authorization headers
  - Error handling (network, server, validation)
  - HTML error response handling

- **auth.service.test.ts**: Tests for authentication service
  - Login with token storage
  - Logout functionality
  - User profile retrieval
  - Password change
  - Email change
  - Error handling

#### 2. **Utils** (`__tests__/utils/`)
- **dateUtils.test.ts**: Tests for date formatting utilities
  - Date formatting
  - DateTime formatting
  - Short date formatting
  - Intake month-year formatting

- **errorUtils.test.ts**: Tests for error handling utilities
  - Error message extraction
  - Network error detection
  - Authentication error detection
  - Validation error detection
  - Server error detection
  - Error type classification
  - Error action suggestions

- **helpers.test.ts**: Tests for helper functions
  - Role display name formatting
  - Date formatting functions

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with verbose output
npm run test:verbose
```

### Frontend Tests

```bash
cd frontend

# Run all tests with coverage
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Run tests with verbose output
pnpm run test:verbose
```

## Test Configuration

### Backend (Jest)
- **Config File**: `backend/jest.config.js`
- **Test Environment**: Node
- **Preset**: ts-jest
- **Coverage Directory**: `backend/coverage`
- **Setup File**: `backend/src/tests/setup.ts`

### Frontend (Jest + React Testing Library)
- **Config File**: `frontend/jest.config.js`
- **Test Environment**: jsdom
- **Preset**: ts-jest
- **Coverage Directory**: `frontend/coverage`
- **Setup File**: `frontend/__tests__/setup.ts`

## Coverage Goals

The test suite aims for:
- **Line Coverage**: > 80%
- **Branch Coverage**: > 75%
- **Function Coverage**: > 80%
- **Statement Coverage**: > 80%

## Test Patterns

### Backend Tests
1. **Controller Tests**: Mock Prisma and Supabase clients, test request/response handling
2. **Middleware Tests**: Test authentication, authorization, and error handling
3. **Service Tests**: Test business logic and validation rules
4. **Utility Tests**: Test helper functions and utilities

### Frontend Tests
1. **Service Tests**: Mock fetch API, test API calls and error handling
2. **Utility Tests**: Test formatting, error handling, and helper functions
3. **Component Tests**: Test React components (to be expanded)

## Mocking Strategy

### Backend
- **Prisma**: Mocked using `jest.mock('@prisma/client')`
- **Supabase**: Mocked using `jest.mock('../utils/supabase')`
- **JWT**: Mocked using `jest.mock('jsonwebtoken')`

### Frontend
- **Fetch API**: Mocked using `global.fetch = jest.fn()`
- **LocalStorage**: Mocked in test setup
- **API Service**: Mocked using `jest.mock('../services/api')`

## Key Features Tested

### Authentication & Authorization
- ✅ User login with credentials
- ✅ Token generation and validation
- ✅ Account lockout mechanism
- ✅ Password change
- ✅ Email change
- ✅ Role-based access control

### Validation
- ✅ Academic year validation
- ✅ Semester and year level validation
- ✅ Student account creation validation
- ✅ Module selection validation
- ✅ Rejection reason validation

### Error Handling
- ✅ Network errors
- ✅ Authentication errors
- ✅ Validation errors
- ✅ Server errors
- ✅ Custom error messages

### API Communication
- ✅ HTTP methods (GET, POST, PUT, DELETE)
- ✅ Request headers
- ✅ Response handling
- ✅ Error responses

### Utilities
- ✅ Date formatting
- ✅ Error message extraction
- ✅ Role display names
- ✅ Helper functions

## Continuous Integration

To integrate with CI/CD:

```yaml
# Example GitHub Actions workflow
- name: Run Backend Tests
  run: |
    cd backend
    npm test -- --coverage --ci

- name: Run Frontend Tests
  run: |
    cd frontend
    pnpm test -- --coverage --ci
```

## Future Test Additions

### Planned Tests
1. **Registration Controller Tests**: Test registration submission, approval, rejection
2. **Document Controller Tests**: Test document upload, download, deletion
3. **Notification Service Tests**: Test notification creation and delivery
4. **Email Service Tests**: Test email sending functionality
5. **React Component Tests**: Test all React components with user interactions
6. **Integration Tests**: Test end-to-end workflows
7. **E2E Tests**: Test complete user journeys

## Test Maintenance

- **Review tests** when adding new features
- **Update mocks** when changing dependencies
- **Maintain coverage** above 80%
- **Run tests** before every commit
- **Fix failing tests** immediately

## Troubleshooting

### Common Issues

1. **Module not found errors**
   - Ensure all dependencies are installed
   - Check import paths

2. **Timeout errors**
   - Increase timeout in jest.config.js
   - Check for infinite loops or unresolved promises

3. **Mock not working**
   - Verify mock path matches import path
   - Clear jest cache: `jest --clearCache`

4. **Coverage not updating**
   - Delete coverage directory
   - Run tests with `--no-cache` flag

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Last Updated**: January 3, 2026
**Test Suite Version**: 1.0.0
