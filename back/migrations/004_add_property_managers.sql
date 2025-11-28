-- MIGRATION: UP
-- Create a junction table for property managers (managers who can access specific properties)

CREATE TABLE property_managers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  manager_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(property_id, manager_id)
);

CREATE INDEX idx_property_managers_property_id ON property_managers(property_id);
CREATE INDEX idx_property_managers_manager_id ON property_managers(manager_id);
