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
