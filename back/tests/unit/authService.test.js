import AuthService from '../../services/authService.js';
import { TestDataHelper } from '../helpers/testDataHelper.js';
import jwt from 'jsonwebtoken';

describe('AuthService', () => {
    beforeEach(async () => {
        await TestDataHelper.ensureRolesExist();
    });

    describe('Password Management', () => {
        test('should hash password correctly', async () => {
            const password = 'testpassword123';
            const hashedPassword = await AuthService.hashPassword(password);

            expect(hashedPassword).toBeDefined();
            expect(hashedPassword).not.toBe(password);
            expect(hashedPassword.length).toBeGreaterThan(50);
        });

        test('should compare passwords correctly', async () => {
            const password = 'testpassword123';
            const hashedPassword = await AuthService.hashPassword(password);

            const isValid = await AuthService.comparePassword(password, hashedPassword);
            expect(isValid).toBe(true);

            const isInvalid = await AuthService.comparePassword('wrongpassword', hashedPassword);
            expect(isInvalid).toBe(false);
        });
    });

    describe('JWT Token Management', () => {
        test('should generate valid JWT token', () => {
            const payload = { userId: 'test-user-id' };
            const token = AuthService.generateToken(payload);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');

            // Verify token structure
            const decoded = jwt.decode(token);
            expect(decoded.userId).toBe(payload.userId);
            expect(decoded.exp).toBeDefined();
            expect(decoded.iat).toBeDefined();
        });

        test('should generate refresh token', () => {
            const payload = { userId: 'test-user-id' };
            const refreshToken = AuthService.generateRefreshToken(payload);

            expect(refreshToken).toBeDefined();
            expect(typeof refreshToken).toBe('string');

            const decoded = jwt.decode(refreshToken);
            expect(decoded.userId).toBe(payload.userId);
        });

        test('should verify valid token', () => {
            const payload = { userId: 'test-user-id' };
            const token = AuthService.generateToken(payload);

            const decoded = AuthService.verifyToken(token);
            expect(decoded.userId).toBe(payload.userId);
        });

        test('should throw error for invalid token', () => {
            expect(() => {
                AuthService.verifyToken('invalid-token');
            }).toThrow('Invalid or expired token');
        });

        test('should throw error for expired token', () => {
            // Create token with very short expiry
            const expiredToken = jwt.sign(
                { userId: 'test-user-id' },
                process.env.JWT_SECRET,
                { expiresIn: '-1s' }
            );

            expect(() => {
                AuthService.verifyToken(expiredToken);
            }).toThrow('Invalid or expired token');
        });
    });

    describe('User Management', () => {
        test('should create new user successfully', async () => {
            const roleId = await TestDataHelper.getRoleId('guest');

            const userData = {
                firstName: 'Test',
                lastName: 'User',
                email: `test.${Date.now()}@example.com`,
                phone: '+1234567890',
                password: 'testpassword123',
                roleId,
                isActive: true,
                emailVerified: false
            };

            const user = await AuthService.createUser(userData);

            expect(user).toBeDefined();
            expect(user.id).toBeDefined();
            expect(user.first_name).toBe(userData.firstName);
            expect(user.last_name).toBe(userData.lastName);
            expect(user.email).toBe(userData.email);
            expect(user.is_active).toBe(true);
        });

        test('should throw error when creating user with existing email', async () => {
            const roleId = await TestDataHelper.getRoleId('guest');
            const email = `duplicate.${Date.now()}@example.com`;

            const userData1 = {
                firstName: 'User',
                lastName: 'One',
                email,
                password: 'password123',
                roleId
            };

            const userData2 = {
                firstName: 'User',
                lastName: 'Two',
                email,
                password: 'password456',
                roleId
            };

            // Create first user
            await AuthService.createUser(userData1);

            // Try to create second user with same email
            await expect(AuthService.createUser(userData2))
                .rejects.toThrow('User with this email already exists');
        });

        test('should authenticate user with correct credentials', async () => {
            const user = await TestDataHelper.createUser({
                email: `auth.test.${Date.now()}@example.com`,
                password: 'testpassword123'
            });

            const authenticatedUser = await AuthService.authenticateUser(
                user.email,
                user.plainPassword
            );

            expect(authenticatedUser).toBeDefined();
            expect(authenticatedUser.id).toBe(user.id);
            expect(authenticatedUser.email).toBe(user.email);
            expect(authenticatedUser.permissions).toBeDefined();
        });

        test('should throw error for incorrect password', async () => {
            const user = await TestDataHelper.createUser({
                email: `auth.fail.${Date.now()}@example.com`,
                password: 'correctpassword'
            });

            await expect(
                AuthService.authenticateUser(user.email, 'wrongpassword')
            ).rejects.toThrow('Invalid password');
        });

        test('should throw error for non-existent user', async () => {
            await expect(
                AuthService.authenticateUser('nonexistent@example.com', 'anypassword')
            ).rejects.toThrow('User not found');
        });

        test('should throw error for inactive user', async () => {
            const user = await TestDataHelper.createUser({
                email: `inactive.${Date.now()}@example.com`,
                password: 'password123',
                isActive: false
            });

            await expect(
                AuthService.authenticateUser(user.email, user.plainPassword)
            ).rejects.toThrow('Account is deactivated');
        });
    });

    describe('Permission Management', () => {
        test('should check user permissions correctly', async () => {
            const superAdminUser = await TestDataHelper.createUser({
                roleName: 'super_admin'
            });

            const guestUser = await TestDataHelper.createUser({
                roleName: 'guest'
            });

            // Super admin should have all permissions
            const hasSuperAdminPermission = await AuthService.hasPermission(
                superAdminUser.id,
                'properties',
                'delete'
            );
            expect(hasSuperAdminPermission).toBe(true);

            // Guest should not have property delete permission
            const hasGuestPermission = await AuthService.hasPermission(
                guestUser.id,
                'properties',
                'delete'
            );
            expect(hasGuestPermission).toBe(false);
        });

        test('should handle property access correctly', async () => {
            const scenario = await TestDataHelper.createTestScenario();

            // Property owner should have access to their property
            const ownerAccess = await AuthService.canAccessProperty(
                scenario.users.propertyOwner.id,
                scenario.property.id
            );
            expect(ownerAccess).toBe(true);

            // Guest should not have access to any property
            const guestAccess = await AuthService.canAccessProperty(
                scenario.users.guest.id,
                scenario.property.id
            );
            expect(guestAccess).toBe(false);
        });

        test('should get user properties correctly', async () => {
            const scenario = await TestDataHelper.createTestScenario();

            // Property owner should see their properties
            const ownerProperties = await AuthService.getUserProperties(
                scenario.users.propertyOwner.id
            );
            expect(ownerProperties).toHaveLength(1);
            expect(ownerProperties[0].id).toBe(scenario.property.id);

            // Guest should see no properties
            const guestProperties = await AuthService.getUserProperties(
                scenario.users.guest.id
            );
            expect(guestProperties).toHaveLength(0);
        });
    });

    describe('Password Reset', () => {
        test('should generate password reset token', async () => {
            const user = await TestDataHelper.createUser({
                email: `reset.${Date.now()}@example.com`
            });

            const resetToken = await AuthService.generatePasswordResetToken(user.email);

            expect(resetToken).toBeDefined();
            expect(typeof resetToken).toBe('string');
            expect(resetToken.length).toBeGreaterThan(20);
        });

        test('should reset password with valid token', async () => {
            const user = await TestDataHelper.createUser({
                email: `reset.valid.${Date.now()}@example.com`,
                password: 'oldpassword123'
            });

            const resetToken = await AuthService.generatePasswordResetToken(user.email);
            const newPassword = 'newpassword456';

            const result = await AuthService.resetPassword(resetToken, newPassword);
            expect(result).toBe(true);

            // Verify old password no longer works
            await expect(
                AuthService.authenticateUser(user.email, user.plainPassword)
            ).rejects.toThrow('Invalid password');

            // Verify new password works
            const authenticatedUser = await AuthService.authenticateUser(user.email, newPassword);
            expect(authenticatedUser.id).toBe(user.id);
        });

        test('should throw error for invalid reset token', async () => {
            await expect(
                AuthService.resetPassword('invalid-token', 'newpassword123')
            ).rejects.toThrow('Invalid or expired reset token');
        });

        test('should throw error for non-existent user email in reset request', async () => {
            await expect(
                AuthService.generatePasswordResetToken('nonexistent@example.com')
            ).rejects.toThrow('User not found');
        });
    });

    describe('Change Password', () => {
        test('should change password with correct current password', async () => {
            const user = await TestDataHelper.createUser({
                password: 'currentpassword123'
            });

            const result = await AuthService.changePassword(
                user.id,
                user.plainPassword,
                'newpassword456'
            );
            expect(result).toBe(true);

            // Verify new password works
            const authenticatedUser = await AuthService.authenticateUser(
                user.email,
                'newpassword456'
            );
            expect(authenticatedUser.id).toBe(user.id);
        });

        test('should throw error for incorrect current password', async () => {
            const user = await TestDataHelper.createUser({
                password: 'currentpassword123'
            });

            await expect(
                AuthService.changePassword(user.id, 'wrongpassword', 'newpassword456')
            ).rejects.toThrow('Current password is incorrect');
        });

        test('should throw error for non-existent user', async () => {
            await expect(
                AuthService.changePassword('non-existent-id', 'any', 'new')
            ).rejects.toThrow('User not found');
        });
    });
});