const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const bcrypt = require('bcryptjs');
const { authenticateAdmin } = require('./adminAuth');

const pool = require("../setup/db");

// Register a restaurant
router.post("/create", async (req, res) => {
  const { name, email, address, tables_count, admin_password } = req.body;

  // Validate required fields
  if (!name || !email || !tables_count || !admin_password) {
    return res.status(400).json({ 
      error: "Name, email, tables count, and admin password are required" 
    });
  }

  if (admin_password.length < 6) {
    return res.status(400).json({ 
      error: "Admin password must be at least 6 characters long" 
    });
  }

  try {
    // Check if email already exists
    const existingAdmin = await pool.query(
      "SELECT id FROM restaurant_admins WHERE email = $1",
      [email.toLowerCase()]
    );

    if (existingAdmin.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Start transaction
    await pool.query('BEGIN');

    // Create restaurant
    const result = await pool.query(
      "INSERT INTO restaurants (name, contact_email, address) VALUES ($1, $2, $3) RETURNING *",
      [name, email, address]
    );
    const restaurant = result.rows[0];

    // Hash admin password
    const hashedPassword = await bcrypt.hash(admin_password, 12);

    // Create admin account
    const adminResult = await pool.query(
      "INSERT INTO restaurant_admins (restaurant_id, email, password) VALUES ($1, $2, $3) RETURNING *",
      [restaurant.id, email.toLowerCase(), hashedPassword]
    );

    // Create directory for this restaurant's QRs
    const restaurantQrDir = path.join(
      __dirname,
      "..",
      "storage",
      "qrs",
      restaurant.id
    );
    if (!fs.existsSync(restaurantQrDir)) {
      fs.mkdirSync(restaurantQrDir, { recursive: true });
    }

    // Create directory for menu images
    const menuImagesDir = path.join(
      __dirname,
      "..",
      "storage",
      "menu-images",
      restaurant.id
    );
    if (!fs.existsSync(menuImagesDir)) {
      fs.mkdirSync(menuImagesDir, { recursive: true });
    }

    const tablePromises = [];
    for (let i = 1; i <= tables_count; i++) {
      const url = `${process.env.APP_DOMAIN || "http://localhost:3000"}/menu/${restaurant.id}/${i}`;
      const qrFileName = `table_${i}.png`;
      const qrFilePath = path.join(restaurantQrDir, qrFileName);
      const qrUrlPath = `/storage/qrs/${restaurant.id}/${qrFileName}`;

      // Generate QR code and save as file
      await QRCode.toFile(qrFilePath, url, {
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      tablePromises.push(
        pool.query(
          "INSERT INTO tables (restaurant_id, table_number, qr_code_url) VALUES ($1, $2, $3)",
          [restaurant.id, i, qrUrlPath]
        )
      );
    }
    await Promise.all(tablePromises);

    // Commit transaction
    await pool.query('COMMIT');

    res.json({ 
      restaurant, 
      admin: { 
        id: adminResult.rows[0].id,
        email: adminResult.rows[0].email
      },
      message: "Restaurant registered successfully ✅" 
    });
  } catch (err) {
    // Rollback transaction
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get all restaurants
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, contact_email, address, created_at FROM restaurants ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching restaurants" });
  }
});

// Get all tables for a restaurant (admin authenticated)
router.get("/:id/tables", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  
  // Check if admin is requesting their own restaurant's tables
  if (req.admin.restaurant_id !== id) {
    return res.status(403).json({ error: "Access denied" });
  }
  
  try {
    const result = await pool.query(
      "SELECT table_number, qr_code_url FROM tables WHERE restaurant_id = $1 ORDER BY table_number",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching tables" });
  }
});

module.exports = router;