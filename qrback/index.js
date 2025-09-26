const express = require("express");
const QRCode = require("qrcode");
require("dotenv").config();

const app = express();
app.use(express.json());




// test route
app.get("/", (req, res) => {
  res.send("QR Menu API is running ✅");
});



app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
