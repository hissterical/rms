-- MIGRATION: Fix user_role_enum to use 'manager' instead of 'admin'

-- First, update any existing users with role 'admin' to 'manager'
-- This is safe because we're about to rename the enum value anyway
DO $$
BEGIN
  -- Add 'manager' to the enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'manager' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')) THEN
    ALTER TYPE user_role_enum ADD VALUE 'manager';
  END IF;
END
$$;

-- Update all users with 'admin' role to 'manager'
UPDATE users SET role = 'manager' WHERE role = 'admin';

-- Now we need to remove 'admin' from the enum
-- Unfortunately PostgreSQL doesn't support dropping enum values directly
-- So we need to recreate the enum type

-- Step 1: Create a new enum with the correct values
CREATE TYPE user_role_enum_new AS ENUM('property_owner', 'manager', 'website_customer', 'offline_customer');

-- Step 2: Alter the users table to use the new type
ALTER TABLE users 
  ALTER COLUMN role TYPE user_role_enum_new 
  USING role::text::user_role_enum_new;

-- Step 3: Drop the old enum and rename the new one
DROP TYPE user_role_enum;
ALTER TYPE user_role_enum_new RENAME TO user_role_enum;
