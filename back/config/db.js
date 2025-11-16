//connect to postgres db
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "newuserdb",
  password: "shashwathprabhu12345",
  port: Number(process.env.PG_PORT) || 5433,
});

pool
  .connect()
  .then(() => console.log("Connected to Postgres"))
  .catch((err) => console.error("Connection error", err));

export default pool;
