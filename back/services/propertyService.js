import pool from "../config/db.js";

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

export async function getPropertyByIdService(propertyId) {
  const query = `SELECT * FROM properties WHERE id = $1;`;
  const values = [propertyId];
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    console.error("Error fetching property by ID (service): ", err);
    throw err;
  }
}

export async function updatePropertyService(propertyId, fields) {
  delete fields.owner_id; // Prevent updating owner_id

  // Only certain columns can be updated
  const allowedFields = [
    "name",
    "address",
    "description",
    "property_type",
    "phone",
    "website",
    "main_image_url",
  ];

  const filteredFields = Object.fromEntries(
    Object.entries(fields).filter(([key]) => allowedFields.includes(key))
  );

  const keys = Object.keys(filteredFields);
  if (keys.length === 0) return null;

  // Dynamically generate set clause
  const setString = keys.map((key, idx) => `${key} = $${idx + 1}`).join(", ");
  const values = Object.values(filteredFields);

  const query = `UPDATE properties SET ${setString} WHERE id = $${keys.length + 1} RETURNING *`;

  const result = await pool.query(query, [...values, propertyId]);
  return result.rows[0];
}
