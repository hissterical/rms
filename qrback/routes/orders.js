const express = require("express");
const router = express.Router();
const pool = require("../setup/db.js");

// Create a new order
router.post("/api/orders", async (req, res) => {
  try {
    const {
      restaurant_id,
      table_number,
      items, // Array of {menu_item_id, name, price, quantity, special_notes}
      special_instructions,
      total_amount,
      customer_name,
    } = req.body;

    // Validate required fields
    if (
      !restaurant_id ||
      !table_number ||
      !items ||
      items.length === 0 ||
      !total_amount
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate total amount calculation
    const calculatedTotal = items.reduce((sum, item) => {
      return sum + parseFloat(item.price) * parseInt(item.quantity);
    }, 0);

    if (Math.abs(calculatedTotal - parseFloat(total_amount)) > 0.01) {
      return res.status(400).json({ error: "Total amount mismatch" });
    }

    const result = await pool.query(
      `INSERT INTO orders (restaurant_id, table_number, items, special_instructions, total_amount, customer_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        restaurant_id,
        table_number,
        JSON.stringify(items),
        special_instructions || "",
        total_amount,
        customer_name || "Guest",
      ]
    );

    res.status(201).json({
      message: "Order created successfully",
      order: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Get order statistics for a restaurant (must come before general :restaurant_id route)
router.get("/api/orders/:restaurant_id/stats", async (req, res) => {
  try {
    const { restaurant_id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_orders,
        COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        COALESCE(SUM(CASE WHEN status = 'delivered' THEN total_amount END), 0) as total_revenue,
        COALESCE(AVG(CASE WHEN status = 'delivered' THEN total_amount END), 0) as avg_order_value
      FROM orders 
      WHERE restaurant_id = $1 AND created_at >= CURRENT_DATE
    `,
      [restaurant_id]
    );

    res.json({
      stats: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({ error: "Failed to fetch order statistics" });
  }
});

// Get all orders for a restaurant
router.get("/api/orders/:restaurant_id", async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const { status } = req.query; // Optional filter by status

    let query = `
      SELECT o.*, r.name as restaurant_name 
      FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.id
      WHERE o.restaurant_id = $1
    `;
    const queryParams = [restaurant_id];

    if (status) {
      query += " AND o.status = $2";
      queryParams.push(status);
    }

    query += " ORDER BY o.created_at DESC";

    const result = await pool.query(query, queryParams);

    res.json({
      orders: result.rows,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get a specific order by ID
router.get("/api/orders/:restaurant_id/:order_id", async (req, res) => {
  try {
    const { restaurant_id, order_id } = req.params;

    const result = await pool.query(
      `SELECT o.*, r.name as restaurant_name 
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.id = $1 AND o.restaurant_id = $2`,
      [order_id, restaurant_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      order: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Update order status
router.put("/api/orders/:order_id/status", async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "preparing",
      "ready",
      "delivered",
      "cancelled",
    ];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    const result = await pool.query(
      "UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [status, order_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      message: "Order status updated successfully",
      order: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

module.exports = router;
