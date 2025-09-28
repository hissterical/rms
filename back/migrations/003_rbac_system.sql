-- MIGRATION: UP
-- RBAC (Role-Based Access Control) System

-- Create roles table
CREATE TYPE system_role AS ENUM(
  'super_admin', 
  'property_owner', 
  'hotel_manager', 
  'front_desk', 
  'housekeeping', 
  'guest'
);

CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name system_role NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create permissions table
CREATE TABLE permissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource text NOT NULL, -- e.g., 'properties', 'bookings', 'rooms', 'users'
  action text NOT NULL,    -- e.g., 'create', 'read', 'update', 'delete', 'manage_staff'
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(resource, action)
);

-- Create role_permissions mapping table
CREATE TABLE role_permissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- Update users table to use new role system
ALTER TABLE users 
  DROP COLUMN IF EXISTS role,
  ADD COLUMN role_id uuid REFERENCES roles(id),
  ADD COLUMN is_active boolean DEFAULT true,
  ADD COLUMN last_login timestamptz,
  ADD COLUMN email_verified boolean DEFAULT false,
  ADD COLUMN reset_token text,
  ADD COLUMN reset_token_expires timestamptz;

-- Create user_properties table for property ownership/management
CREATE TABLE user_properties (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  role_type text NOT NULL DEFAULT 'staff', -- 'owner', 'manager', 'staff'
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, property_id)
);

-- Insert default roles
INSERT INTO roles (name, display_name, description) VALUES
  ('super_admin', 'Super Administrator', 'Full system access and control'),
  ('property_owner', 'Property Owner', 'Owns properties and can manage staff'),
  ('hotel_manager', 'Hotel Manager', 'Manages property operations and bookings'),
  ('front_desk', 'Front Desk Staff', 'Handles check-ins, check-outs, and guest services'),
  ('housekeeping', 'Housekeeping Staff', 'Manages room status and maintenance'),
  ('guest', 'Guest', 'Hotel guest with limited access to bookings and profile');

-- Insert permissions
INSERT INTO permissions (resource, action, description) VALUES
  -- Property permissions
  ('properties', 'create', 'Create new properties'),
  ('properties', 'read', 'View property information'),
  ('properties', 'update', 'Modify property details'),
  ('properties', 'delete', 'Delete properties'),
  ('properties', 'manage_staff', 'Assign and manage property staff'),
  
  -- Room permissions
  ('rooms', 'create', 'Create new rooms'),
  ('rooms', 'read', 'View room information'),
  ('rooms', 'update', 'Modify room details'),
  ('rooms', 'delete', 'Delete rooms'),
  ('rooms', 'change_status', 'Update room availability status'),
  
  -- Booking permissions
  ('bookings', 'create', 'Create new bookings'),
  ('bookings', 'read', 'View booking information'),
  ('bookings', 'update', 'Modify booking details'),
  ('bookings', 'delete', 'Cancel/delete bookings'),
  ('bookings', 'check_in', 'Perform guest check-in'),
  ('bookings', 'check_out', 'Perform guest check-out'),
  
  -- User management permissions
  ('users', 'create', 'Create new user accounts'),
  ('users', 'read', 'View user information'),
  ('users', 'update', 'Modify user details'),
  ('users', 'delete', 'Delete user accounts'),
  ('users', 'assign_roles', 'Assign roles to users'),
  
  -- Report permissions
  ('reports', 'view_financial', 'View financial reports'),
  ('reports', 'view_occupancy', 'View occupancy reports'),
  ('reports', 'view_performance', 'View performance analytics'),
  
  -- System permissions
  ('system', 'admin', 'Full system administration access');

-- Assign permissions to roles
DO $$
DECLARE
  super_admin_id uuid;
  property_owner_id uuid;
  hotel_manager_id uuid;
  front_desk_id uuid;
  housekeeping_id uuid;
  guest_id uuid;
