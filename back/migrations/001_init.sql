-- MIGRATION: UP
--- Consolidated migration for RMS database

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Create ENUM types
CREATE TYPE room_status AS ENUM('available', 'reserved', 'occupied', 'maintenance');
CREATE TYPE booking_status AS ENUM('reserved', 'cancelled', 'checked_in', 'checked_out');
CREATE TYPE property_type_enum AS ENUM('Hotel', 'Resort', 'Guesthouse', 'Hostel', 'Apartment');
CREATE TYPE user_role_enum AS ENUM('property_owner', 'manager', 'website_customer', 'offline_customer');

-- Create reusable timestamp trigger function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE,
  phone text,
  password_hash text,
  role user_role_enum NOT NULL DEFAULT 'offline_customer',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);

CREATE TRIGGER set_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Create properties table
CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  address text,
  description text,
  property_type property_type_enum,
  phone varchar(20),
  website text,
  main_image_url text,
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_properties_owner_id ON properties(owner_id);

-- Create property_managers junction table
CREATE TABLE property_managers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  manager_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(property_id, manager_id)
);

CREATE INDEX idx_property_managers_property_id ON property_managers(property_id);
CREATE INDEX idx_property_managers_manager_id ON property_managers(manager_id);

-- Create room_types table
CREATE TABLE room_types (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_type_name text NOT NULL,
  description text,
  capacity int NOT NULL DEFAULT 2 CHECK (capacity > 0),
  price numeric(10, 2) NOT NULL CHECK (price >= 0)
);

-- Create rooms table
CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_type_id uuid REFERENCES room_types(id) ON DELETE SET NULL,
  room_number text NOT NULL,
  floor int,
  status room_status NOT NULL DEFAULT 'available',
  UNIQUE(property_id, room_number)
);

CREATE INDEX idx_rooms_status ON rooms(status);

-- Create bookings table
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status booking_status NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT end_date_after_start_date CHECK (end_date > start_date)
);

-- Add constraint to prevent overlapping bookings
ALTER TABLE bookings
ADD CONSTRAINT no_overlapping_bookings
EXCLUDE USING gist (
    room_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
);

-- Create triggers for bookings
CREATE TRIGGER set_bookings_timestamp
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Create indexes for bookings
CREATE INDEX idx_bookings_room_dates ON bookings(room_id, start_date, end_date);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);