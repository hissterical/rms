-- MIGRATION: UP

CREATE TYPE property_type_enum AS ENUM('Hotel', 'Resort', 'Guesthouse', 'Hostel', 'Apartment');
CREATE TYPE user_role_enum AS ENUM('property_owner', 'manager', 'website_customer', 'offline_customer');



CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE,          
  phone text,
  password_hash text,         -- NULLABLE to allow for guests without login accounts
  role user_role_enum NOT NULL DEFAULT 'offline_customer',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);

-- 4. Attach your reusable trigger function to the new 'users' table
CREATE TRIGGER set_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

ALTER TABLE properties
  ADD COLUMN description TEXT,
  ADD COLUMN property_type property_type_enum,
  ADD COLUMN phone VARCHAR(20),
  ADD COLUMN website TEXT,
  ADD COLUMN main_image_url TEXT,
  ADD COLUMN owner_id UUID REFERENCES users(id) ON DELETE SET NULL;

DROP INDEX IF EXISTS idx_bookings_customer_id;

ALTER TABLE bookings DROP CONSTRAINT bookings_customer_id_fkey;

ALTER TABLE bookings DROP COLUMN customer_id;
ALTER TABLE bookings ADD COLUMN user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX idx_bookings_user_id ON bookings(user_id);


CREATE INDEX idx_properties_owner_id ON properties(owner_id);

DROP TABLE IF EXISTS customers;