BEGIN
  -- Get role IDs
  SELECT id INTO super_admin_id FROM roles WHERE name = 'super_admin';
  SELECT id INTO property_owner_id FROM roles WHERE name = 'property_owner';
  SELECT id INTO hotel_manager_id FROM roles WHERE name = 'hotel_manager';
  SELECT id INTO front_desk_id FROM roles WHERE name = 'front_desk';
  SELECT id INTO housekeeping_id FROM roles WHERE name = 'housekeeping';
  SELECT id INTO guest_id FROM roles WHERE name = 'guest';
  
  -- Super Admin - All permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT super_admin_id, id FROM permissions;
  
  -- Property Owner permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT property_owner_id, id FROM permissions 
  WHERE (resource, action) IN (
    ('properties', 'create'), ('properties', 'read'), ('properties', 'update'), ('properties', 'delete'), ('properties', 'manage_staff'),
    ('rooms', 'create'), ('rooms', 'read'), ('rooms', 'update'), ('rooms', 'delete'), ('rooms', 'change_status'),
    ('bookings', 'create'), ('bookings', 'read'), ('bookings', 'update'), ('bookings', 'delete'), ('bookings', 'check_in'), ('bookings', 'check_out'),
    ('users', 'create'), ('users', 'read'), ('users', 'update'), ('users', 'assign_roles'),
    ('reports', 'view_financial'), ('reports', 'view_occupancy'), ('reports', 'view_performance')
  );
  
  -- Hotel Manager permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT hotel_manager_id, id FROM permissions 
  WHERE (resource, action) IN (
    ('properties', 'read'), ('properties', 'update'),
    ('rooms', 'create'), ('rooms', 'read'), ('rooms', 'update'), ('rooms', 'change_status'),
    ('bookings', 'create'), ('bookings', 'read'), ('bookings', 'update'), ('bookings', 'delete'), ('bookings', 'check_in'), ('bookings', 'check_out'),
    ('users', 'read'), ('users', 'update'),
    ('reports', 'view_financial'), ('reports', 'view_occupancy'), ('reports', 'view_performance')
  );
  
  -- Front Desk permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT front_desk_id, id FROM permissions 
  WHERE (resource, action) IN (
    ('properties', 'read'),
    ('rooms', 'read'), ('rooms', 'change_status'),
    ('bookings', 'create'), ('bookings', 'read'), ('bookings', 'update'), ('bookings', 'check_in'), ('bookings', 'check_out'),
    ('users', 'read'), ('users', 'update'),
    ('reports', 'view_occupancy')
  );
  
  -- Housekeeping permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT housekeeping_id, id FROM permissions 
  WHERE (resource, action) IN (
    ('properties', 'read'),
    ('rooms', 'read'), ('rooms', 'change_status'),
    ('bookings', 'read')
  );
  
  -- Guest permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT guest_id, id FROM permissions 
  WHERE (resource, action) IN (
    ('properties', 'read'),
    ('rooms', 'read'),
    ('bookings', 'create'), ('bookings', 'read'), ('bookings', 'update'),
    ('users', 'update') -- own profile only
  );
END $$;

-- Create indexes for better performance
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_user_properties_user_id ON user_properties(user_id);
CREATE INDEX idx_user_properties_property_id ON user_properties(property_id);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_email_active ON users(email, is_active);

-- MIGRATION: DOWN
-- DROP INDEX idx_users_email_active;
-- DROP INDEX idx_users_role_id;
-- DROP INDEX idx_user_properties_property_id;
-- DROP INDEX idx_user_properties_user_id;
-- DROP INDEX idx_role_permissions_permission_id;
-- DROP INDEX idx_role_permissions_role_id;
-- DROP TABLE user_properties;
-- ALTER TABLE users DROP COLUMN reset_token_expires, DROP COLUMN reset_token, DROP COLUMN email_verified, DROP COLUMN last_login, DROP COLUMN is_active, DROP COLUMN role_id;
-- DROP TABLE role_permissions;
-- DROP TABLE permissions;
-- DROP TABLE roles;
-- DROP TYPE system_role;