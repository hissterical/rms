const pool = require("./setup/db.js");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  try {
    console.log("Running orders table migration...");

    const migrationPath = path.join(
      __dirname,
      "migrations",
      "003_add_orders.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    await pool.query(migrationSQL);
    console.log("✅ Orders table migration completed successfully");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
