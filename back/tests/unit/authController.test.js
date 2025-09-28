import {
    register,
    login,
    refreshToken,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    logout,
    getUserProperties
} from '../../controllers/authController.js';
import { TestDataHelper } from '../helpers/testDataHelper.js';
import AuthService from '../../services/authService.js';

// Mock request and response objects
const mockRequest = (body = {}, params = {}, user = null, userId = null) => ({
    body,
    params,
    user,
    userId
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Auth Controller', () => {
    beforeEach(async () => {
        await TestDataHelper.ensureRolesExist();
    });

    describe('register', () => {
        test('should register new user successfully', async () => {
            const req = mockRequest({
                firstName: 'Test',
                lastName: 'User',
                email: `register.${Date.now()}@example.com`,
                phone: '+1234567890',
                password: 'testpassword123',
                roleName: 'guest'
            });
            const res = mockResponse();

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'User registered successfully',
                    user: expect.objectContaining({
                        firstName: 'Test',
                        lastName: 'User',
                        email: req.body.email
                    }),
                    token: expect.any(String),
                    refreshToken: expect.any(String)
                })
            );
        });

        test('should return validation error for missing fields', async () => {
            const req = mockRequest({
                firstName: 'Test'
                // Missing required fields
            });
            const res = mockResponse();

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Validation error',
                    message: expect.stringContaining('required')
                })
            );
        });

        test('should return validation error for invalid email', async () => {
            const req = mockRequest({
                firstName: 'Test',
                lastName: 'User',
                email: 'invalid-email',
                password: 'testpassword123'
            });
            const res = mockResponse();

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Validation error',
                    message: 'Invalid email format'
                })
            );
        });

        test('should return validation error for weak password', async () => {
            const req = mockRequest({
                firstName: 'Test',
                lastName: 'User',
                email: `weak.${Date.now()}@example.com`,
                password: '123' // Too short
            });
            const res = mockResponse();

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Validation error',
                    message: 'Password must be at least 8 characters long'
                })
            );
        });

        test('should return error for duplicate email', async () => {
            const email = `duplicate.${Date.now()}@example.com`;

            // Create first user
            await TestDataHelper.createUser({ email });

            // Try to register with same email
            const req = mockRequest({
                firstName: 'Test',
                lastName: 'User',
                email,
                password: 'testpassword123'
            });
            const res = mockResponse();

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Registration failed',
                    message: expect.stringContaining('already exists')
                })
            );
        });
    });

    describe('login', () => {
        test('should login user with correct credentials', async () => {
            const user = await TestDataHelper.createUser({
                email: `login.${Date.now()}@example.com`,
                password: 'testpassword123'
            });

            const req = mockRequest({
                email: user.email,
                password: user.plainPassword
            });
            const res = mockResponse();

            await login(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Login successful',
                    user: expect.objectContaining({
                        id: user.id,
                        email: user.email
                    }),
                    token: expect.any(String),
                    refreshToken: expect.any(String)
                })
            );
        });

        test('should return validation error for missing fields', async () => {
            const req = mockRequest({
                email: 'test@example.com'
                // Missing password
            });
            const res = mockResponse();

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Validation error',
                    message: 'Email and password are required'
                })
            );
        });

        test('should return error for incorrect credentials', async () => {
            const user = await TestDataHelper.createUser({
                email: `wrong.${Date.now()}@example.com`,
                password: 'correctpassword'
            });

            const req = mockRequest({
                email: user.email,
                password: 'wrongpassword'
            });
            const res = mockResponse();

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Authentication failed'
                })
            );
        });
    });

    describe('refreshToken', () => {
        test('should refresh tokens successfully', async () => {
            const user = await TestDataHelper.createUser();
            const refreshTokenValue = AuthService.generateRefreshToken({ userId: user.id });

            const req = mockRequest({
                refreshToken: refreshTokenValue
            });
            const res = mockResponse();

            await refreshToken(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Tokens refreshed successfully',
                    token: expect.any(String),
                    refreshToken: expect.any(String)
                })
            );
        });

        test('should return error for missing refresh token', async () => {
            const req = mockRequest({});
            const res = mockResponse();

            await refreshToken(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Validation error',
                    message: 'Refresh token is required'
                })
            );
        });

        test('should return error for invalid refresh token', async () => {
            const req = mockRequest({
                refreshToken: 'invalid-token'
            });
            const res = mockResponse();

            await refreshToken(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Token refresh failed'
                })
            );
        });
    });

    describe('getProfile', () => {
        test('should return user profile', async () => {
            const user = await TestDataHelper.createUser();
            const userWithPermissions = await AuthService.getUserWithPermissions(user.id);

            const req = mockRequest({}, {}, userWithPermissions, user.id);
            const res = mockResponse();

            await getProfile(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: expect.objectContaining({
                        id: user.id,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        email: user.email
                    })
                })
            );
        });
    });

    describe('updateProfile', () => {
        test('should update user profile successfully', async () => {
            const user = await TestDataHelper.createUser();

            const req = mockRequest({
                firstName: 'Updated',
                lastName: 'Name',
                phone: '+9876543210'
            }, {}, null, user.id);
            const res = mockResponse();

            await updateProfile(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Profile updated successfully',
                    user: expect.objectContaining({
                        firstName: 'Updated',
                        lastName: 'Name'
                    })
                })
            );
        });

        test('should return validation error for missing required fields', async () => {
            const user = await TestDataHelper.createUser();

            const req = mockRequest({
                phone: '+9876543210'
                // Missing firstName and lastName
            }, {}, null, user.id);
            const res = mockResponse();

            await updateProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Validation error',
                    message: 'First name and last name are required'
                })
            );
        });
    });

    describe('changePassword', () => {
        test('should change password successfully', async () => {
            const user = await TestDataHelper.createUser({
                password: 'currentpassword123'
            });

            const req = mockRequest({
                currentPassword: user.plainPassword,
                newPassword: 'newpassword456'
            }, {}, null, user.id);
            const res = mockResponse();

            await changePassword(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Password changed successfully'
                })
            );
        });

        test('should return validation error for missing fields', async () => {
            const user = await TestDataHelper.createUser();

            const req = mockRequest({
                currentPassword: 'password123'
                // Missing newPassword
            }, {}, null, user.id);
            const res = mockResponse();

            await changePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Validation error',
                    message: 'Current password and new password are required'
                })
            );
        });

        test('should return error for weak new password', async () => {
            const user = await TestDataHelper.createUser();

            const req = mockRequest({
                currentPassword: 'currentpass',
                newPassword: '123' // Too short
            }, {}, null, user.id);
            const res = mockResponse();

            await changePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Validation error',
                    message: 'New password must be at least 8 characters long'
                })
            );
        });
    });

    describe('forgotPassword', () => {
        test('should generate reset token for valid email', async () => {
            const user = await TestDataHelper.createUser({
                email: `forgot.${Date.now()}@example.com`
            });

            const req = mockRequest({
                email: user.email
            });
            const res = mockResponse();

            await forgotPassword(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Password reset token generated successfully',
                    resetToken: expect.any(String)
                })
            );
        });

        test('should return validation error for missing email', async () => {
            const req = mockRequest({});
            const res = mockResponse();

            await forgotPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Validation error',
                    message: 'Email is required'
                })
            );
        });

        test('should return success message even for non-existent email (security)', async () => {
            const req = mockRequest({
                email: 'nonexistent@example.com'
            });
            const res = mockResponse();

            await forgotPassword(req, res);

            // Should return success message for security (don't reveal if email exists)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'If the email exists, a password reset token has been sent'
                })
            );
        });
    });

    describe('resetPassword', () => {
        test('should reset password with valid token', async () => {
            const user = await TestDataHelper.createUser({
                email: `reset.${Date.now()}@example.com`
            });
            const resetToken = await AuthService.generatePasswordResetToken(user.email);

            const req = mockRequest({
                resetToken,
                newPassword: 'newpassword123'
            });
            const res = mockResponse();

            await resetPassword(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Password reset successfully'
                })
            );
        });

        test('should return validation error for missing fields', async () => {
            const req = mockRequest({
                resetToken: 'some-token'
                // Missing newPassword
            });
            const res = mockResponse();

            await resetPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Validation error',
                    message: 'Reset token and new password are required'
                })
            );
        });

        test('should return error for invalid reset token', async () => {
            const req = mockRequest({
                resetToken: 'invalid-token',
                newPassword: 'newpassword123'
            });
            const res = mockResponse();

            await resetPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Password reset failed'
                })
            );
        });
    });

    describe('logout', () => {
        test('should logout successfully', async () => {
            const req = mockRequest();
            const res = mockResponse();

            await logout(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Logout successful'
                })
            );
        });
    });

    describe('getUserProperties', () => {
        test('should return user properties', async () => {
            const scenario = await TestDataHelper.createTestScenario();

            const req = mockRequest({}, {}, null, scenario.users.propertyOwner.id);
            const res = mockResponse();

            await getUserProperties(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    properties: expect.arrayContaining([
                        expect.objectContaining({
                            id: scenario.property.id
                        })
                    ])
                })
            );
        });

        test('should return empty array for user with no properties', async () => {
            const user = await TestDataHelper.createUser({
                roleName: 'guest'
            });

            const req = mockRequest({}, {}, null, user.id);
            const res = mockResponse();

            await getUserProperties(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    properties: []
                })
            );
        });
    });
});