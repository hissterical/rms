CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE room_status AS enum('available', 'reserved', 'occupied', 'maintenance');

-- Properties (a hotel, motel, guesthouse)
CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  address varchar(255);
);

-- Rooms (belong to a property)
CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  room_number text NOT NULL,
  UNIQUE(property_id, room_number),
  room_type_id uuid REFERENCES room_types(id) ON DELETE SET NULL,
  floor int, 
  status room_status default 'available',
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,

);

CREATE TABLE room_types (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_type_name text NOT NULL,
  description text,
  capacity int DEFAULT 1,
  price int,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
)

-- Customers (guests)
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name text,
  last_name text,
  email text,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Bookings (connects customer <-> room)
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'hold', -- hold, confirmed, cancelled
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_bookings_room_dates
  ON bookings(room_id, start_date, end_date);
