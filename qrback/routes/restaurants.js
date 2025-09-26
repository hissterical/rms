const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const pool = require("../setup/db");

// Register a restaurant
router.post("/create", async (req, res) => {
  const { name, email, address, tables_count } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO restaurants (name, contact_email, address) VALUES ($1, $2, $3) RETURNING *",
      [name, email, address]
    );
    const restaurant = result.rows[0];

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

    const tablePromises = [];
    for (let i = 1; i <= tables_count; i++) {
      const url = `https://${process.env.APP_DOMAIN || "localhost:3000"}/menu/${
        restaurant.id
      }/${i}`;
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

    res.json({ restaurant, message: "Restaurant registered ✅" });
  } catch (err) {
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

// Get all tables for a restaurant
router.get("/:id/tables", async (req, res) => {
  const { id } = req.params;
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
