-- MIGRATION: UP
-- Add admin authentication table
CREATE TABLE restaurant_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  password text NOT NULL, -- hashed password
  created_at timestamptz DEFAULT now()
);

-- Update menu_items table to add more fields for better menu management
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Create an index for better performance
CREATE INDEX idx_menu_items_restaurant_category ON menu_items(restaurant_id, category);
CREATE INDEX idx_restaurant_admins_email ON restaurant_admins(email);