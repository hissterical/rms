const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../setup/db");
const { authenticateAdmin } = require("./adminAuth");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(
      __dirname,
      "..",
      "storage",
      "menu-images",
      req.admin.restaurant_id
    );
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "menu-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload an image."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Get all menu items for a restaurant (admin view)
router.get("/admin", authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM menu_items WHERE restaurant_id = $1 ORDER BY category, sort_order, name",
      [req.admin.restaurant_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new menu item
router.post(
  "/admin",
  authenticateAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, description, price, category, sort_order, is_available } =
        req.body;

      if (!name || !price) {
        return res.status(400).json({ error: "Name and price are required" });
      }

      let image_url = null;
      if (req.file) {
        image_url = `/storage/menu-images/${req.admin.restaurant_id}/${req.file.filename}`;
      }

      const result = await pool.query(
        `INSERT INTO menu_items (restaurant_id, name, description, price, category, image_url, sort_order, is_available) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          req.admin.restaurant_id,
          name,
          description || null,
          parseFloat(price),
          category || "General",
          image_url,
          parseInt(sort_order) || 0,
          is_available === "false" ? false : true,
        ]
      );

      res.json({
        message: "Menu item created successfully",
        menuItem: result.rows[0],
      });
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update a menu item
router.put(
  "/admin/:id",
  authenticateAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, category, sort_order, is_available } =
        req.body;

      // First check if the menu item belongs to this restaurant
      const checkResult = await pool.query(
        "SELECT * FROM menu_items WHERE id = $1 AND restaurant_id = $2",
        [id, req.admin.restaurant_id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: "Menu item not found" });
      }

      const existingItem = checkResult.rows[0];
      let image_url = existingItem.image_url;

      // Handle new image upload
      if (req.file) {
        // Delete old image if exists
        if (existingItem.image_url) {
          const oldImagePath = path.join(
            __dirname,
            "..",
            existingItem.image_url
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        image_url = `/storage/menu-images/${req.admin.restaurant_id}/${req.file.filename}`;
      }

      const result = await pool.query(
        `UPDATE menu_items 
       SET name = $1, description = $2, price = $3, category = $4, image_url = $5, 
           sort_order = $6, is_available = $7, updated_at = now()
       WHERE id = $8 AND restaurant_id = $9 
       RETURNING *`,
        [
          name || existingItem.name,
          description !== undefined ? description : existingItem.description,
          price ? parseFloat(price) : existingItem.price,
          category || existingItem.category,
          image_url,
          sort_order !== undefined
            ? parseInt(sort_order)
            : existingItem.sort_order,
          is_available !== undefined
            ? is_available === "false"
              ? false
              : true
            : existingItem.is_available,
          id,
          req.admin.restaurant_id,
        ]
      );

      res.json({
        message: "Menu item updated successfully",
        menuItem: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Delete a menu item
router.delete("/admin/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get the menu item to delete the image
    const getResult = await pool.query(
      "SELECT image_url FROM menu_items WHERE id = $1 AND restaurant_id = $2",
      [id, req.admin.restaurant_id]
    );

    if (getResult.rows.length === 0) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    const menuItem = getResult.rows[0];

    // Delete the menu item
    await pool.query(
      "DELETE FROM menu_items WHERE id = $1 AND restaurant_id = $2",
      [id, req.admin.restaurant_id]
    );

    // Delete the image file if exists
    if (menuItem.image_url) {
      const imagePath = path.join(__dirname, "..", menuItem.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get menu items for public display (customer view)
router.get("/:restaurantId/:tableNumber", async (req, res) => {
  try {
    const { restaurantId, tableNumber } = req.params;

    // Verify that the table exists for this restaurant
    const tableResult = await pool.query(
      "SELECT * FROM tables WHERE restaurant_id = $1 AND table_number = $2",
      [restaurantId, tableNumber]
    );

    if (tableResult.rows.length === 0) {
      return res.status(404).json({ error: "Table not found" });
    }

    // Get restaurant info
    const restaurantResult = await pool.query(
      "SELECT name, address FROM restaurants WHERE id = $1",
      [restaurantId]
    );

    if (restaurantResult.rows.length === 0) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Get menu items (only available ones)
    const menuResult = await pool.query(
      "SELECT id, name, description, price, category, image_url FROM menu_items WHERE restaurant_id = $1 AND is_available = true ORDER BY category, sort_order, name",
      [restaurantId]
    );

    // Group menu items by category
    const menuByCategory = {};
    menuResult.rows.forEach((item) => {
      const category = item.category || "General";
      if (!menuByCategory[category]) {
        menuByCategory[category] = [];
      }
      menuByCategory[category].push(item);
    });

    res.json({
      restaurant: restaurantResult.rows[0],
      table_number: tableNumber,
      menu: menuByCategory,
    });
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
