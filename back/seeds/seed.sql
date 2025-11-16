-- Seed data for HMS
-- Assumes migrations have run and tables exist: users, properties, room_types, rooms, bookings

-- Ensure uuid extension available (migrations normally do this)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (owners and guests)
INSERT INTO users (id, first_name, last_name, email, phone, password_hash, role)
VALUES
  (uuid_generate_v4(), 'Alice', 'Owner', 'alice.owner@example.com', '+111111111', NULL, 'property_owner'),
  (uuid_generate_v4(), 'Bob', 'Manager', 'bob.manager@example.com', '+222222222', NULL, 'admin'),
  (uuid_generate_v4(), 'Charlie', 'Guest', 'charlie.guest@example.com', '+333333333', NULL, 'website_customer')
ON CONFLICT (email) DO NOTHING;

-- Properties
INSERT INTO properties (id, name, address, description, property_type, phone, website, main_image_url, owner_id)
SELECT uuid_generate_v4(), 'SeaView Resort', '123 Ocean Drive', 'Beachfront resort with modern amenities', 'Resort', '+4455667788', 'https://seaview.example', NULL, (SELECT id FROM users WHERE email = 'alice.owner@example.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE name = 'SeaView Resort');

-- Room types
INSERT INTO room_types (id, property_id, room_type_name, description, capacity, price)
SELECT uuid_generate_v4(), p.id, 'Standard', 'Standard room with queen bed', 2, 120.00
FROM properties p WHERE p.name = 'SeaView Resort'
ON CONFLICT DO NOTHING;

INSERT INTO room_types (id, property_id, room_type_name, description, capacity, price)
SELECT uuid_generate_v4(), p.id, 'Deluxe', 'Deluxe room with sea view', 3, 220.00
FROM properties p WHERE p.name = 'SeaView Resort'
ON CONFLICT DO NOTHING;

-- Rooms (create 3 floors x 5 rooms)
DO $$
DECLARE
  p_id uuid;
  rt_id_standard uuid;
  rt_id_deluxe uuid;
  floor_num int;
  room_num int;
  rn text;
BEGIN
  SELECT id INTO p_id FROM properties WHERE name = 'SeaView Resort' LIMIT 1;
  SELECT id INTO rt_id_standard FROM room_types WHERE room_type_name = 'Standard' AND property_id = p_id LIMIT 1;
  SELECT id INTO rt_id_deluxe FROM room_types WHERE room_type_name = 'Deluxe' AND property_id = p_id LIMIT 1;

  IF p_id IS NULL THEN
    RAISE NOTICE 'Property not found, skipping rooms';
    RETURN;
  END IF;

  FOR floor_num IN 1..3 LOOP
    FOR room_num IN 1..5 LOOP
      rn := floor_num || LPAD(room_num::text, 2, '0');
  INSERT INTO rooms (id, property_id, room_type_id, room_number, floor, status)
  VALUES (uuid_generate_v4(), p_id, CASE WHEN room_num > 3 THEN rt_id_deluxe ELSE rt_id_standard END, rn, floor_num, 'available')
  ON CONFLICT (property_id, room_number) DO NOTHING;
    END LOOP;
  END LOOP;
END$$;

-- Create a booking for room 102
INSERT INTO bookings (id, property_id, room_id, user_id, status, start_date, end_date)
SELECT uuid_generate_v4(), p.id, r.id, u.id, 'reserved', CURRENT_DATE + 1, CURRENT_DATE + 3
FROM properties p
JOIN rooms r ON r.property_id = p.id AND r.room_number = '102'
JOIN users u ON u.email = 'charlie.guest@example.com'
WHERE p.name = 'SeaView Resort'
ON CONFLICT DO NOTHING;

-- Update room 102 booking_id and status
-- Use explicit table references in WHERE to avoid invalid FROM-clause references
UPDATE rooms
SET booking_id = b.id, status = 'reserved'
FROM bookings b, properties p
WHERE b.room_id = rooms.id
  AND p.id = rooms.property_id
  AND p.name = 'SeaView Resort'
  AND rooms.room_number = '102';

-- Simple verification selects
-- SELECT COUNT(*) FROM users;
-- SELECT COUNT(*) FROM properties;
-- SELECT COUNT(*) FROM room_types;
-- SELECT COUNT(*) FROM rooms;
-- SELECT COUNT(*) FROM bookings;
