#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const migrationPath = path.join(
    __dirname,
    "migrations",
    "002_add_room_type_text.sql"
  );

  console.log("Reading migration file:", migrationPath);
  const sql = fs.readFileSync(migrationPath, "utf8");

  try {
    console.log("Running migration...");
    await pool.query(sql);
    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
