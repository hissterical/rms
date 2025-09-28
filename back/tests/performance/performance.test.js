import request from 'supertest';
import express from 'express';
import cors from 'cors';
import userRoutes from '../../routes/userRoutes.js';
import propertyRoutes from '../../routes/propertyRoutes.js';
import adminRoutes from '../../routes/adminRoutes.js';
import { TestDataHelper } from '../helpers/testDataHelper.js';

describe('Performance Tests', () => {
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

        await TestDataHelper.ensureRolesExist();
    });

    describe('Authentication Performance', () => {
        test('login should complete within acceptable time', async () => {
            const user = await TestDataHelper.createUser({
                email: `perf.login.${Date.now()}@example.com`
            });

            const startTime = Date.now();

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: user.email,
                    password: user.plainPassword
                });

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            expect(response.status).toBe(200);
            expect(responseTime).toBeLessThan(2000); // Should complete within 2 seconds
        });

        test('password hashing should not be too slow', async () => {
            const passwords = Array(5).fill().map((_, i) => `testpassword${i}123`);

            const startTime = Date.now();

            // Register multiple users concurrently
            const registrationPromises = passwords.map((password, i) =>
                request(app)
                    .post('/api/auth/register')
                    .send({
                        firstName: 'Performance',
                        lastName: `Test${i}`,
                        email: `perf.hash.${Date.now()}.${i}@example.com`,
                        password,
                        roleName: 'guest'
                    })
            );

            const responses = await Promise.all(registrationPromises);

            const endTime = Date.now();
            const totalTime = endTime - startTime;

            // All registrations should succeed
            responses.forEach(response => {
                expect(response.status).toBe(201);
            });

            // Should complete all registrations within reasonable time
            expect(totalTime).toBeLessThan(10000); // 10 seconds for 5 registrations

            const avgTimePerRegistration = totalTime / passwords.length;
            expect(avgTimePerRegistration).toBeLessThan(3000); // 3 seconds per registration
        });

        test('token verification should be fast', async () => {
            const user = await TestDataHelper.createUser();
            const token = await request(app)
                .post('/api/auth/login')
                .send({
                    email: user.email,
                    password: user.plainPassword
                })
                .then(res => res.body.token);

            // Make multiple concurrent authenticated requests
            const requestCount = 20;
            const startTime = Date.now();

            const requests = Array(requestCount).fill().map(() =>
                request(app)
                    .get('/api/auth/profile')
                    .set('Authorization', `Bearer ${token}`)
            );

            const responses = await Promise.all(requests);

            const endTime = Date.now();
            const totalTime = endTime - startTime;

            // All requests should succeed
            responses.forEach(response => {
                expect(response.status).toBe(200);
            });

            // Should handle concurrent requests efficiently
            const avgTimePerRequest = totalTime / requestCount;
            expect(avgTimePerRequest).toBeLessThan(500); // 500ms per request on average
        });
    });

    describe('Database Performance', () => {
        test('user lookup performance with large dataset', async () => {
            // Create multiple users
            const userCount = 50;
            const users = [];

            for (let i = 0; i < userCount; i++) {
                const user = await TestDataHelper.createUser({
                    email: `perf.lookup.${Date.now()}.${i}@example.com`,
                    firstName: `User${i}`,
                    lastName: `Test${i}`
                });
                users.push(user);
            }

            const superAdmin = await TestDataHelper.createUser({
                roleName: 'super_admin',
                email: `perf.admin.${Date.now()}@example.com`
            });

            const token = await request(app)
                .post('/api/auth/login')
                .send({
                    email: superAdmin.email,
                    password: superAdmin.plainPassword
                })
                .then(res => res.body.token);

            // Test user listing performance
            const startTime = Date.now();

            const response = await request(app)
                .get('/api/admin/users?limit=100')
                .set('Authorization', `Bearer ${token}`);

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            expect(response.status).toBe(200);
            expect(response.body.users).toBeDefined();
            expect(responseTime).toBeLessThan(3000); // Should complete within 3 seconds
        });

        test('property queries should scale efficiently', async () => {
            const propertyOwner = await TestDataHelper.createUser({
                roleName: 'property_owner',
                email: `perf.property.${Date.now()}@example.com`
            });

            const token = await request(app)
                .post('/api/auth/login')
                .send({
                    email: propertyOwner.email,
                    password: propertyOwner.plainPassword
                })
                .then(res => res.body.token);

            // Create multiple properties
            const propertyCount = 10;
            const properties = [];

            for (let i = 0; i < propertyCount; i++) {
                const propertyResponse = await request(app)
                    .post('/api/properties')
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        name: `Performance Hotel ${i}`,
                        address: `${i} Performance Street`,
                        description: `Test property ${i}`,
                        property_type: 'Hotel'
                    });

                if (propertyResponse.status === 201) {
                    properties.push(propertyResponse.body.property);
                }
            }

            // Test property listing performance
            const startTime = Date.now();

            const response = await request(app)
                .get('/api/auth/properties')
                .set('Authorization', `Bearer ${token}`);

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            expect(response.status).toBe(200);
            expect(responseTime).toBeLessThan(2000); // Should complete within 2 seconds
        });
    });

    describe('Concurrent Operations', () => {
        test('should handle concurrent user registrations', async () => {
            const concurrentRegistrations = 10;
            const startTime = Date.now();

            const registrationPromises = Array(concurrentRegistrations).fill().map((_, i) =>
                request(app)
                    .post('/api/auth/register')
                    .send({
                        firstName: 'Concurrent',
                        lastName: `User${i}`,
                        email: `concurrent.${Date.now()}.${i}@example.com`,
                        password: 'concurrentpassword123',
                        roleName: 'guest'
                    })
            );

            const responses = await Promise.all(registrationPromises);

            const endTime = Date.now();
            const totalTime = endTime - startTime;

            // All registrations should succeed
            const successfulRegistrations = responses.filter(r => r.status === 201);
            expect(successfulRegistrations.length).toBe(concurrentRegistrations);

            // Should handle concurrent operations efficiently
            expect(totalTime).toBeLessThan(8000); // 8 seconds for 10 concurrent registrations
        });

        test('should handle concurrent property operations', async () => {
            const propertyOwner = await TestDataHelper.createUser({
                roleName: 'property_owner',
                email: `concurrent.owner.${Date.now()}@example.com`
            });

            const token = await request(app)
                .post('/api/auth/login')
                .send({
                    email: propertyOwner.email,
                    password: propertyOwner.plainPassword
                })
                .then(res => res.body.token);

            const concurrentProperties = 5;
            const startTime = Date.now();

            const propertyPromises = Array(concurrentProperties).fill().map((_, i) =>
                request(app)
                    .post('/api/properties')
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        name: `Concurrent Hotel ${i}`,
                        address: `${i} Concurrent Street`,
                        property_type: 'Hotel'
                    })
            );

            const responses = await Promise.all(propertyPromises);

            const endTime = Date.now();
            const totalTime = endTime - startTime;

            // All property creations should succeed
            const successfulCreations = responses.filter(r => r.status === 201);
            expect(successfulCreations.length).toBe(concurrentProperties);

            expect(totalTime).toBeLessThan(5000); // 5 seconds for 5 concurrent property creations
        });

        test('should handle concurrent login attempts for same user', async () => {
            const user = await TestDataHelper.createUser({
                email: `concurrent.login.${Date.now()}@example.com`
            });

            const concurrentLogins = 5;
            const startTime = Date.now();

            const loginPromises = Array(concurrentLogins).fill().map(() =>
                request(app)
                    .post('/api/auth/login')
                    .send({
                        email: user.email,
                        password: user.plainPassword
                    })
            );

            const responses = await Promise.all(loginPromises);

            const endTime = Date.now();
            const totalTime = endTime - startTime;

            // All logins should succeed
            responses.forEach(response => {
                expect(response.status).toBe(200);
                expect(response.body.token).toBeDefined();
            });

            expect(totalTime).toBeLessThan(3000); // 3 seconds for 5 concurrent logins
        });
    });

    describe('Memory Usage', () => {
        test('should not cause memory leaks with repeated operations', async () => {
            const user = await TestDataHelper.createUser();
            const token = await request(app)
                .post('/api/auth/login')
                .send({
                    email: user.email,
                    password: user.plainPassword
                })
                .then(res => res.body.token);

            const initialMemory = process.memoryUsage();

            // Perform many operations
            const operationCount = 100;

            for (let i = 0; i < operationCount; i++) {
                await request(app)
                    .get('/api/auth/profile')
                    .set('Authorization', `Bearer ${token}`);
            }

            const finalMemory = process.memoryUsage();

            // Memory usage shouldn't increase dramatically
            const heapGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
            const heapGrowthMB = heapGrowth / 1024 / 1024;

            // Allow some memory growth but not excessive
            expect(heapGrowthMB).toBeLessThan(50); // Less than 50MB growth
        });
    });

    describe('Response Size Optimization', () => {
        test('should return appropriately sized responses', async () => {
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
                .get('/api/admin/users?limit=10')
                .set('Authorization', `Bearer ${token}`);

            if (response.status === 200) {
                const responseSize = JSON.stringify(response.body).length;

                // Response should be reasonable size (not bloated with unnecessary data)
                expect(responseSize).toBeLessThan(50000); // Less than 50KB for 10 users

                // Should include pagination for large datasets
                expect(response.body.pagination).toBeDefined();
            }
        });

        test('should handle pagination efficiently', async () => {
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

            // Test different page sizes
            const pageSizes = [5, 10, 25];

            for (const pageSize of pageSizes) {
                const startTime = Date.now();

                const response = await request(app)
                    .get(`/api/admin/users?limit=${pageSize}&page=1`)
                    .set('Authorization', `Bearer ${token}`);

                const endTime = Date.now();
                const responseTime = endTime - startTime;

                if (response.status === 200) {
                    expect(response.body.users.length).toBeLessThanOrEqual(pageSize);
                    expect(responseTime).toBeLessThan(2000); // Should be fast regardless of page size
                }
            }
        });
    });

    describe('Error Handling Performance', () => {
        test('should handle validation errors quickly', async () => {
            const invalidRequests = [
                { email: 'invalid-email' },
                { firstName: '', lastName: '', email: '', password: '' },
                { firstName: 'Test' }, // Missing required fields
                {}
            ];

            for (const invalidData of invalidRequests) {
                const startTime = Date.now();

                const response = await request(app)
                    .post('/api/auth/register')
                    .send(invalidData);

                const endTime = Date.now();
                const responseTime = endTime - startTime;

                expect(response.status).toBe(400);
                expect(responseTime).toBeLessThan(1000); // Validation errors should be fast
            }
        });

        test('should handle authentication errors efficiently', async () => {
            const invalidTokens = [
                'invalid-token',
                'Bearer invalid',
                '',
                'expired.jwt.token'
            ];

            for (const invalidToken of invalidTokens) {
                const startTime = Date.now();

                const response = await request(app)
                    .get('/api/auth/profile')
                    .set('Authorization', `Bearer ${invalidToken}`);

                const endTime = Date.now();
                const responseTime = endTime - startTime;

                expect(response.status).toBe(401);
                expect(responseTime).toBeLessThan(500); // Auth errors should be very fast
            }
        });
    });
});