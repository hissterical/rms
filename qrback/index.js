const express = require("express");
const QRCode = require("qrcode");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());

// Serve static files from storage directory
app.use("/storage", express.static(path.join(__dirname, "storage")));
app.use("/public", express.static(path.join(__dirname, "public")));

//routes
const restaurantRoutes = require("./routes/restaurants");
const frontendRoutes = require("./routes/testFrontend");

app.use("/api/restaurants", restaurantRoutes);
app.use("/", frontendRoutes);

// test route
app.get("/", (req, res) => {
  res.send("QR Menu API is running ✅");
});

app.listen(3000, () => {});
