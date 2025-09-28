import AuthService from '../services/authService.js';
import pool from '../config/db.js';

export const register = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            roleName = 'guest' // Default role
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'First name, last name, email, and password are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Invalid email format'
            });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Password must be at least 8 characters long'
            });
        }

        // Get role ID
        const roleQuery = 'SELECT id FROM roles WHERE name = $1';
        const roleResult = await pool.query(roleQuery, [roleName]);

        if (roleResult.rows.length === 0) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Invalid role specified'
            });
        }

        const roleId = roleResult.rows[0].id;

        // Create user
        const user = await AuthService.createUser({
            firstName,
            lastName,
            email,
            phone,
            password,
            roleId,
            isActive: true,
            emailVerified: false
        });

        // Generate tokens
        const token = AuthService.generateToken({ userId: user.id });
        const refreshToken = AuthService.generateRefreshToken({ userId: user.id });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                phone: user.phone,
                role: user.role_display_name,
                emailVerified: user.email_verified
            },
            token,
            refreshToken
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({
            error: 'Registration failed',
            message: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Email and password are required'
            });
        }

        // Authenticate user
        const user = await AuthService.authenticateUser(email, password);

        // Generate tokens
        const token = AuthService.generateToken({ userId: user.id });
        const refreshToken = AuthService.generateRefreshToken({ userId: user.id });

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                phone: user.phone,
                role: user.role_display_name,
                permissions: user.permissions,
                managedProperties: user.managed_properties || []
            },
            token,
            refreshToken
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({
            error: 'Authentication failed',
            message: error.message
        });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Refresh token is required'
            });
        }

        // Verify refresh token
        const decoded = AuthService.verifyToken(refreshToken);

        // Get user data
        const user = await AuthService.getUserWithPermissions(decoded.userId);

        if (!user || !user.is_active) {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Invalid refresh token or user not found'
            });
        }

        // Generate new tokens
        const newToken = AuthService.generateToken({ userId: user.id });
        const newRefreshToken = AuthService.generateRefreshToken({ userId: user.id });

        res.json({
            message: 'Tokens refreshed successfully',
            token: newToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({
            error: 'Token refresh failed',
            message: error.message
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = req.user;

        res.json({
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                phone: user.phone,
                role: user.role_display_name,
                permissions: user.permissions,
                managedProperties: user.managed_properties || [],
                emailVerified: user.email_verified,
                lastLogin: user.last_login
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Unable to retrieve profile'
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { firstName, lastName, phone } = req.body;

        // Validate input
        if (!firstName || !lastName) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'First name and last name are required'
            });
        }

        // Update user profile
        const updateQuery = `
      UPDATE users 
      SET first_name = $1, last_name = $2, phone = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING id
    `;

        const result = await pool.query(updateQuery, [firstName, lastName, phone, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'User not found'
            });
        }

        // Get updated user data
        const updatedUser = await AuthService.getUserWithPermissions(userId);

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                firstName: updatedUser.first_name,
                lastName: updatedUser.last_name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role_display_name
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Unable to update profile'
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const userId = req.userId;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'New password must be at least 8 characters long'
            });
        }

        await AuthService.changePassword(userId, currentPassword, newPassword);

        res.json({
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(400).json({
            error: 'Password change failed',
            message: error.message
        });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Email is required'
            });
        }

        const resetToken = await AuthService.generatePasswordResetToken(email);

        // In production, send this token via email
        // For now, we'll return it in the response (NOT recommended for production)
        res.json({
            message: 'Password reset token generated successfully',
            resetToken: resetToken, // Remove this in production
            instructions: 'Use this token to reset your password'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        // Don't reveal if email exists or not for security
        res.json({
            message: 'If the email exists, a password reset token has been sent'
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Reset token and new password are required'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'New password must be at least 8 characters long'
            });
        }

        await AuthService.resetPassword(resetToken, newPassword);

        res.json({
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(400).json({
            error: 'Password reset failed',
            message: error.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        // In a production system, you might want to blacklist the token
        // For now, we'll just send a success response
        res.json({
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Logout failed',
            message: 'Server error during logout'
        });
    }
};

export const getUserProperties = async (req, res) => {
    try {
        const userId = req.userId;
        const properties = await AuthService.getUserProperties(userId);

        res.json({
            properties
        });
    } catch (error) {
        console.error('Get user properties error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Unable to retrieve properties'
        });
    }
};