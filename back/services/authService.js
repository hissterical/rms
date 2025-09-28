import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

class AuthService {
    // Generate JWT token
    static generateToken(payload) {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }

    // Generate refresh token
    static generateRefreshToken(payload) {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
    }

    // Verify JWT token
    static verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    // Hash password
    static async hashPassword(password) {
        const saltRounds = 12;
        return await bcrypt.hash(password, saltRounds);
    }

    // Compare password
    static async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Get user with role and permissions
    static async getUserWithPermissions(userId) {
        const query = `
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, u.is_active, u.last_login,
        r.name as role_name, r.display_name as role_display_name,
        json_agg(
          json_build_object(
            'resource', p.resource,
            'action', p.action,
            'description', p.description
          )
        ) as permissions,
        array_agg(DISTINCT up.property_id) FILTER (WHERE up.property_id IS NOT NULL) as managed_properties
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      LEFT JOIN user_properties up ON u.id = up.user_id
      WHERE u.id = $1 AND u.is_active = true
      GROUP BY u.id, r.name, r.display_name
    `;

        const result = await pool.query(query, [userId]);
        return result.rows[0] || null;
    }

    // Authenticate user
    static async authenticateUser(email, password) {
        const query = 'SELECT id, password_hash, is_active FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            throw new Error('User not found');
        }

        const user = result.rows[0];

        if (!user.is_active) {
            throw new Error('Account is deactivated');
        }

        const isPasswordValid = await this.comparePassword(password, user.password_hash);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        // Update last login
        await pool.query(
            'UPDATE users SET last_login = NOW() WHERE id = $1',
            [user.id]
        );

        return await this.getUserWithPermissions(user.id);
    }

    // Create new user
    static async createUser(userData) {
        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            roleId,
            isActive = true,
            emailVerified = false
        } = userData;

        // Check if user already exists
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            throw new Error('User with this email already exists');
        }

        const hashedPassword = await this.hashPassword(password);
        const userId = uuidv4();

        const query = `
      INSERT INTO users (
        id, first_name, last_name, email, phone, password_hash, 
        role_id, is_active, email_verified, created_at, updated_at
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) 
      RETURNING id
    `;

        const values = [
            userId,
            firstName,
            lastName,
            email,
            phone,
            hashedPassword,
            roleId,
            isActive,
            emailVerified
        ];

        const result = await pool.query(query, values);
        return await this.getUserWithPermissions(result.rows[0].id);
    }

    // Generate password reset token
    static async generatePasswordResetToken(email) {
        const user = await pool.query('SELECT id FROM users WHERE email = $1 AND is_active = true', [email]);

        if (user.rows.length === 0) {
            throw new Error('User not found');
        }

        const resetToken = uuidv4();
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

        await pool.query(
            'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
            [resetToken, resetTokenExpires, user.rows[0].id]
        );

        return resetToken;
    }

    // Reset password using token
    static async resetPassword(resetToken, newPassword) {
        const user = await pool.query(
            'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW() AND is_active = true',
            [resetToken]
        );

        if (user.rows.length === 0) {
            throw new Error('Invalid or expired reset token');
        }

        const hashedPassword = await this.hashPassword(newPassword);

        await pool.query(
            'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
            [hashedPassword, user.rows[0].id]
        );

        return true;
    }

    // Change password for authenticated user
    static async changePassword(userId, currentPassword, newPassword) {
        const user = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);

        if (user.rows.length === 0) {
            throw new Error('User not found');
        }

        const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.rows[0].password_hash);
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        const hashedNewPassword = await this.hashPassword(newPassword);
        await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hashedNewPassword, userId]);

        return true;
    }

    // Check if user has specific permission
    static async hasPermission(userId, resource, action) {
        const query = `
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      JOIN role_permissions rp ON r.id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = $1 AND p.resource = $2 AND p.action = $3 AND u.is_active = true
    `;

        const result = await pool.query(query, [userId, resource, action]);
        return result.rows.length > 0;
    }

    // Check if user can access specific property
    static async canAccessProperty(userId, propertyId) {
        // Super admin can access all properties
        const superAdminQuery = `
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1 AND r.name = 'super_admin' AND u.is_active = true
    `;

        const superAdminResult = await pool.query(superAdminQuery, [userId]);
        if (superAdminResult.rows.length > 0) {
            return true;
        }

        // Check if user has direct access to the property
        const propertyAccessQuery = `
      SELECT 1 FROM user_properties up
      JOIN users u ON up.user_id = u.id
      WHERE up.user_id = $1 AND up.property_id = $2 AND u.is_active = true
    `;

        const propertyAccessResult = await pool.query(propertyAccessQuery, [userId, propertyId]);
        return propertyAccessResult.rows.length > 0;
    }

    // Get user's accessible properties
    static async getUserProperties(userId) {
        // Check if super admin
        const superAdminQuery = `
      SELECT r.name FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1 AND r.name = 'super_admin' AND u.is_active = true
    `;

        const superAdminResult = await pool.query(superAdminQuery, [userId]);

        if (superAdminResult.rows.length > 0) {
            // Super admin can access all properties
            const allPropertiesQuery = 'SELECT id, name, address FROM properties ORDER BY name';
            const result = await pool.query(allPropertiesQuery);
            return result.rows;
        }

        // Get user's specific properties
        const userPropertiesQuery = `
      SELECT p.id, p.name, p.address, up.role_type
      FROM properties p
      JOIN user_properties up ON p.id = up.property_id
      JOIN users u ON up.user_id = u.id
      WHERE up.user_id = $1 AND u.is_active = true
      ORDER BY p.name
    `;

        const result = await pool.query(userPropertiesQuery, [userId]);
        return result.rows;
    }
}

export default AuthService;