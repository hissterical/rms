import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT) || 5432,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});

async function fixUserRoleEnum() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    console.log('Step 1: Adding "manager" to enum if it does not exist...');
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'manager' 
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
        ) THEN
          ALTER TYPE user_role_enum ADD VALUE 'manager';
        END IF;
      END
      $$;
    `);

    console.log('Step 2: Updating users with "admin" role to "manager"...');
    const updateResult = await client.query(`
      UPDATE users SET role = 'manager' WHERE role = 'admin'
    `);
    console.log(`Updated ${updateResult.rowCount} user(s)`);

    console.log("Step 3: Creating new enum type...");
    await client.query(`
      CREATE TYPE user_role_enum_new AS ENUM('property_owner', 'manager', 'website_customer', 'offline_customer')
    `);

    console.log("Step 4: Altering users table to use new enum...");
    await client.query(`
      ALTER TABLE users 
        ALTER COLUMN role TYPE user_role_enum_new 
        USING role::text::user_role_enum_new
    `);

    console.log("Step 5: Dropping old enum and renaming new one...");
    await client.query(`DROP TYPE user_role_enum`);
    await client.query(
      `ALTER TYPE user_role_enum_new RENAME TO user_role_enum`
    );

    await client.query("COMMIT");
    console.log("✅ Successfully fixed user_role_enum!");

    // Verify the fix
    const enumValues = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum') 
      ORDER BY enumsortorder
    `);
    console.log("\nCurrent enum values:");
    enumValues.rows.forEach((row) => console.log(`  - ${row.enumlabel}`));
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error fixing enum:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixUserRoleEnum();
