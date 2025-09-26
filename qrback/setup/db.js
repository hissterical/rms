//connect to postgres db
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT) || 5432,
});

pool
  .connect()
  .then(() => console.log("✅ Connected to PostgreSQL database"))
  .catch((err) => {
    console.error("❌ Connection error", err);
    console.log("Please check your database configuration in .env file");
  });

module.exports = pool;
