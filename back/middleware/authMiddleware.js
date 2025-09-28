import AuthService from '../services/authService.js';

// Authentication middleware - verifies JWT token
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Access denied',
                message: 'No token provided or invalid token format'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const decoded = AuthService.verifyToken(token);

        // Get user with full permissions
        const user = await AuthService.getUserWithPermissions(decoded.userId);

        if (!user || !user.is_active) {
            return res.status(401).json({
                error: 'Access denied',
                message: 'User not found or account deactivated'
            });
        }

        // Add user data to request object
        req.user = user;
        req.userId = user.id;

        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Access denied',
            message: error.message || 'Invalid token'
        });
    }
};

// Authorization middleware - checks if user has required permission
export const authorize = (resource, action) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
            }

            // Super admin has all permissions
            if (req.user.role_name === 'super_admin') {
                return next();
            }

            // Check if user has the required permission
            const hasPermission = req.user.permissions?.some(
                permission => permission.resource === resource && permission.action === action
            );

            if (!hasPermission) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: `Insufficient permissions. Required: ${resource}:${action}`
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                error: 'Authorization error',
                message: error.message
            });
        }
    };
};

// Property access middleware - checks if user can access specific property
export const authorizePropertyAccess = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required'
            });
        }

        const propertyId = req.params.propertyId;

        if (!propertyId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Property ID is required'
            });
        }

        // Super admin can access all properties
        if (req.user.role_name === 'super_admin') {
            return next();
        }

        // Check if user has access to this specific property
        const canAccess = await AuthService.canAccessProperty(req.userId, propertyId);

        if (!canAccess) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Access denied to this property'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            error: 'Authorization error',
            message: error.message
        });
    }
};

// Role-based middleware - checks if user has one of the required roles
export const requireRole = (...roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
            }

            const userRole = req.user.role_name;

            if (!roles.includes(userRole)) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: `Access denied. Required roles: ${roles.join(', ')}`
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                error: 'Authorization error',
                message: error.message
            });
        }
    };
};

// Owner-only access middleware - ensures user owns the resource
export const requireOwnership = (resourceIdParam = 'id') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
            }

            const resourceId = req.params[resourceIdParam];
            const userId = req.userId;

            // Super admin can access anything
            if (req.user.role_name === 'super_admin') {
                return next();
            }

            // For user profile access - users can only access their own profile
            if (resourceIdParam === 'userId' || resourceIdParam === 'id') {
                if (resourceId !== userId) {
                    return res.status(403).json({
                        error: 'Forbidden',
                        message: 'Can only access your own resources'
                    });
                }
            }

            next();
        } catch (error) {
            return res.status(500).json({
                error: 'Authorization error',
                message: error.message
            });
        }
    };
};

// Optional authentication - allows both authenticated and unauthenticated requests
export const optionalAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided, continue without authentication
            req.user = null;
            req.userId = null;
            return next();
        }

        const token = authHeader.substring(7);
        const decoded = AuthService.verifyToken(token);

        const user = await AuthService.getUserWithPermissions(decoded.userId);

        if (user && user.is_active) {
            req.user = user;
            req.userId = user.id;
        } else {
            req.user = null;
            req.userId = null;
        }

        next();
    } catch (error) {
        // Invalid token, but continue without authentication
        req.user = null;
        req.userId = null;
        next();
    }
};

// Rate limiting by role (optional enhancement)
export const rateLimitByRole = (limits = {}) => {
    const defaultLimits = {
        guest: 100,
        front_desk: 500,
        housekeeping: 200,
        hotel_manager: 1000,
        property_owner: 1500,
        super_admin: 5000
    };

    const finalLimits = { ...defaultLimits, ...limits };

    return (req, res, next) => {
        const userRole = req.user?.role_name || 'guest';
        const userLimit = finalLimits[userRole] || finalLimits.guest;

        // Add rate limit info to response headers
        res.set('X-RateLimit-Role', userRole);
        res.set('X-RateLimit-Limit', userLimit);

        // Here you would implement actual rate limiting logic
        // For now, we'll just pass through
        next();
    };
};

export default {
    authenticate,
    authorize,
    authorizePropertyAccess,
    requireRole,
    requireOwnership,
    optionalAuthenticate,
    rateLimitByRole
};