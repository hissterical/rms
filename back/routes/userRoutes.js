import express from 'express';
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
} from '../controllers/authController.js';
import { authenticate, requireOwnership } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public authentication routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes - require authentication
router.use(authenticate); // All routes below require authentication

router.post('/logout', logout);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);
router.get('/properties', getUserProperties);

export default router;