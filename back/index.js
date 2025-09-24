import express from "express";

import dotenv from "dotenv";
dotenv.config();

import pool from "./config/db.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.listen(port, () => {
  console.log(`HMS server running on http://localhost:${port}`);
});
