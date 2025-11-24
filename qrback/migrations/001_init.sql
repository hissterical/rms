-- MIGRATION: UP
CREATE TABLE restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_email text,
  address text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number int NOT NULL,
  qr_code_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  category text,
  image_url text
);
