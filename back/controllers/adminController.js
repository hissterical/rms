import pool from '../config/db.js';
import AuthService from '../services/authService.js';

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, search } = req.query;
        const offset = (page - 1) * limit;

        let query = `
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, 
        u.is_active, u.email_verified, u.created_at, u.last_login,
        r.name as role_name, r.display_name as role_display_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE 1=1
    `;

        const queryParams = [];
        let paramCount = 0;

        if (role) {
            paramCount++;
            query += ` AND r.name = $${paramCount}`;
            queryParams.push(role);
        }

        if (search) {
            paramCount++;
            query += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
        }

        query += ` ORDER BY u.created_at DESC`;

        paramCount++;
        query += ` LIMIT $${paramCount}`;
        queryParams.push(limit);

        paramCount++;
        query += ` OFFSET $${paramCount}`;
        queryParams.push(offset);

        const result = await pool.query(query, queryParams);

        // Get total count for pagination
        let countQuery = `
      SELECT COUNT(*) FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE 1=1
    `;

        const countParams = [];
        let countParamCount = 0;

        if (role) {
            countParamCount++;
            countQuery += ` AND r.name = $${countParamCount}`;
            countParams.push(role);
        }

        if (search) {
            countParamCount++;
            countQuery += ` AND (u.first_name ILIKE $${countParamCount} OR u.last_name ILIKE $${countParamCount} OR u.email ILIKE $${countParamCount})`;
            countParams.push(`%${search}%`);
        }

        const countResult = await pool.query(countQuery, countParams);
        const totalUsers = parseInt(countResult.rows[0].count);

        res.json({
            users: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalUsers,
                totalPages: Math.ceil(totalUsers / limit)
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Unable to retrieve users'
        });
    }
};

// Get user by ID (admin only)
export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await AuthService.getUserWithPermissions(userId);

        if (!user) {
            return res.status(404).json({
                error: 'Not found',
                message: 'User not found'
            });
        }

        // Get user's properties
        const properties = await AuthService.getUserProperties(userId);

        res.json({
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                phone: user.phone,
                role: user.role_display_name,
                roleName: user.role_name,
                isActive: user.is_active,
                emailVerified: user.email_verified,
                lastLogin: user.last_login,
                permissions: user.permissions,
                properties
            }
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Unable to retrieve user'
        });
    }
};

// Create new user (admin only)
export const createUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            roleName,
            isActive = true,
            propertyIds = []
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !roleName) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'First name, last name, email, password, and role are required'
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
            isActive,
            emailVerified: true // Admin-created users are pre-verified
        });

        // Assign properties if specified
        if (propertyIds.length > 0) {
            for (const propertyId of propertyIds) {
                await pool.query(
                    'INSERT INTO user_properties (user_id, property_id, role_type) VALUES ($1, $2, $3)',
                    [user.id, propertyId, 'staff']
                );
            }
        }

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                phone: user.phone,
                role: user.role_display_name,
                isActive: user.is_active
            }
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(400).json({
            error: 'User creation failed',
            message: error.message
        });
    }
};

// Update user (admin only)
export const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            firstName,
            lastName,
            phone,
            roleName,
            isActive,
            emailVerified
        } = req.body;

        // Start transaction
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Update basic user info
            const updateFields = [];
            const updateValues = [];
            let paramCount = 0;

            if (firstName !== undefined) {
                paramCount++;
                updateFields.push(`first_name = $${paramCount}`);
                updateValues.push(firstName);
            }

            if (lastName !== undefined) {
                paramCount++;
                updateFields.push(`last_name = $${paramCount}`);
                updateValues.push(lastName);
            }

            if (phone !== undefined) {
                paramCount++;
                updateFields.push(`phone = $${paramCount}`);
                updateValues.push(phone);
            }

            if (isActive !== undefined) {
                paramCount++;
                updateFields.push(`is_active = $${paramCount}`);
                updateValues.push(isActive);
            }

            if (emailVerified !== undefined) {
                paramCount++;
                updateFields.push(`email_verified = $${paramCount}`);
                updateValues.push(emailVerified);
            }

            // Update role if specified
            if (roleName) {
                const roleResult = await client.query('SELECT id FROM roles WHERE name = $1', [roleName]);
                if (roleResult.rows.length === 0) {
                    throw new Error('Invalid role specified');
                }
                paramCount++;
                updateFields.push(`role_id = $${paramCount}`);
                updateValues.push(roleResult.rows[0].id);
            }

            if (updateFields.length > 0) {
                paramCount++;
                updateFields.push(`updated_at = NOW()`);
                updateValues.push(userId);

                const updateQuery = `
          UPDATE users 
          SET ${updateFields.join(', ')} 
          WHERE id = $${paramCount}
          RETURNING id
        `;

                const result = await client.query(updateQuery, updateValues);

                if (result.rows.length === 0) {
                    throw new Error('User not found');
                }
            }

            await client.query('COMMIT');

            // Get updated user data
            const updatedUser = await AuthService.getUserWithPermissions(userId);

            res.json({
                message: 'User updated successfully',
                user: {
                    id: updatedUser.id,
                    firstName: updatedUser.first_name,
                    lastName: updatedUser.last_name,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    role: updatedUser.role_display_name,
                    isActive: updatedUser.is_active,
                    emailVerified: updatedUser.email_verified
                }
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Update user error:', error);
        res.status(400).json({
            error: 'User update failed',
            message: error.message
        });
    }
};

