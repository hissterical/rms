const { Pool } = require("pg");
require("dotenv").config();

// Connect to default postgres database first
const adminPool = new Pool({
  user: process.env.PG_USER || "postgres",
  host: process.env.PG_HOST || "localhost",
  database: "postgres", // Connect to default database
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT) || 5432,
});

async function setupDatabase() {
  let client;
  try {
    console.log("🔄 Connecting to PostgreSQL...");
    client = await adminPool.connect();
    
    // Check if restaurant_db exists
    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'restaurant_db'"
    );
    
    if (checkDb.rows.length === 0) {
      console.log("📦 Creating restaurant_db database...");
      await client.query("CREATE DATABASE restaurant_db");
      console.log("✅ Database created successfully!");
    } else {
      console.log("✅ Database restaurant_db already exists");
    }
    
    client.release();
    await adminPool.end();
    
    // Now connect to restaurant_db and run migrations
    const restaurantPool = new Pool({
      user: process.env.PG_USER || "postgres",
      host: process.env.PG_HOST || "localhost",
      database: "restaurant_db",
      password: process.env.PG_PASSWORD,
      port: Number(process.env.PG_PORT) || 5432,
    });
    
    console.log("\n🔄 Running migrations...");
    const migrationClient = await restaurantPool.connect();
    
    // Read and run migration files
    const fs = require("fs");
    const path = require("path");
    
    const migrations = [
      "001_init.sql",
      "002_add_admin_auth.sql",
      "003_add_orders.sql"
    ];
    
    for (const migration of migrations) {
      const migrationPath = path.join(__dirname, "migrations", migration);
      if (fs.existsSync(migrationPath)) {
        console.log(`\n📝 Running ${migration}...`);
        const sql = fs.readFileSync(migrationPath, "utf8");
        
        try {
          await migrationClient.query(sql);
          console.log(`✅ ${migration} completed`);
        } catch (err) {
          if (err.message.includes("already exists")) {
            console.log(`⚠️  ${migration} - tables already exist (skipping)`);
          } else {
            throw err;
          }
        }
      }
    }
    
    migrationClient.release();
    await restaurantPool.end();
    
    console.log("\n✅ Database setup complete!");
    console.log("\n🚀 You can now run: npm run dev");
    
  } catch (error) {
    console.error("\n❌ Error setting up database:", error.message);
    console.log("\nPlease make sure:");
    console.log("1. PostgreSQL is running");
    console.log("2. .env file has correct credentials");
    console.log("3. You can connect to PostgreSQL");
    process.exit(1);
  }
}

setupDatabase();
