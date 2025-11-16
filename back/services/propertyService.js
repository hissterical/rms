import pool from "../config/db.js";

export async function getAllPropertiesService() {
  const query = `
    SELECT 
      p.*,
      u.first_name as owner_first_name,
      u.last_name as owner_last_name,
      u.email as owner_email
    FROM properties p
    LEFT JOIN users u ON p.owner_id = u.id
    ORDER BY p.created_at DESC;
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    console.error("Error getting all properties (service):", err);
    throw err;
  }
}

export async function getPropertyByIdService(propertyId) {
  const query = `
    SELECT 
      p.*,
      u.first_name as owner_first_name,
      u.last_name as owner_last_name,
      u.email as owner_email,
      u.phone as owner_phone
    FROM properties p
    LEFT JOIN users u ON p.owner_id = u.id
    WHERE p.id = $1;
  `;

  try {
    const result = await pool.query(query, [propertyId]);
    return result.rows[0];
  } catch (err) {
    console.error("Error getting property by ID (service):", err);
    throw err;
  }
}

export async function createPropertyService(data) {
  const {
    name,
    address,
    description,
    property_type,
    phone,
    website,
    main_image_url,
    owner_id,
  } = data;

  const query = `
    INSERT INTO properties (name, address, description, property_type, phone, website, main_image_url, owner_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *; 
    `;

  //some values here need to be turned to not null here and in the db
  const values = [
    name,
    address || null,
    description || null,
    property_type || null,
    phone || null,
    website || null,
    main_image_url || null,
    owner_id || null,
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    console.error("Error creating property (service): ", err);
    throw err;
  }
}