// Delete/deactivate user (admin only)
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { permanent = false } = req.query;

        if (permanent === 'true') {
            // Permanent deletion - use with caution
            const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'User not found'
                });
            }

            res.json({
                message: 'User permanently deleted'
            });
        } else {
            // Soft delete - deactivate user
            const result = await pool.query(
                'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id',
                [userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'User not found'
                });
            }

            res.json({
                message: 'User deactivated successfully'
            });
        }
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Unable to delete user'
        });
    }
};

// Assign user to property
export const assignUserToProperty = async (req, res) => {
    try {
        const { userId } = req.params;
        const { propertyId, roleType = 'staff' } = req.body;

        if (!propertyId) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Property ID is required'
            });
        }

        // Check if assignment already exists
        const existingAssignment = await pool.query(
            'SELECT id FROM user_properties WHERE user_id = $1 AND property_id = $2',
            [userId, propertyId]
        );

        if (existingAssignment.rows.length > 0) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'User is already assigned to this property'
            });
        }

        // Create assignment
        await pool.query(
            'INSERT INTO user_properties (user_id, property_id, role_type) VALUES ($1, $2, $3)',
            [userId, propertyId, roleType]
        );

        res.json({
            message: 'User assigned to property successfully'
        });
    } catch (error) {
        console.error('Assign user to property error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Unable to assign user to property'
        });
    }
};

// Remove user from property
export const removeUserFromProperty = async (req, res) => {
    try {
        const { userId, propertyId } = req.params;

        const result = await pool.query(
            'DELETE FROM user_properties WHERE user_id = $1 AND property_id = $2 RETURNING id',
            [userId, propertyId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'User assignment not found'
            });
        }

        res.json({
            message: 'User removed from property successfully'
        });
    } catch (error) {
        console.error('Remove user from property error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Unable to remove user from property'
        });
    }
};

// Get all roles
export const getAllRoles = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, display_name, description FROM roles ORDER BY name'
        );

        res.json({
            roles: result.rows
        });
    } catch (error) {
        console.error('Get all roles error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Unable to retrieve roles'
        });
    }
};

// Get system statistics (admin dashboard)
export const getSystemStats = async (req, res) => {
    try {
        // Get user counts by role
        const userStats = await pool.query(`
      SELECT r.display_name, COUNT(u.id) as count
      FROM roles r
      LEFT JOIN users u ON r.id = u.role_id AND u.is_active = true
      GROUP BY r.id, r.display_name
      ORDER BY r.display_name
    `);

        // Get property count
        const propertyStats = await pool.query('SELECT COUNT(*) as count FROM properties');

        // Get room count
        const roomStats = await pool.query('SELECT COUNT(*) as count FROM rooms');

        // Get booking count (if bookings table exists)
        let bookingStats = { rows: [{ count: 0 }] };
        try {
            bookingStats = await pool.query('SELECT COUNT(*) as count FROM bookings');
        } catch (error) {
            // Bookings table might not exist yet
        }

        // Get active users in last 30 days
        const activeUsersStats = await pool.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE last_login > NOW() - INTERVAL '30 days' AND is_active = true
    `);

        res.json({
            stats: {
                users: {
                    total: userStats.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
                    byRole: userStats.rows
                },
                properties: parseInt(propertyStats.rows[0].count),
                rooms: parseInt(roomStats.rows[0].count),
                bookings: parseInt(bookingStats.rows[0].count),
                activeUsers30Days: parseInt(activeUsersStats.rows[0].count)
            }
        });
    } catch (error) {
        console.error('Get system stats error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Unable to retrieve system statistics'
        });
    }
};