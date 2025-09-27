const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../setup/db");

// JWT Secret (in production, this should be in environment variables)
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware to verify JWT token
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      "SELECT ra.*, r.name as restaurant_name FROM restaurant_admins ra JOIN restaurants r ON ra.restaurant_id = r.id WHERE ra.id = $1",
      [decoded.adminId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.admin = result.rows[0];
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find admin by email
    const result = await pool.query(
      "SELECT ra.*, r.name as restaurant_name FROM restaurant_admins ra JOIN restaurants r ON ra.restaurant_id = r.id WHERE ra.email = $1",
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const admin = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        adminId: admin.id,
        restaurantId: admin.restaurant_id,
        email: admin.email,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        restaurant_id: admin.restaurant_id,
        restaurant_name: admin.restaurant_name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get current admin profile
router.get("/profile", authenticateAdmin, async (req, res) => {
  res.json({
    admin: {
      id: req.admin.id,
      email: req.admin.email,
      restaurant_id: req.admin.restaurant_id,
      restaurant_name: req.admin.restaurant_name,
    },
  });
});

// Change password
router.put("/change-password", authenticateAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters long" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      req.admin.password
    );
    if (!isValidPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await pool.query(
      "UPDATE restaurant_admins SET password = $1 WHERE id = $2",
      [hashedPassword, req.admin.id]
    );

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = { router, authenticateAdmin };
