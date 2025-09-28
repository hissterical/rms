import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import pool from "./config/db.js";

// Import routes
import userRoutes from "./routes/userRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import roomTypeRoutes from "./routes/roomType.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

// Import middleware
import { rateLimitByRole } from "./middleware/authMiddleware.js";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting by user role
app.use(rateLimitByRole());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Hotel Management System API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', bookingRoutes); // Booking routes include /api/bookings and /api/properties/:id/bookings

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message
  });
});

// Start server
app.listen(port, () => {
  console.log(`🏨 HMS server running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/health`);
  console.log('🔐 RBAC system enabled with JWT authentication');
});
