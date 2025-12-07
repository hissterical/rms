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
    numberOfFloors,
    roomsPerFloor,
  } = data;

  if (!name || !address || !property_type || !owner_id) {
    throw new Error("Missing required fields for creating property");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Create the property
    const propertyQuery = `
      INSERT INTO properties (
        name, address, description, property_type, phone, website, main_image_url, owner_id
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *;
    `;

    const propertyValues = [
      name,
      address,
      description || null,
      property_type,
      phone || null,
      website || null,
      main_image_url || null,
      owner_id,
    ];

    // console.log("Creating property with data:", {
    //   name,
    //   address,
    //   property_type,
    //   numberOfFloors,
    //   roomsPerFloor,
    // });

    const propertyResult = await client.query(propertyQuery, propertyValues);
    const newProperty = propertyResult.rows[0];

    // Create rooms if numberOfFloors and roomsPerFloor are provided
    if (
      numberOfFloors &&
      roomsPerFloor &&
      numberOfFloors > 0 &&
      roomsPerFloor > 0
    ) {
      // console.log(`Creating ${numberOfFloors * roomsPerFloor} rooms...`);

      const roomInserts = [];
      for (let floor = 1; floor <= numberOfFloors; floor++) {
        for (let roomNum = 1; roomNum <= roomsPerFloor; roomNum++) {
          const roomNumber = `${floor}${roomNum.toString().padStart(2, "0")}`;
          roomInserts.push(
            client.query(
              `INSERT INTO rooms (property_id, room_number, floor, status) 
               VALUES ($1, $2, $3, $4)`,
              [newProperty.id, roomNumber, floor, "available"]
            )
          );
        }
      }

      await Promise.all(roomInserts);
      // console.log(`Successfully created ${roomInserts.length} rooms`);
    }

    await client.query("COMMIT");
    return newProperty;
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating property (service): ", err);
    throw err;
  } finally {
    client.release();
  }
}

export async function getPropertyByIdService(propertyId, userId) {
  const query = `
    SELECT DISTINCT p.* 
    FROM properties p
    LEFT JOIN property_managers pm ON p.id = pm.property_id
    WHERE p.id = $1 
      AND (p.owner_id = $2 OR pm.manager_id = $2)
    LIMIT 1;
  `;
  const values = [propertyId, userId];
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
  // NOTE: Using room_type (text) directly instead of room_type_id for now
  // This simplifies room creation without requiring room type management
  // TODO: Implement proper room type management with room_types table relationship
  const {
    property_id,
    owner_id,
    room_type,
    capacity,
    price,
    room_number,
    floor,
    status,
  } = roomData;

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
      "room_type",
      "capacity",
      "price",
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

export async function getRoomsService(propertyId, userId) {
  // console.log("getRoomsService called with:", { propertyId, userId });

  // NOTE: Fetching room_type (text) directly from rooms table
  // room_type_id exists but is not used yet - it's for future room type management
  // capacity and price are also stored directly on rooms for simplicity
  const query = `
    SELECT DISTINCT
      r.id,
      r.room_number,
      r.floor,
      r.status,
      r.room_type,
      r.capacity,
      r.price,
      r.property_id
    FROM rooms r
    JOIN properties p ON r.property_id = p.id
    LEFT JOIN property_managers pm ON p.id = pm.property_id
    WHERE r.property_id = $1
      AND (p.owner_id = $2 OR pm.manager_id = $2);
  `;

  try {
    const result = await pool.query(query, [propertyId, userId]);
    // console.log("getRoomsService query result:", {
    //   rowCount: result.rowCount,
    //   rows: result.rows,
    // });
    return result.rows;
  } catch (err) {
    console.error("Error fetching rooms (service):", err);
    throw err;
  }
}

export async function updateRoomService(roomId, propertyId, fields, ownerId) {
  // Verify room exists and user has permission
  const checkQuery = `
    SELECT r.id, r.property_id, p.owner_id
    FROM rooms r
    JOIN properties p ON r.property_id = p.id
    WHERE r.id = $1 AND r.property_id = $2
  `;

  const checkResult = await pool.query(checkQuery, [roomId, propertyId]);
  if (checkResult.rowCount === 0) throw new Error("Room not found");
  if (checkResult.rows[0].owner_id !== ownerId) throw new Error("Unauthorized");

  // NOTE: Using room_type (text), capacity, and price directly on rooms table
  // room_type_id column exists in schema but is not used yet
  // This allows updating rooms without implementing full room type management
  const allowedFields = [
    "room_type",
    "capacity",
    "price",
    "room_number",
    "floor",
    "status",
  ];
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
    RETURNING id, property_id, room_number, floor, status, room_type, capacity, price;
  `;

  // NOTE: room_type_id column was removed from RETURNING clause
  // We're using room_type (text) directly for now instead of the foreign key
  // TODO: When implementing proper room type management:
  //   1. Create UI for managing room_types table
  //   2. Update this to use room_type_id instead of room_type text
  //   3. Join with room_types table to get room_type_name

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
