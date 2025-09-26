const express = require("express");
const path = require("path");
const router = express.Router();

// Serve the main frontend page
router.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = router;
