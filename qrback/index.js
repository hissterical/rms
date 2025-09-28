const express = require("express");
const QRCode = require("qrcode");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from storage directory
app.use("/storage", express.static(path.join(__dirname, "storage")));
app.use("/public", express.static(path.join(__dirname, "public")));

//routes
const restaurantRoutes = require("./routes/restaurants");
const menuRoutes = require("./routes/menus");
const { router: adminAuthRoutes } = require("./routes/adminAuth");
const frontendRoutes = require("./routes/testFrontend");

app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/", frontendRoutes);

// Menu display route (this will serve the customer-facing menu)
app.get("/menu/:restaurantId/:tableNumber", async (req, res) => {
  res.sendFile(path.join(__dirname, "public", "menu.html"));
});

// Admin routes
app.get("/admin-login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin-login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.get("/admin-panel", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin-panel.html"));
});

// test route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on port 3000");
});
