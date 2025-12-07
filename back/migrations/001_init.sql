-- MIGRATION: UP
--- use npm run migrate up
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;


CREATE TYPE room_status AS ENUM('available', 'reserved', 'occupied', 'maintenance');
CREATE TYPE booking_status AS ENUM('reserved', 'cancelled', 'checked_in', 'checked_out');

CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  address varchar(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE room_types (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_type_name text NOT NULL,
  description text,
  capacity int NOT NULL DEFAULT 2 CHECK (capacity > 0),
  price numeric(10, 2) NOT NULL CHECK (price >= 0)
);


CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name text NOT NULL,
  last_name text NOT NULL,  
  email text UNIQUE,          
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Rooms (The actual physical rooms)
CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_type_id uuid REFERENCES room_types(id) ON DELETE SET NULL,
  booking_id uuid, -- defining the column here but adding the reference later to avoid circular dependency
  room_number text NOT NULL,
  floor int,
  status room_status NOT NULL DEFAULT 'available',
  UNIQUE(property_id, room_number)
);

-- Bookings (connects a customer to a room for a date range)
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  status booking_status NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT end_date_after_start_date CHECK (end_date > start_date)
);

-- Fix the circular dependency by adding the foreign key after table creation
ALTER TABLE rooms
ADD CONSTRAINT fk_rooms_current_booking
FOREIGN KEY (booking_id) REFERENCES bookings(id)
ON DELETE SET NULL; --  If a booking is deleted, the room becomes available, it doesn't get deleted.


--no new row inserted its room_id is the same as an existing row's room_id AND the date range overlaps with that existing row's date range.
ALTER TABLE bookings
ADD CONSTRAINT no_overlapping_bookings
EXCLUDE USING gist (
    room_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
); 


--updated_at column (in bookings table) to be automatically updated on row modification
CREATE OR REPLACE FUNCTION trigger_set_timestamp() --reusable function
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- 2. Attach the function as a trigger to your bookings table
CREATE TRIGGER set_bookings_timestamp
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

--- Indexes for performance ---

-- checking room availability quickly
CREATE INDEX idx_bookings_room_dates ON bookings(room_id, start_date, end_date);

-- finding all bookings for a specific customer 
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);

-- finding all available (or occupied) rooms instant
CREATE INDEX idx_rooms_status ON rooms(status);