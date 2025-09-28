import express from 'express';
import request from 'supertest';
import {
    authenticate,
    authorize,
    authorizePropertyAccess,
    requireRole,
    requireOwnership,
    optionalAuthenticate
} from '../../middleware/authMiddleware.js';
import { TestDataHelper, JWTTestHelper } from '../helpers/testDataHelper.js';

describe('Auth Middleware', () => {
    let app;
    let testScenario;
    let tokens;

    beforeEach(async () => {
        app = express();
        app.use(express.json());

        testScenario = await TestDataHelper.createTestScenario();
        tokens = await JWTTestHelper.generateTokensForScenario(testScenario);
    });

    describe('authenticate middleware', () => {
        test('should authenticate user with valid token', async () => {
            app.get('/test', authenticate, (req, res) => {
                res.json({
                    authenticated: true,
                    userId: req.userId,
                    userRole: req.user.role_name
                });
            });

            const response = await request(app)
                .get('/test')
                .set('Authorization', `Bearer ${tokens.guest}`)
                .expect(200);

            expect(response.body.authenticated).toBe(true);
            expect(response.body.userId).toBe(testScenario.users.guest.id);
            expect(response.body.userRole).toBe('guest');
        });

        test('should reject request without token', async () => {
            app.get('/test', authenticate, (req, res) => {
                res.json({ authenticated: true });
            });

            const response = await request(app)
                .get('/test')
                .expect(401);

            expect(response.body.error).toBe('Access denied');
            expect(response.body.message).toContain('No token provided');
        });

        test('should reject request with invalid token', async () => {
            app.get('/test', authenticate, (req, res) => {
                res.json({ authenticated: true });
            });

            const response = await request(app)
                .get('/test')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);

            expect(response.body.error).toBe('Access denied');
        });

        test('should reject request with malformed authorization header', async () => {
            app.get('/test', authenticate, (req, res) => {
                res.json({ authenticated: true });
            });

            const response = await request(app)
                .get('/test')
                .set('Authorization', 'InvalidFormat token')
                .expect(401);

            expect(response.body.message).toContain('No token provided');
        });
    });

    describe('authorize middleware', () => {
        test('should allow access with correct permission', async () => {
            app.get('/test',
                authenticate,
                authorize('properties', 'read'),
                (req, res) => {
                    res.json({ authorized: true });
                }
            );

            // Property owner should have properties:read permission
            const response = await request(app)
                .get('/test')
                .set('Authorization', `Bearer ${tokens.propertyOwner}`)
                .expect(200);

            expect(response.body.authorized).toBe(true);
        });

        test('should deny access without correct permission', async () => {
            app.get('/test',
                authenticate,
                authorize('properties', 'delete'),
                (req, res) => {
                    res.json({ authorized: true });
                }
            );

            // Guest should not have properties:delete permission
            const response = await request(app)
                .get('/test')
                .set('Authorization', `Bearer ${tokens.guest}`)
                .expect(403);

            expect(response.body.error).toBe('Forbidden');
            expect(response.body.message).toContain('Insufficient permissions');
        });

        test('should allow super admin access to everything', async () => {
            const superAdmin = await TestDataHelper.createUser({
                roleName: 'super_admin',
                email: 'superadmin@test.com'
            });
            const superAdminToken = await JWTTestHelper.generateTokenForUser(superAdmin);

            app.get('/test',
                authenticate,
                authorize('system', 'admin'),
                (req, res) => {
                    res.json({ authorized: true });
                }
            );

            const response = await request(app)
                .get('/test')
                .set('Authorization', `Bearer ${superAdminToken}`)
                .expect(200);

            expect(response.body.authorized).toBe(true);
        });

        test('should require authentication before authorization', async () => {
            app.get('/test',
                authenticate,
                authorize('properties', 'read'),
                (req, res) => {
                    res.json({ authorized: true });
                }
            );

            const response = await request(app)
                .get('/test')
                .expect(401);

            expect(response.body.error).toBe('Access denied');
        });
    });

    describe('authorizePropertyAccess middleware', () => {
        test('should allow access to owned property', async () => {
            app.get('/test/:propertyId',
                authenticate,
                authorizePropertyAccess,
                (req, res) => {
                    res.json({ authorized: true });
                }
            );

            const response = await request(app)
                .get(`/test/${testScenario.property.id}`)
                .set('Authorization', `Bearer ${tokens.propertyOwner}`)
                .expect(200);

            expect(response.body.authorized).toBe(true);
        });

        test('should deny access to non-owned property', async () => {
            // Create another property that the user doesn't own
            const otherProperty = await TestDataHelper.createProperty({
                name: 'Other Hotel'
            });

            app.get('/test/:propertyId',
                authenticate,
                authorizePropertyAccess,
                (req, res) => {
                    res.json({ authorized: true });
                }
            );

            const response = await request(app)
                .get(`/test/${otherProperty.id}`)
                .set('Authorization', `Bearer ${tokens.guest}`)
                .expect(403);

            expect(response.body.error).toBe('Forbidden');
            expect(response.body.message).toContain('Access denied to this property');
        });

        test('should allow super admin access to any property', async () => {
            const superAdmin = await TestDataHelper.createUser({
                roleName: 'super_admin',
                email: 'superadmin2@test.com'
            });
            const superAdminToken = await JWTTestHelper.generateTokenForUser(superAdmin);

            app.get('/test/:propertyId',
                authenticate,
                authorizePropertyAccess,
                (req, res) => {
                    res.json({ authorized: true });
                }
            );

            const response = await request(app)
                .get(`/test/${testScenario.property.id}`)
                .set('Authorization', `Bearer ${superAdminToken}`)
                .expect(200);

            expect(response.body.authorized).toBe(true);
        });

        test('should require propertyId parameter', async () => {
            app.get('/test',
                authenticate,
                authorizePropertyAccess,
                (req, res) => {
                    res.json({ authorized: true });
                }
            );

            const response = await request(app)
                .get('/test')
                .set('Authorization', `Bearer ${tokens.propertyOwner}`)
                .expect(400);

            expect(response.body.error).toBe('Bad Request');
            expect(response.body.message).toContain('Property ID is required');
        });
    });

    describe('requireRole middleware', () => {
        test('should allow access with required role', async () => {
            app.get('/test',
                authenticate,
                requireRole('property_owner', 'hotel_manager'),
                (req, res) => {
                    res.json({ authorized: true });
                }
            );

            const response = await request(app)
                .get('/test')
                .set('Authorization', `Bearer ${tokens.hotelManager}`)
                .expect(200);

            expect(response.body.authorized).toBe(true);
        });

        test('should deny access without required role', async () => {
            app.get('/test',
                authenticate,
                requireRole('super_admin'),
                (req, res) => {
                    res.json({ authorized: true });
                }
            );

            const response = await request(app)
                .get('/test')
                .set('Authorization', `Bearer ${tokens.guest}`)
                .expect(403);

            expect(response.body.error).toBe('Forbidden');
            expect(response.body.message).toContain('Required roles: super_admin');
        });

        test('should allow access with multiple role options', async () => {
            app.get('/test',
                authenticate,
                requireRole('front_desk', 'hotel_manager', 'property_owner'),
                (req, res) => {
                    res.json({ authorized: true });
                }
            );

            // Test with front desk
            await request(app)
                .get('/test')
                .set('Authorization', `Bearer ${tokens.frontDeskStaff}`)
                .expect(200);

            // Test with hotel manager  
            await request(app)
                .get('/test')
                .set('Authorization', `Bearer ${tokens.hotelManager}`)
                .expect(200);

            // Test with property owner
            await request(app)
                .get('/test')
                .set('Authorization', `Bearer ${tokens.propertyOwner}`)
                .expect(200);
        });
    });

    describe('requireOwnership middleware', () => {
        test('should allow user to access their own resource', async () => {
            app.get('/test/:userId',
                authenticate,
                requireOwnership('userId'),
                (req, res) => {
                    res.json({ authorized: true });
                }
            );

            const response = await request(app)
                .get(`/test/${testScenario.users.guest.id}`)
                .set('Authorization', `Bearer ${tokens.guest}`)
                .expect(200);

            expect(response.body.authorized).toBe(true);
        });

        test('should deny user access to other users resources', async () => {
            app.get('/test/:userId',
                authenticate,
                requireOwnership('userId'),
                (req, res) => {
                    res.json({ authorized: true });
                }
            );

            const response = await request(app)
                .get(`/test/${testScenario.users.hotelManager.id}`)
                .set('Authorization', `Bearer ${tokens.guest}`)
                .expect(403);

            expect(response.body.error).toBe('Forbidden');
            expect(response.body.message).toContain('Can only access your own resources');
        });

        test('should allow super admin to access any resource', async () => {
            const superAdmin = await TestDataHelper.createUser({
                roleName: 'super_admin',
                email: 'superadmin3@test.com'
            });
            const superAdminToken = await JWTTestHelper.generateTokenForUser(superAdmin);

            app.get('/test/:userId',
                authenticate,
                requireOwnership('userId'),
                (req, res) => {
                    res.json({ authorized: true });
                }
            );

            const response = await request(app)
                .get(`/test/${testScenario.users.guest.id}`)
                .set('Authorization', `Bearer ${superAdminToken}`)
                .expect(200);

            expect(response.body.authorized).toBe(true);
        });
    });

    describe('optionalAuthenticate middleware', () => {
        test('should work with valid token', async () => {
            app.get('/test', optionalAuthenticate, (req, res) => {
                res.json({
                    hasUser: !!req.user,
                    userId: req.userId
                });
            });

            const response = await request(app)
                .get('/test')
                .set('Authorization', `Bearer ${tokens.guest}`)
                .expect(200);

            expect(response.body.hasUser).toBe(true);
            expect(response.body.userId).toBe(testScenario.users.guest.id);
        });

        test('should work without token', async () => {
            app.get('/test', optionalAuthenticate, (req, res) => {
                res.json({
                    hasUser: !!req.user,
                    userId: req.userId
                });
            });

            const response = await request(app)
                .get('/test')
                .expect(200);

            expect(response.body.hasUser).toBe(false);
            expect(response.body.userId).toBeNull();
        });

        test('should work with invalid token', async () => {
            app.get('/test', optionalAuthenticate, (req, res) => {
                res.json({
                    hasUser: !!req.user,
                    userId: req.userId
                });
            });

            const response = await request(app)
                .get('/test')
                .set('Authorization', 'Bearer invalid-token')
                .expect(200);

            expect(response.body.hasUser).toBe(false);
            expect(response.body.userId).toBeNull();
        });
    });

    describe('middleware chaining', () => {
        test('should work with multiple middleware in correct order', async () => {
            app.get('/test/:propertyId',
                authenticate,
                authorize('properties', 'read'),
                authorizePropertyAccess,
                requireRole('property_owner', 'hotel_manager'),
                (req, res) => {
                    res.json({
                        fullyAuthorized: true,
                        user: req.user.first_name
                    });
                }
            );

            const response = await request(app)
                .get(`/test/${testScenario.property.id}`)
                .set('Authorization', `Bearer ${tokens.propertyOwner}`)
                .expect(200);

            expect(response.body.fullyAuthorized).toBe(true);
            expect(response.body.user).toBe(testScenario.users.propertyOwner.first_name);
        });

        test('should fail at first middleware that denies access', async () => {
            app.get('/test/:propertyId',
                authenticate,
                requireRole('super_admin'), // This should fail first
                authorize('properties', 'read'),
                authorizePropertyAccess,
                (req, res) => {
                    res.json({ fullyAuthorized: true });
                }
            );

            const response = await request(app)
                .get(`/test/${testScenario.property.id}`)
                .set('Authorization', `Bearer ${tokens.guest}`)
                .expect(403);

            expect(response.body.error).toBe('Forbidden');
            expect(response.body.message).toContain('Required roles: super_admin');
        });
    });
});