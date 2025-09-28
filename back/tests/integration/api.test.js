import request from 'supertest';
import express from 'express';
import cors from 'cors';
import userRoutes from '../../routes/userRoutes.js';
import propertyRoutes from '../../routes/propertyRoutes.js';
import adminRoutes from '../../routes/adminRoutes.js';
import { TestDataHelper, APITestHelper } from '../helpers/testDataHelper.js';

describe('API Integration Tests', () => {
    let app;

    beforeAll(async () => {
        // Set up Express app with routes (similar to main app)
        app = express();
        app.use(cors());
        app.use(express.json());

        // Register routes
        app.use('/api/auth', userRoutes);
        app.use('/api/properties', propertyRoutes);
        app.use('/api/admin', adminRoutes);

        // Error handler
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

    describe('Authentication Flow', () => {
        test('complete user registration and login flow', async () => {
            const userData = {
                firstName: 'Integration',
                lastName: 'Test',
                email: `integration.${Date.now()}@example.com`,
                phone: '+1234567890',
                password: 'testpassword123',
                roleName: 'guest'
            };

            // 1. Register new user
            const registerResponse = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(registerResponse.body.message).toBe('User registered successfully');
            expect(registerResponse.body.token).toBeDefined();
            expect(registerResponse.body.refreshToken).toBeDefined();

            const { token } = registerResponse.body;

            // 2. Get user profile with token
            const profileResponse = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(profileResponse.body.user.email).toBe(userData.email);
            expect(profileResponse.body.user.firstName).toBe(userData.firstName);

            // 3. Update profile
            const updateData = {
                firstName: 'Updated',
                lastName: 'Name',
                phone: '+9876543210'
            };

            const updateResponse = await request(app)
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData)
                .expect(200);

            expect(updateResponse.body.user.firstName).toBe('Updated');

            // 4. Change password
            const changePasswordResponse = await request(app)
                .post('/api/auth/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    currentPassword: userData.password,
                    newPassword: 'newpassword456'
                })
                .expect(200);

            expect(changePasswordResponse.body.message).toBe('Password changed successfully');

            // 5. Login with new password
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: userData.email,
                    password: 'newpassword456'
                })
                .expect(200);

            expect(loginResponse.body.message).toBe('Login successful');
            expect(loginResponse.body.token).toBeDefined();
        });

        test('token refresh flow', async () => {
            const user = await TestDataHelper.createUser();

            // Login to get tokens
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: user.email,
                    password: user.plainPassword
                })
                .expect(200);

            const { refreshToken } = loginResponse.body;

            // Refresh tokens
            const refreshResponse = await request(app)
                .post('/api/auth/refresh-token')
                .send({ refreshToken })
                .expect(200);

            expect(refreshResponse.body.token).toBeDefined();
            expect(refreshResponse.body.refreshToken).toBeDefined();
            expect(refreshResponse.body.token).not.toBe(loginResponse.body.token);
        });

        test('password reset flow', async () => {
            const user = await TestDataHelper.createUser({
                email: `reset.flow.${Date.now()}@example.com`
            });

            // Request password reset
            const forgotResponse = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: user.email })
                .expect(200);

            expect(forgotResponse.body.resetToken).toBeDefined();
            const { resetToken } = forgotResponse.body;

            // Reset password
            const resetResponse = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    resetToken,
                    newPassword: 'resetpassword123'
                })
                .expect(200);

            expect(resetResponse.body.message).toBe('Password reset successfully');

            // Login with new password
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: user.email,
                    password: 'resetpassword123'
                })
                .expect(200);

            expect(loginResponse.body.message).toBe('Login successful');
        });
    });

    describe('Property Management Flow', () => {
        test('property owner can manage properties and rooms', async () => {
            // Create property owner
            const propertyOwner = await TestDataHelper.createUser({
                roleName: 'property_owner',
                email: `owner.${Date.now()}@example.com`
            });

            const token = await request(app)
                .post('/api/auth/login')
                .send({
                    email: propertyOwner.email,
                    password: propertyOwner.plainPassword
                })
                .then(res => res.body.token);

            // Create property
            const propertyData = {
                name: 'Integration Test Hotel',
                address: '123 Test Street',
                description: 'A test hotel',
                property_type: 'Hotel'
            };

            const createPropertyResponse = await request(app)
                .post('/api/properties')
                .set('Authorization', `Bearer ${token}`)
                .send(propertyData)
                .expect(201);

            const propertyId = createPropertyResponse.body.property.id;

            // Create room type for property
            const roomTypeData = {
                room_type_name: 'Standard Room',
                description: 'Comfortable standard room',
                capacity: 2,
                price: 99.99
            };

            const createRoomTypeResponse = await request(app)
                .post(`/api/properties/${propertyId}/roomtypes`)
                .set('Authorization', `Bearer ${token}`)
                .send(roomTypeData)
                .expect(201);

            const roomTypeId = createRoomTypeResponse.body.roomType.id;

            // Create room
            const roomData = {
                room_number: '101',
                room_type_id: roomTypeId,
                floor: 1
            };

            const createRoomResponse = await request(app)
                .post(`/api/properties/${propertyId}/rooms`)
                .set('Authorization', `Bearer ${token}`)
                .send(roomData)
                .expect(201);

            expect(createRoomResponse.body.room.room_number).toBe('101');

            // Get property rooms
            const roomsResponse = await request(app)
                .get(`/api/properties/${propertyId}/rooms`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(roomsResponse.body.rooms).toHaveLength(1);
            expect(roomsResponse.body.rooms[0].room_number).toBe('101');

            // Update room
            const updateRoomResponse = await request(app)
                .put(`/api/properties/${propertyId}/rooms/${createRoomResponse.body.room.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ room_number: '101A' })
                .expect(200);

            expect(updateRoomResponse.body.room.room_number).toBe('101A');
        });

        test('guest cannot create properties', async () => {
            const guest = await TestDataHelper.createUser({
                roleName: 'guest'
            });

            const token = await request(app)
                .post('/api/auth/login')
                .send({
                    email: guest.email,
                    password: guest.plainPassword
                })
                .then(res => res.body.token);

            const propertyData = {
                name: 'Unauthorized Hotel',
                address: '123 No Access Street'
            };

            const response = await request(app)
                .post('/api/properties')
                .set('Authorization', `Bearer ${token}`)
                .send(propertyData)
                .expect(403);

            expect(response.body.error).toBe('Forbidden');
        });

        test('user cannot access other users properties', async () => {
            // Create two property owners
            const owner1 = await TestDataHelper.createUser({
                roleName: 'property_owner',
                email: `owner1.${Date.now()}@example.com`
            });

            const owner2 = await TestDataHelper.createUser({
                roleName: 'property_owner',
                email: `owner2.${Date.now()}@example.com`
            });

            // Create property for owner1
            const property1 = await TestDataHelper.createProperty();
            await TestDataHelper.assignUserToProperty(owner1.id, property1.id, 'owner');

            // Try to access owner1's property with owner2's token
            const token2 = await request(app)
                .post('/api/auth/login')
                .send({
                    email: owner2.email,
                    password: owner2.plainPassword
                })
                .then(res => res.body.token);

            const response = await request(app)
                .get(`/api/properties/${property1.id}/rooms`)
                .set('Authorization', `Bearer ${token2}`)
                .expect(403);

            expect(response.body.error).toBe('Forbidden');
        });
    });

    describe('Admin Management Flow', () => {
        test('super admin can manage users and properties', async () => {
            const superAdmin = await TestDataHelper.createUser({
                roleName: 'super_admin',
                email: `superadmin.${Date.now()}@example.com`
            });

            const token = await request(app)
                .post('/api/auth/login')
                .send({
                    email: superAdmin.email,
                    password: superAdmin.plainPassword
                })
                .then(res => res.body.token);

            // Get system statistics
            const statsResponse = await request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(statsResponse.body.stats).toBeDefined();
            expect(statsResponse.body.stats.users).toBeDefined();

            // Get all users
            const usersResponse = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(usersResponse.body.users).toBeDefined();
            expect(usersResponse.body.pagination).toBeDefined();

            // Create new user
            const newUserData = {
                firstName: 'Admin',
                lastName: 'Created',
                email: `admin.created.${Date.now()}@example.com`,
                phone: '+1234567890',
                password: 'adminpassword123',
                roleName: 'hotel_manager'
            };

            const createUserResponse = await request(app)
                .post('/api/admin/users')
                .set('Authorization', `Bearer ${token}`)
                .send(newUserData)
                .expect(201);

            expect(createUserResponse.body.user.email).toBe(newUserData.email);

            const createdUserId = createUserResponse.body.user.id;

            // Update user
            const updateUserResponse = await request(app)
                .put(`/api/admin/users/${createdUserId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    firstName: 'Updated Admin',
                    isActive: false
                })
                .expect(200);

            expect(updateUserResponse.body.user.firstName).toBe('Updated Admin');

            // Get roles
            const rolesResponse = await request(app)
                .get('/api/admin/roles')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(rolesResponse.body.roles).toBeDefined();
            expect(rolesResponse.body.roles.length).toBeGreaterThan(0);
        });

        test('property owner cannot access super admin functions', async () => {
            const propertyOwner = await TestDataHelper.createUser({
                roleName: 'property_owner'
            });

            const token = await request(app)
                .post('/api/auth/login')
                .send({
                    email: propertyOwner.email,
                    password: propertyOwner.plainPassword
                })
                .then(res => res.body.token);

            // Try to delete user (super admin only)
            const deleteResponse = await request(app)
                .delete('/api/admin/users/some-user-id')
                .set('Authorization', `Bearer ${token}`)
                .expect(403);

            expect(deleteResponse.body.error).toBe('Forbidden');
        });
    });

    describe('Authorization Edge Cases', () => {
        test('should handle expired tokens', async () => {
            // This would require mocking JWT to create an expired token
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer expired.token.here')
                .expect(401);

            expect(response.body.error).toBe('Access denied');
        });

        test('should handle malformed authorization headers', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', 'NotBearer token')
                .expect(401);

            expect(response.body.message).toContain('No token provided');
        });

        test('should handle missing authorization headers', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .expect(401);

            expect(response.body.error).toBe('Access denied');
        });

        test('should handle requests to non-existent endpoints', async () => {
            const response = await request(app)
                .get('/api/nonexistent')
                .expect(404);

            expect(response.status).toBe(404);
        });
    });

    describe('Data Validation', () => {
        test('should validate email formats in registration', async () => {
            const invalidEmails = [
                'notanemail',
                '@domain.com',
                'user@',
                'user.domain.com',
                ''
            ];

            for (const email of invalidEmails) {
                const response = await request(app)
                    .post('/api/auth/register')
                    .send({
                        firstName: 'Test',
                        lastName: 'User',
                        email,
                        password: 'testpassword123'
                    });

                expect(response.status).toBe(400);
                expect(response.body.error).toBe('Validation error');
            }
        });

        test('should validate password strength requirements', async () => {
            const weakPasswords = [
                '123',
                'pass',
                '1234567', // 7 chars, need 8
                ''
            ];

            for (const password of weakPasswords) {
                const response = await request(app)
                    .post('/api/auth/register')
                    .send({
                        firstName: 'Test',
                        lastName: 'User',
                        email: `test.${Date.now()}.${Math.random()}@example.com`,
                        password
                    });

                expect(response.status).toBe(400);
                expect(response.body.message).toContain('Password must be at least 8 characters long');
            }
        });

        test('should validate required fields in property creation', async () => {
            const propertyOwner = await TestDataHelper.createUser({
                roleName: 'property_owner'
            });

            const token = await request(app)
                .post('/api/auth/login')
                .send({
                    email: propertyOwner.email,
                    password: propertyOwner.plainPassword
                })
                .then(res => res.body.token);

            // Missing required fields
            const response = await request(app)
                .post('/api/properties')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    address: '123 Street'
                    // Missing name
                });

            expect(response.status).toBe(400);
        });
    });
});