# Hotel Management System - Test Suite Documentation

## Overview

This comprehensive test suite ensures the reliability, security, and performance of the Hotel Management System's RBAC implementation. The test suite covers unit tests, integration tests, security tests, and performance tests.

## Test Structure

```
tests/
├── setup.js                     # Global test configuration
├── helpers/
│   └── testDataHelper.js       # Test data utilities
├── unit/
│   ├── authService.test.js     # Authentication service tests
│   ├── authController.test.js  # Authentication controller tests
│   └── authMiddleware.test.js  # Middleware tests
├── integration/
│   └── api.test.js             # Full API workflow tests
├── security/
│   └── security.test.js        # Security vulnerability tests
└── performance/
    └── performance.test.js     # Performance and load tests
```

## Prerequisites

### Database Setup
1. Create a test database:
   ```sql
   CREATE DATABASE hotel_management_test;
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env.test
   ```

3. Update `.env.test` with test database credentials:
   ```env
   NODE_ENV=test
   PG_TEST_DATABASE=hotel_management_test
   DATABASE_URL=postgresql://username:password@localhost:5432/hotel_management_test
   JWT_SECRET=test-jwt-secret-key-for-testing-only-minimum-32-characters
   ```

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run Database Migrations
```bash
npm run test:setup
```

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Unit tests only
npm run test:unit

# Integration tests only  
npm run test:integration

# Watch mode (re-runs on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Run Individual Test Files
```bash
# Authentication service tests
npx jest tests/unit/authService.test.js

# Security tests
npx jest tests/security/security.test.js

# Performance tests
npx jest tests/performance/performance.test.js
```

## Test Categories

### 1. Unit Tests

#### Authentication Service (`authService.test.js`)
- **Password Management**: Hashing, comparison, validation
- **JWT Token Management**: Generation, verification, expiration
- **User Management**: Creation, authentication, validation
- **Permission System**: Role-based access, property access
- **Password Reset**: Token generation, validation, reset flow
- **Password Change**: Current password verification, update

#### Authentication Controller (`authController.test.js`)
- **Registration**: User creation, validation, error handling
- **Login**: Authentication flow, token generation
- **Token Refresh**: Refresh token validation and renewal
- **Profile Management**: Get/update user profile
- **Password Operations**: Change password, forgot/reset password
- **User Properties**: Property access management

#### Middleware (`authMiddleware.test.js`)
- **Authentication Middleware**: Token validation, user loading
- **Authorization Middleware**: Permission checking, role validation
- **Property Access**: Property-specific authorization
- **Role Requirements**: Role-based route protection
- **Ownership Validation**: Resource ownership verification
- **Optional Authentication**: Public/private endpoint handling

### 2. Integration Tests (`api.test.js`)

#### Complete User Flows
- **Registration → Login → Profile Update → Password Change**
- **Token Refresh Flow**
- **Password Reset Flow**

#### Property Management Workflows
- **Property Owner**: Create properties, manage rooms, assign staff
- **Access Control**: Property isolation, unauthorized access prevention
- **Room Management**: Create room types, manage rooms

#### Admin Management
- **User Management**: Create, update, deactivate users
- **System Statistics**: Dashboard data retrieval
- **Role Management**: Role assignment, permission management

#### Authorization Edge Cases
- **Expired Tokens**: Token expiration handling
- **Malformed Headers**: Invalid authorization formats
- **Missing Authentication**: Unauthenticated access attempts

### 3. Security Tests (`security.test.js`)

#### Injection Attacks
- **SQL Injection**: Parameterized query validation
- **NoSQL Injection**: Input sanitization
- **XSS Prevention**: Script injection attempts
- **Input Validation**: Malformed data handling

#### Authentication Security
- **Password Enumeration**: User existence disclosure prevention
- **Token Manipulation**: JWT tampering detection
- **Algorithm Confusion**: JWT algorithm validation
- **Rate Limiting**: Per-role request throttling

#### Authorization Security
- **Privilege Escalation**: Vertical privilege escalation prevention
- **Horizontal Privilege Escalation**: User isolation validation
- **Property Access Bypass**: Property boundary enforcement

#### Data Protection
- **Password Hash Exposure**: Sensitive data filtering
- **Error Information Leakage**: Secure error messages
- **System Information Disclosure**: Internal detail hiding

### 4. Performance Tests (`performance.test.js`)

#### Authentication Performance
- **Login Speed**: Response time benchmarks
- **Password Hashing**: Bcrypt performance optimization
- **Token Verification**: JWT validation speed
- **Concurrent Authentication**: Multi-user login handling

#### Database Performance
- **User Queries**: Large dataset handling
- **Property Operations**: Scalable property management
- **Pagination**: Efficient data retrieval

#### Concurrent Operations
- **Parallel Registrations**: Concurrent user creation
- **Simultaneous Logins**: Same-user concurrent access
- **Property Operations**: Concurrent property management

#### Resource Management
- **Memory Usage**: Memory leak detection
- **Response Optimization**: Payload size validation
- **Error Handling Performance**: Fast error responses

## Test Data Management

### Test Data Helper (`testDataHelper.js`)
Provides utilities for creating test data:

```javascript
// Create test user with specific role
const user = await TestDataHelper.createUser({
  roleName: 'property_owner',
  email: 'owner@test.com',
  password: 'testpass123'
});

// Create complete test scenario
const scenario = await TestDataHelper.createTestScenario();
// Returns: { users, property, roomType, rooms }

// Generate JWT token for user
const token = await JWTTestHelper.generateTokenForUser(user);
```

### Test Environment Isolation
- **Database Isolation**: Separate test database
- **Data Cleanup**: Automatic cleanup between tests
- **Role Initialization**: Consistent role/permission setup
- **Environment Validation**: Test-only execution enforcement

## Coverage Requirements

The test suite aims for:
- **Line Coverage**: > 90%
- **Branch Coverage**: > 85%
- **Function Coverage**: > 95%
- **Statement Coverage**: > 90%

### Coverage Report
```bash
npm run test:coverage
```

Generates detailed coverage reports in:
- `coverage/lcov-report/index.html` (HTML report)
- `coverage/lcov.info` (LCOV format)
- `coverage/coverage-final.json` (JSON format)

## Performance Benchmarks

### Expected Performance Metrics
- **Login Response**: < 2 seconds
- **Token Verification**: < 500ms average
- **User Registration**: < 3 seconds per user
- **Database Queries**: < 2 seconds for 100 users
- **Concurrent Requests**: 20 requests < 10 seconds total

### Load Testing Parameters
- **Concurrent Users**: Up to 50 simultaneous
- **Request Volume**: 100+ requests per test
- **Memory Growth**: < 50MB per 100 operations
- **Response Size**: < 50KB for paginated data

## Security Testing

### Vulnerability Checks
- **OWASP Top 10**: Coverage of common web vulnerabilities
- **Input Validation**: Boundary testing, type confusion
- **Authentication Bypass**: Token manipulation attempts
- **Authorization Bypass**: Privilege escalation attempts
- **Information Disclosure**: Error message analysis

### Security Test Categories
- **Injection**: SQL, NoSQL, XSS, Command injection
- **Authentication**: Brute force, enumeration, token security
- **Authorization**: Vertical/horizontal privilege escalation
- **Data Exposure**: Sensitive information leakage
- **Session Management**: Token lifecycle, concurrent sessions

## Continuous Integration

### GitHub Actions Configuration
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run migrate-up
      - run: npm run test:coverage
```

### Local Development
```bash
# Watch mode for development
npm run test:watch

# Run specific test patterns
npx jest --testNamePattern="login"
npx jest --testPathPattern="security"

# Debug mode
npx jest --detectOpenHandles --forceExit
```

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Ensure test database exists
createdb hotel_management_test

# Check environment variables
echo $DATABASE_URL

# Run migrations
npm run migrate-up
```

#### Test Timeout Issues
```bash
# Increase timeout in jest.config.json
{
  "testTimeout": 60000
}

# Or for specific tests
jest.setTimeout(60000);
```

#### Memory Issues
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 node_modules/.bin/jest
```

### Test Data Cleanup
If tests are failing due to data conflicts:
```bash
# Clean and reinitialize test data
npm run test:setup
```

## Best Practices

### Writing Tests
1. **Isolation**: Each test should be independent
2. **Descriptive Names**: Clear test descriptions
3. **Setup/Teardown**: Use beforeEach/afterEach for cleanup
4. **Assertions**: Multiple specific assertions per test
5. **Error Testing**: Test both success and failure cases

### Security Testing
1. **Boundary Testing**: Test input limits and edge cases
2. **Negative Testing**: Test with invalid/malicious input
3. **Authentication Testing**: Test all auth flows and bypass attempts
4. **Authorization Testing**: Test role boundaries and privilege escalation
5. **Data Validation**: Test with various data types and formats

### Performance Testing  
1. **Baseline Metrics**: Establish performance benchmarks
2. **Load Testing**: Test with realistic user loads
3. **Memory Monitoring**: Check for memory leaks
4. **Database Testing**: Test query performance with large datasets
5. **Concurrent Testing**: Test multi-user scenarios

## Reporting Issues

When tests fail:
1. **Run Individual Test**: Isolate the failing test
2. **Check Logs**: Review console output and error messages
3. **Verify Environment**: Ensure test database and environment setup
4. **Check Dependencies**: Verify all npm packages are installed
5. **Review Changes**: Check recent code changes that might affect tests

## Future Enhancements

### Planned Additions
1. **End-to-End Tests**: Browser automation with Cypress/Playwright
2. **API Documentation Tests**: OpenAPI spec validation
3. **Database Migration Tests**: Migration rollback testing
4. **Stress Testing**: Extended load testing scenarios
5. **Security Scanning**: Automated vulnerability scanning

### Test Coverage Expansion
1. **Booking System Tests**: When booking features are implemented
2. **Payment Integration Tests**: Payment processing validation
3. **Email Service Tests**: Email delivery verification
4. **File Upload Tests**: File handling security and performance
5. **Real-time Features**: WebSocket/SSE testing

This comprehensive test suite ensures the Hotel Management System is secure, reliable, and performant across all user roles and scenarios.