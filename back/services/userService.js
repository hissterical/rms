import pool from "../config/db.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function registerUser(userData) {
  const { firstName, lastName, email, phone, password, role } = userData;

  // Validate required fields
  if (!firstName || !lastName || !password) {
    throw new Error("First name, last name, and password are required");
  }

  // Email is required for property_owner, manager, and website_customer
  if (
    ["property_owner", "manager", "website_customer"].includes(role) &&
    !email
  ) {
    throw new Error("Email is required for this role");
  }

  // Validate role
  const validRoles = [
    "property_owner",
    "manager",
    "website_customer",
    "offline_customer",
  ];
  if (role && !validRoles.includes(role)) {
    throw new Error("Invalid role");
  }

  try {
    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const query = `
      INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, first_name, last_name, email, phone, role, created_at;
    `;

    const values = [
      firstName,
      lastName,
      email || null,
      phone || null,
      passwordHash,
      role || "offline_customer",
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    if (err.code === "23505") {
      // Unique violation
      throw new Error("Email already exists");
    }
    console.error("Error registering user:", err);
    throw err;
  }
}

export async function loginUser(email, password) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
    const query = `
      SELECT id, first_name, last_name, email, phone, password_hash, role, created_at
      FROM users
      WHERE email = $1;
    `;

    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      throw new Error("Invalid email or password");
    }

    const user = result.rows[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Remove password_hash from returned user
    delete user.password_hash;

    return user;
  } catch (err) {
    console.error("Error logging in user:", err);
    throw err;
  }
}

export async function getUserById(userId) {
  try {
    const query = `
      SELECT id, first_name, last_name, email, phone, role, created_at
      FROM users
      WHERE id = $1;
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    return result.rows[0];
  } catch (err) {
    console.error("Error getting user by ID:", err);
    throw err;
  }
}

export async function updateUser(userId, userData) {
  const { firstName, lastName, email, phone } = userData;

  try {
    const query = `
      UPDATE users
      SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        updated_at = now()
      WHERE id = $5
      RETURNING id, first_name, last_name, email, phone, role, created_at, updated_at;
    `;

    const values = [firstName, lastName, email, phone, userId];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    return result.rows[0];
  } catch (err) {
    console.error("Error updating user:", err);
    throw err;
  }
}

export async function getPropertiesByOwnerId(ownerId) {
  try {
    const query = `
      SELECT 
        id, 
        name, 
        address, 
        description, 
        property_type, 
        phone, 
        website, 
        main_image_url, 
        created_at
      FROM properties
      WHERE owner_id = $1
      ORDER BY created_at DESC;
    `;

    const result = await pool.query(query, [ownerId]);
    return result.rows;
  } catch (err) {
    console.error("Error getting properties by owner ID:", err);
    throw err;
  }
}

export async function getPropertiesByManagerId(managerId) {
  try {
    const query = `
      SELECT 
        p.id, 
        p.name, 
        p.address, 
        p.description, 
        p.property_type, 
        p.phone, 
        p.website, 
        p.main_image_url, 
        p.created_at,
        pm.created_at as assigned_at
      FROM properties p
      INNER JOIN property_managers pm ON p.id = pm.property_id
      WHERE pm.manager_id = $1
      ORDER BY pm.created_at DESC;
    `;

    const result = await pool.query(query, [managerId]);
    return result.rows;
  } catch (err) {
    console.error("Error getting properties by manager ID:", err);
    throw err;
  }
}

export async function addPropertyManager(propertyId, managerId) {
  try {
    // Verify the manager has the 'manager' role
    const userQuery = `SELECT role FROM users WHERE id = $1;`;
    const userResult = await pool.query(userQuery, [managerId]);

    if (userResult.rows.length === 0) {
      throw new Error("User not found");
    }

    if (userResult.rows[0].role !== "manager") {
      throw new Error("User is not a manager");
    }

    const query = `
      INSERT INTO property_managers (property_id, manager_id)
      VALUES ($1, $2)
      RETURNING *;
    `;

    const result = await pool.query(query, [propertyId, managerId]);
    return result.rows[0];
  } catch (err) {
    if (err.code === "23505") {
      throw new Error("Manager is already assigned to this property");
    }
    console.error("Error adding property manager:", err);
    throw err;
  }
}

export async function removePropertyManager(propertyId, managerId) {
  try {
    const query = `
      DELETE FROM property_managers
      WHERE property_id = $1 AND manager_id = $2
      RETURNING *;
    `;

    const result = await pool.query(query, [propertyId, managerId]);

    if (result.rows.length === 0) {
      throw new Error("Manager assignment not found");
    }

    return result.rows[0];
  } catch (err) {
    console.error("Error removing property manager:", err);
    throw err;
  }
}

export async function getPropertyManagers(propertyId) {
  try {
    const query = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        pm.created_at as assigned_at
      FROM users u
      INNER JOIN property_managers pm ON u.id = pm.manager_id
      WHERE pm.property_id = $1
      ORDER BY pm.created_at DESC;
    `;

    const result = await pool.query(query, [propertyId]);
    return result.rows;
  } catch (err) {
    console.error("Error getting property managers:", err);
    throw err;
  }
}
