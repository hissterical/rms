-- MIGRATION: Add room_type text column to rooms table
-- This is a temporary workaround to allow rooms to have a simple text-based room type
-- without requiring a relationship to the room_types table
-- TODO: In the future, migrate to use room_type_id properly with room_types table

-- Add room_type column (nullable for now)
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_type text;

-- Add capacity and price columns directly to rooms table for now
-- This duplicates data from room_types but makes it simpler to work with individual rooms
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS capacity int DEFAULT 2;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS price numeric(10, 2) DEFAULT 0;

-- Set default values for existing rows
UPDATE rooms SET room_type = 'Standard' WHERE room_type IS NULL;
UPDATE rooms SET capacity = 2 WHERE capacity IS NULL;
UPDATE rooms SET price = 100.00 WHERE price IS NULL;

-- Note: room_type_id column still exists but is optional (nullable)
-- When room type management is implemented, we can migrate data from room_type (text)
-- to proper room_type_id relationships

-- Migration Notes:
-- - room_type: Simple text field for room category (e.g., "Deluxe", "Suite", "Standard")
-- - capacity: Number of guests the room can accommodate
-- - price: Base price per night for this specific room
-- - room_type_id: (Existing, not used) Will be used later for proper room type management
