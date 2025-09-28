import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    assignUserToProperty,
    removeUserFromProperty,
    getAllRoles,
    getSystemStats
} from '../controllers/adminController.js';
import {
    authenticate,
    authorize,
    requireRole
} from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication
router.use(authenticate);

// System statistics (super admin and property owners)
router.get('/stats',
    requireRole('super_admin', 'property_owner'),
    getSystemStats
);

// Role management
router.get('/roles',
    requireRole('super_admin', 'property_owner', 'hotel_manager'),
    getAllRoles
);

// User management routes
router.get('/users',
    requireRole('super_admin', 'property_owner'),
    authorize('users', 'read'),
    getAllUsers
);

router.get('/users/:userId',
    requireRole('super_admin', 'property_owner'),
    authorize('users', 'read'),
    getUserById
);

router.post('/users',
    requireRole('super_admin', 'property_owner'),
    authorize('users', 'create'),
    createUser
);

router.put('/users/:userId',
    requireRole('super_admin', 'property_owner'),
    authorize('users', 'update'),
    updateUser
);

router.delete('/users/:userId',
    requireRole('super_admin'),
    authorize('users', 'delete'),
    deleteUser
);

// Property assignment routes
router.post('/users/:userId/properties',
    requireRole('super_admin', 'property_owner'),
    authorize('properties', 'manage_staff'),
    assignUserToProperty
);

router.delete('/users/:userId/properties/:propertyId',
    requireRole('super_admin', 'property_owner'),
    authorize('properties', 'manage_staff'),
    removeUserFromProperty
);

export default router;