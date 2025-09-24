//connect to postgres db
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT) || 5432,
});

pool
  .connect()
  .then(() => console.log("Connected to Postgres"))
  .catch((err) => console.error("Connection error", err));

export default pool;
