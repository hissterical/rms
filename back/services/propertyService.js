import pool from "../config/db.js";

//change to throw errors not return http data
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

  if (!name || !address || !property_type || !owner_id) {
    throw new Error("Missing required fields for creating property");
  }

  const query = `
    INSERT INTO properties (
      name, address, description, property_type, phone, website, main_image_url, owner_id
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
    RETURNING *;
  `;

  const values = [
    name,
    address,
    description || null,
    property_type,
    phone || null,
    website || null,
    main_image_url || null,
    owner_id,
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    console.error("Error creating property (service): ", err);
    throw err;
  }
}

export async function getPropertyByIdService(propertyId, ownerId) {
  const query = `SELECT * FROM properties WHERE id = $1 AND owner_id = $2;`;
  const values = [propertyId, ownerId];
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    console.error("Error fetching property by ID (service): ", err);
    throw err;
  }
}

export async function updatePropertyService(propertyId, fields, ownerId) {
  delete fields.owner_id;

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
  if ("owner_id" in fields) {
    throw new Error("Cannot update owner_id");
  }

  const keys = Object.keys(filteredFields);
  if (keys.length === 0) {
    throw new Error("No valid fields to update");
  }

  const setString = keys.map((key, idx) => `${key} = $${idx + 1}`).join(", ");
  const values = Object.values(filteredFields);

  const query = `
    UPDATE properties 
    SET ${setString}
    WHERE id = $${keys.length + 1} 
      AND owner_id = $${keys.length + 2}
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [...values, propertyId, ownerId]);

    if (result.rowCount === 0) {
      throw new Error("Property not found or unauthorized");
    }

    return result.rows[0];
  } catch (err) {
    console.error(`Error updating property ID ${propertyId}:`, err);
    throw err;
  }
}

// export async function getAllPropertiesService(filters) {}

export async function deletePropertyService(propertyId, ownerId) {
  //need owner id
  const query = `DELETE FROM properties WHERE id=$1 AND owner_id = $2 RETURNING *;`;
  const values = [propertyId, ownerId];
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    console.error("Error deleting property by ID (service): ", err);
    throw err;
  }
}

export async function createRoomService(roomData) {
  const { property_id, owner_id, room_type_id, room_number, floor, status } =
    roomData;

  try {
    // Verify property exists & belongs to owner
    const propertyQuery = `
      SELECT id, owner_id 
      FROM properties 
      WHERE id = $1
      LIMIT 1;
    `;
    const propertyResult = await pool.query(propertyQuery, [property_id]);

    if (propertyResult.rowCount === 0) {
      throw new Error("Property not found");
    }

    if (propertyResult.rows[0].owner_id !== owner_id) {
      throw new Error("Unauthorized");
    }

    const allowedFields = [
      "property_id",
      "room_type_id",
      "room_number",
      "floor",
      "status",
    ];

    const filteredData = Object.fromEntries(
      Object.entries(roomData).filter(([k]) => allowedFields.includes(k))
    );

    const keys = Object.keys(filteredData);
    const values = Object.values(filteredData);

    const insertQuery = `
      INSERT INTO rooms (${keys.join(", ")})
      VALUES (${keys.map((_, i) => `$${i + 1}`).join(", ")})
      RETURNING id, ${keys.join(", ")};
    `;

    const result = await pool.query(insertQuery, values);

    return result.rows[0];
  } catch (err) {
    throw err;
  }
}

export async function getRoomsService(propertyId, ownerId) {
  const query = `
    SELECT 
      r.id,
      r.room_number,
      r.floor,
      r.status,
      r.room_type_id
    FROM rooms r
    JOIN properties p ON r.property_id = p.id
    WHERE r.property_id = $1
      AND p.owner_id = $2;
  `;

  try {
    const result = await pool.query(query, [propertyId, ownerId]);
    return result.rows;
  } catch (err) {
    console.error("Error fetching rooms (service):", err);
    throw err;
  }
}

export async function updateRoomService(roomId, propertyId, fields, ownerId) {
  const checkQuery = `
    SELECT r.id, r.property_id, p.owner_id
    FROM rooms r
    JOIN properties p ON r.property_id = p.id
    WHERE r.id = $1 AND r.property_id = $2
  `;

  const checkResult = await pool.query(checkQuery, [roomId, propertyId]);
  if (checkResult.rowCount === 0) throw new Error("Room not found");
  if (checkResult.rows[0].owner_id !== ownerId) throw new Error("Unauthorized");

  const allowedFields = ["room_type_id", "room_number", "floor", "status"];
  const filteredFields = Object.fromEntries(
    Object.entries(fields).filter(([k]) => allowedFields.includes(k))
  );

  if (Object.keys(filteredFields).length === 0)
    throw new Error("No valid fields to update");

  const keys = Object.keys(filteredFields);
  const values = Object.values(filteredFields);
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");

  const updateQuery = `
    UPDATE rooms
    SET ${setClause}
    WHERE id = $${keys.length + 1} AND property_id = $${keys.length + 2}
    RETURNING id, property_id, room_type_id, room_number, floor, status;
  `;

  const result = await pool.query(updateQuery, [...values, roomId, propertyId]);
  return result.rows[0];
}

export async function deleteRoomService(propertyId, roomId, ownerId) {
  //ownerId or manager id
  const query = `
    DELETE FROM rooms
    USING properties
    WHERE rooms.id = $1
      AND rooms.property_id = $2
      AND properties.id = rooms.property_id
      AND properties.owner_id = $3
    RETURNING rooms.*;
  `;

  try {
    const result = await pool.query(query, [roomId, propertyId, ownerId]);
    return result.rows[0];
  } catch (err) {
    console.error("Error deleting room by ID (service): ", err);
    throw err;
  }
}

export async function createRoomTypeService(roomTypeData) {
  const {
    property_id,
    room_type_name,
    description,
    capacity,
    price,
    owner_id,
  } = roomTypeData;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const propertyCheckQuery = `
      SELECT id FROM properties
      WHERE id = $1 AND owner_id = $2
      LIMIT 1;
    `;
    const propertyCheck = await client.query(propertyCheckQuery, [
      property_id,
      owner_id,
    ]);

    if (propertyCheck.rowCount === 0) {
      throw new Error("Property not found or does not belong to this owner");
    }

    const insertQuery = `
      INSERT INTO room_types (property_id, room_type_name, description, capacity, price)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, property_id, room_type_name, description, capacity, price;
    `;

    const values = [
      property_id,
      room_type_name,
      description || null,
      capacity,
      price,
    ];

    const result = await client.query(insertQuery, values);

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in createRoomTypeService:", error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getRoomTypesService(propertyId, ownerId) {
  const query = `
    SELECT 
      rt.id,
      rt.room_type_name,
      rt.description,
      rt.capacity,
      rt.price
    FROM room_types rt
    JOIN properties p ON rt.property_id = p.id
    WHERE rt.property_id = $1
      AND p.owner_id = $2;
  `;

  try {
    const result = await pool.query(query, [propertyId, ownerId]);
    return result.rows;
  } catch (err) {
    console.error("Error fetching room types (service):", err);
    throw err;
  }
}

export async function updateRoomTypeService(roomTypeId, fields, ownerId) {
  try {
    const checkQuery = `
      SELECT rt.id, rt.property_id, p.owner_id
      FROM room_types rt
      JOIN properties p ON rt.property_id = p.id
      WHERE rt.id = $1
    `;

    const checkResult = await pool.query(checkQuery, [roomTypeId]);

    if (checkResult.rowCount === 0) throw new Error("Room type not found");
    if (checkResult.rows[0].owner_id !== ownerId)
      throw new Error("Unauthorized");

    const allowed = ["room_type_name", "description", "capacity", "price"];
    const filtered = Object.fromEntries(
      Object.entries(fields).filter(([k]) => allowed.includes(k))
    );

    if (Object.keys(filtered).length === 0)
      throw new Error("No fields to update");

    const keys = Object.keys(filtered);
    const values = Object.values(filtered);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");

    const updateQuery = `
      UPDATE room_types
      SET ${setClause}
      WHERE id = $${keys.length + 1}
      RETURNING id, property_id, room_type_name, description, capacity, price;
    `;

    const result = await pool.query(updateQuery, [...values, roomTypeId]);
    return result.rows[0];
  } catch (err) {
    throw err;
  }
}

export async function deleteRoomTypeService(propertyId, roomTypeId, ownerId) {
  const query = `
    DELETE FROM room_types
    USING properties
    WHERE room_types.id = $1
      AND room_types.property_id = $2
      AND properties.id = room_types.property_id
      AND properties.owner_id = $3
    RETURNING room_types.*;
  `;

  const values = [roomTypeId, propertyId, ownerId];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    console.error("Error deleting room type (service):", err);
    throw err;
  }
}
