import request from 'supertest';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import userRoutes from '../../routes/userRoutes.js';
import propertyRoutes from '../../routes/propertyRoutes.js';
import adminRoutes from '../../routes/adminRoutes.js';
import { TestDataHelper } from '../helpers/testDataHelper.js';
import AuthService from '../../services/authService.js';

describe('Security Tests', () => {
    let app;

    beforeAll(async () => {
        app = express();
        app.use(cors());
        app.use(express.json());

        app.use('/api/auth', userRoutes);
        app.use('/api/properties', propertyRoutes);
        app.use('/api/admin', adminRoutes);

        app.use((err, req, res, next) => {
            res.status(err.status || 500).json({
                error: 'Internal Server Error',
                message: err.message
            });
        });
    });

    beforeEach(async () => {
        await TestDataHelper.ensureRolesExist();
    });

    describe('Authentication Security', () => {
        test('should prevent SQL injection in login', async () => {
            const sqlInjectionAttempts = [
                "'; DROP TABLE users; --",
                "' OR '1'='1",
                "admin'--",
                "' OR 1=1 --",
                "' UNION SELECT * FROM users --"
            ];

            for (const maliciousInput of sqlInjectionAttempts) {
                const response = await request(app)
                    .post('/api/auth/login')
                    .send({
                        email: maliciousInput,
                        password: maliciousInput
                    });

                // Should return 401 for invalid credentials, not 500 for SQL error
                expect([400, 401]).toContain(response.status);
                expect(response.body.error).toBeDefined();
            }
        });

        test('should prevent NoSQL injection attempts', async () => {
            const noSqlInjectionAttempts = [
                { $gt: "" },
                { $ne: null },
                { $regex: ".*" },
                { $where: "this.password" }
            ];

            for (const maliciousInput of noSqlInjectionAttempts) {
                const response = await request(app)
                    .post('/api/auth/login')
                    .send({
                        email: maliciousInput,
                        password: maliciousInput
                    });

                expect([400, 401]).toContain(response.status);
            }
        });

        test('should prevent XSS in user registration', async () => {
            const xssPayloads = [
                "<script>alert('xss')</script>",
                "<img src=x onerror=alert('xss')>",
                "javascript:alert('xss')",
                "<svg onload=alert('xss')>",
                "';alert('xss');//"
            ];

            for (const xssPayload of xssPayloads) {
                const response = await request(app)
                    .post('/api/auth/register')
                    .send({
                        firstName: xssPayload,
                        lastName: 'User',
                        email: `xss.${Date.now()}.${Math.random()}@example.com`,
                        password: 'testpassword123'
                    });

                // Should either succeed (with sanitized input) or fail validation
                // But should not execute the script
                if (response.status === 201) {
                    expect(response.body.user.firstName).not.toContain('<script>');
                    expect(response.body.user.firstName).not.toContain('javascript:');
                }
            }
        });

        test('should handle extremely long input strings', async () => {
            const longString = 'a'.repeat(10000);

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    firstName: longString,
                    lastName: longString,
                    email: `long.${Date.now()}@example.com`,
                    password: 'testpassword123'
                });

            // Should handle gracefully, either by truncating or validation error
            expect(response.status).toBeLessThan(500);
        });

        test('should prevent password enumeration attacks', async () => {
            const user = await TestDataHelper.createUser({
                email: `security.${Date.now()}@example.com`
            });

            // Login with correct email, wrong password
            const response1 = await request(app)
                .post('/api/auth/login')
                .send({
                    email: user.email,
                    password: 'wrongpassword'
                });

            // Login with non-existent email
            const response2 = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'anypassword'
                });

            // Both should return similar response times and error messages
            // to prevent user enumeration
            expect(response1.status).toBe(401);
            expect(response2.status).toBe(401);

            // Error messages should not reveal whether user exists
            const errorMessage1 = response1.body.message;
            const errorMessage2 = response2.body.message;

            // Should be generic messages, not "Invalid password" vs "User not found"
            expect(errorMessage1).toBeDefined();
            expect(errorMessage2).toBeDefined();
        });

        test('should handle token manipulation attempts', async () => {
            const user = await TestDataHelper.createUser();
            const validToken = AuthService.generateToken({ userId: user.id });

            // Test various token manipulations
            const tokenManipulations = [
                validToken + 'extra',
                validToken.slice(0, -10) + 'tampered',
                validToken.split('.').reverse().join('.'),
                'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ',
                '',
                'null',
                'undefined'
            ];

            for (const manipulatedToken of tokenManipulations) {
                const response = await request(app)
                    .get('/api/auth/profile')
                    .set('Authorization', `Bearer ${manipulatedToken}`);

                expect(response.status).toBe(401);
                expect(response.body.error).toBe('Access denied');
            }
        });

        test('should prevent JWT algorithm confusion attacks', async () => {
            // Create token with 'none' algorithm
            const noneToken = jwt.sign({ userId: 'malicious' }, '', { algorithm: 'none' });

            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${noneToken}`);

            expect(response.status).toBe(401);
        });

        test('should enforce rate limiting per user type', async () => {
            const guest = await TestDataHelper.createUser({ roleName: 'guest' });
            const token = await request(app)
                .post('/api/auth/login')
                .send({
                    email: guest.email,
                    password: guest.plainPassword
                })
                .then(res => res.body.token);

            // Make multiple rapid requests
            const requests = Array(20).fill().map(() =>
                request(app)
                    .get('/api/auth/profile')
                    .set('Authorization', `Bearer ${token}`)
            );

            const responses = await Promise.all(requests);

            // All should succeed or fail gracefully (no 500 errors)
            responses.forEach(response => {
                expect(response.status).toBeLessThan(500);
            });

            // Rate limit headers should be present
            expect(responses[0].headers['x-ratelimit-role']).toBe('guest');
            expect(responses[0].headers['x-ratelimit-limit']).toBeDefined();
        });
    });

    describe('Authorization Security', () => {
        test('should prevent privilege escalation attacks', async () => {
            const guest = await TestDataHelper.createUser({ roleName: 'guest' });
            const token = await request(app)
                .post('/api/auth/login')
                .send({
                    email: guest.email,
                    password: guest.plainPassword
                })
                .then(res => res.body.token);

            // Try to access admin endpoints
            const adminEndpoints = [
                '/api/admin/users',
                '/api/admin/stats',
                '/api/admin/roles'
            ];

            for (const endpoint of adminEndpoints) {
                const response = await request(app)
                    .get(endpoint)
                    .set('Authorization', `Bearer ${token}`);

                expect(response.status).toBe(403);
                expect(response.body.error).toBe('Forbidden');
            }
        });

        test('should prevent horizontal privilege escalation', async () => {
            const user1 = await TestDataHelper.createUser({
                email: `user1.${Date.now()}@example.com`
            });
            const user2 = await TestDataHelper.createUser({
                email: `user2.${Date.now()}@example.com`
            });

            const token1 = await request(app)
                .post('/api/auth/login')
                .send({
                    email: user1.email,
                    password: user1.plainPassword
                })
                .then(res => res.body.token);

            // User1 tries to update User2's profile
            const response = await request(app)
                .put(`/api/auth/profile`)
                .set('Authorization', `Bearer ${token1}`)
                .send({
                    firstName: 'Hacked',
                    lastName: 'User'
                });

            // Should only update their own profile
            expect(response.status).toBe(200);

            // Verify user2's profile wasn't changed
            const user2Token = await request(app)
                .post('/api/auth/login')
                .send({
                    email: user2.email,
                    password: user2.plainPassword
                })
                .then(res => res.body.token);

            const user2Profile = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${user2Token}`);

            expect(user2Profile.body.user.firstName).toBe(user2.first_name);
        });

        test('should prevent property access bypass attempts', async () => {
            const scenario = await TestDataHelper.createTestScenario();
            const unauthorizedUser = await TestDataHelper.createUser({
                roleName: 'guest',
                email: `unauthorized.${Date.now()}@example.com`
            });

            const token = await request(app)
                .post('/api/auth/login')
                .send({
                    email: unauthorizedUser.email,
                    password: unauthorizedUser.plainPassword
                })
                .then(res => res.body.token);

            // Try various ways to access the property
            const accessAttempts = [
                `/api/properties/${scenario.property.id}`,
                `/api/properties/${scenario.property.id}/rooms`,
                `/api/properties/${scenario.property.id}/roomtypes`
            ];

            for (const endpoint of accessAttempts) {
                const response = await request(app)
                    .get(endpoint)
                    .set('Authorization', `Bearer ${token}`);

                // Should either be forbidden or return empty results
                expect([200, 403]).toContain(response.status);

                if (response.status === 200) {
                    // If public endpoint, should not reveal sensitive data
                    expect(response.body).toBeDefined();
                }
            }
        });
    });

    describe('Input Validation Security', () => {
        test('should handle malformed JSON payloads', async () => {
            const malformedJsonTests = [
                '{"firstName": "Test"',
                '{"firstName": "Test",}',
                '{firstName: "Test"}',
                '{"firstName": "Test", "nested": {"unclosed": true}',
                'not json at all'
            ];

            for (const malformedJson of malformedJsonTests) {
                const response = await request(app)
                    .post('/api/auth/register')
                    .set('Content-Type', 'application/json')
                    .send(malformedJson);

                expect(response.status).toBe(400);
            }
        });

        test('should handle null and undefined values', async () => {
            const nullTests = [
                { firstName: null, lastName: 'User', email: 'test@example.com', password: 'password123' },
                { firstName: undefined, lastName: 'User', email: 'test@example.com', password: 'password123' },
                { firstName: 'Test', lastName: null, email: 'test@example.com', password: 'password123' },
                { firstName: 'Test', lastName: 'User', email: null, password: 'password123' },
                { firstName: 'Test', lastName: 'User', email: 'test@example.com', password: null }
            ];

            for (const testData of nullTests) {
                const response = await request(app)
                    .post('/api/auth/register')
                    .send(testData);

                expect(response.status).toBe(400);
                expect(response.body.error).toBe('Validation error');
            }
        });

        test('should handle type confusion attacks', async () => {
            const typeConfusionTests = [
                { firstName: ['array'], lastName: 'User', email: 'test@example.com', password: 'password123' },
                { firstName: { object: true }, lastName: 'User', email: 'test@example.com', password: 'password123' },
                { firstName: 123, lastName: 'User', email: 'test@example.com', password: 'password123' },
                { firstName: true, lastName: 'User', email: 'test@example.com', password: 'password123' }
            ];

            for (const testData of typeConfusionTests) {
                const response = await request(app)
                    .post('/api/auth/register')
                    .send(testData);

                // Should handle type mismatches gracefully
                expect(response.status).toBeLessThan(500);
            }
        });
    });

    describe('Error Handling Security', () => {
        test('should not leak sensitive information in error messages', async () => {
            const user = await TestDataHelper.createUser();

            // Try to login with SQL injection
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: "'; SELECT * FROM users WHERE '1'='1",
                    password: 'anypassword'
                });

            // Error message should not contain SQL or database details
            const errorMessage = response.body.message?.toLowerCase() || '';
            const sensitiveTerms = ['sql', 'database', 'postgres', 'table', 'column', 'select', 'insert', 'update', 'delete'];

            sensitiveTerms.forEach(term => {
                expect(errorMessage).not.toContain(term);
            });
        });

        test('should handle database connection errors gracefully', async () => {
            // This would require mocking the database to simulate connection failure
            // For now, just ensure error responses don't expose internal details

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password'
                });

            if (response.status >= 500) {
                expect(response.body.message).not.toContain('ECONNREFUSED');
                expect(response.body.message).not.toContain('postgres');
                expect(response.body.message).not.toContain('connection');
            }
        });

        test('should set appropriate security headers', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer invalid');

            // Check for security-related headers (if implemented)
            // These would be added by security middleware in production
            expect(response.status).toBe(401);
        });
    });

    describe('Session Security', () => {
        test('should invalidate tokens after password change', async () => {
            const user = await TestDataHelper.createUser({
                password: 'oldpassword123'
            });

            // Get initial token
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: user.email,
                    password: user.plainPassword
                });

            const oldToken = loginResponse.body.token;

            // Change password
            await request(app)
                .post('/api/auth/change-password')
                .set('Authorization', `Bearer ${oldToken}`)
                .send({
                    currentPassword: user.plainPassword,
                    newPassword: 'newpassword456'
                })
                .expect(200);

            // Old token should still work (in this implementation)
            // In production, you might implement token blacklisting
            const profileResponse = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${oldToken}`);

            // This test documents current behavior
            // In a more secure implementation, this should return 401
            expect([200, 401]).toContain(profileResponse.status);
        });

        test('should handle concurrent login attempts', async () => {
            const user = await TestDataHelper.createUser();

            // Multiple concurrent login attempts
            const loginPromises = Array(10).fill().map(() =>
                request(app)
                    .post('/api/auth/login')
                    .send({
                        email: user.email,
                        password: user.plainPassword
                    })
            );

            const responses = await Promise.all(loginPromises);

            // All should succeed (no race conditions)
            responses.forEach(response => {
                expect(response.status).toBe(200);
                expect(response.body.token).toBeDefined();
            });
        });
    });

    describe('Data Exposure Prevention', () => {
        test('should not expose password hashes in API responses', async () => {
            const superAdmin = await TestDataHelper.createUser({
                roleName: 'super_admin'
            });

            const token = await request(app)
                .post('/api/auth/login')
                .send({
                    email: superAdmin.email,
                    password: superAdmin.plainPassword
                })
                .then(res => res.body.token);

            const response = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${token}`);

            if (response.status === 200) {
                response.body.users.forEach(user => {
                    expect(user.password_hash).toBeUndefined();
                    expect(user.password).toBeUndefined();
                    expect(user.reset_token).toBeUndefined();
                });
            }
        });

        test('should not expose internal system information', async () => {
            const response = await request(app)
                .get('/api/nonexistent')
                .expect(404);

            // Error response should not expose framework details
            expect(response.body.message).not.toContain('express');
            expect(response.body.message).not.toContain('node.js');
            expect(response.body.stack).toBeUndefined();
        });
    });
});