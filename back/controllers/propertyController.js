//filter property based on location done on get all

import {
  createPropertyService,
  getPropertyByIdService,
  updatePropertyService,
  deletePropertyService,
  createRoomService,
  getRoomsService,
  updateRoomService,
  deleteRoomService,
  createRoomTypeService,
  getRoomTypesService,
  updateRoomTypeService,
  deleteRoomTypeService,
} from "../services/propertyService.js";

export async function createProperty(req, res) {
  try {
    const {
      name,
      address,
      description,
      property_type,
      phone,
      website,
      main_image_url,
    } = req.body;
    const owner_id = req.user?.id;

    if (!name) {
      return res.status(400).json({ message: "Property name is required" });
    }
    if (!owner_id) {
      return res.status(400).json({ message: "Owner ID is required" });
    }

    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }

    const propertyData = {
      name,
      address,
      description,
      property_type,
      phone,
      website,
      main_image_url,
      owner_id,
    };
    const newProperty = await createPropertyService(propertyData);
    return res.status(201).json(newProperty);
  } catch (err) {
    console.error("Error creating property: ", err);
    return res.status(500).json({ message: "Failed to create property" });
  }
}

// export async function getAllProperties(req, res) {
//   try {
//     const { location, property_type, owner_id, search } = req.query;

//     const filters = {};
//     if (location) filters.location = location;
//     if (property_type) filters.property_type = property_type;
//     if (owner_id) filters.owner_id = owner_id;
//     if (search) filters.search = search;

//     const properties = await getAllPropertiesService(filters);

//     if (!properties || properties.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: "No properties found",
//         data: [],
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Properties retrieved successfully",
//       data: properties,
//     });
//   } catch (err) {
//     console.error("Error fetching all properties:", err);
//     return res
//       .status(500)
//       .json({ success: false, message: "Failed to fetch properties" });
//   }
// }

export async function getPropertyById(req, res) {
  try {
    const { propertyId } = req.params;
    const ownerId = req.user?.id;

    if (!propertyId) {
      return res
        .status(400)
        .json({ success: false, message: "Property ID is required" });
    }
    if (!ownerId) {
      //keep/ discard check based on auth middleware
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No owner ID found" });
    }

    const property = await getPropertyByIdService(propertyId, ownerId);
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Property retrieved", data: property });
  } catch (err) {
    console.error("Error fetching property: ", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch property" });
  }
}

export async function updateProperty(req, res) {
  const { propertyId } = req.params;
  const ownerId = req.user?.id;

  if (!ownerId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!propertyId) {
    return res
      .status(400)
      .json({ success: false, message: "Property ID is required" });
  }

  const fields = req.body;

  if (Object.keys(fields).length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No fields provided to update" });
  }

  try {
    const updatedProperty = await updatePropertyService(
      propertyId,
      fields,
      ownerId
    );

    return res.status(200).json({
      success: true,
      message: "Property updated successfully",
      data: updatedProperty,
    });
  } catch (err) {
    console.error("Error updating property:", err);

    const message = err.message || "Failed to update property";

    if (message.includes("not found")) {
      return res.status(404).json({ success: false, message });
    }
    if (message.includes("unauthorized")) {
      return res.status(403).json({ success: false, message });
    }

    return res.status(500).json({
      success: false,
      message,
    });
  }
}

export async function deleteProperty(req, res) {
  const { propertyId } = req.params;
  const ownerId = req.user?.id; //verify
  if (!propertyId) {
    return res
      .status(400)
      .json({ success: false, message: "Property ID is required" });
  }
  if (!ownerId) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No owner ID found" });
  }
  try {
    const deletedProperty = await deletePropertyService(propertyId, ownerId);
    if (!deletedProperty) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Property deleted successfully",
      data: deletedProperty,
    });
  } catch (err) {
    console.error("Error deleting property:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete Property" });
  }
}

//room specific
export async function createRoomByPropertyId(req, res) {
  const ownerId = req.user?.id;
  const { propertyId } = req.params;

  if (!ownerId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!propertyId) {
    return res
      .status(400)
      .json({ success: false, message: "PropertyId is required" });
  }

  const { room_type_id, room_number, floor, status } = req.body;

  if (!room_number) {
    return res
      .status(400)
      .json({ success: false, message: "Room number is required" });
  }
  if (!room_type_id) {
    return res
      .status(400)
      .json({ success: false, message: "Room type ID is required" });
  }

  try {
    const roomData = {
      property_id: propertyId,
      room_type_id,
      room_number,
      floor,
      status: status || "available",
      owner_id: ownerId,
    };

    const newRoom = await createRoomService(roomData);

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: newRoom,
    });
  } catch (err) {
    const msg = err.message;
    const status =
      msg === "Property not found" ? 404 : msg === "Unauthorized" ? 403 : 500;

    return res.status(status).json({ success: false, message: msg });
  }
}

export async function getRoomsByPropertyId(req, res) {
  const { propertyId } = req.params;
  const ownerId = req.user?.id;

  if (!ownerId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!propertyId) {
    return res
      .status(400)
      .json({ success: false, message: "PropertyId is required" });
  }

  try {
    const rooms = await getRoomsService(propertyId, ownerId);

    return res.status(200).json({
      success: true,
      message: rooms.length
        ? "Rooms retrieved successfully"
        : "No rooms found for this property",
      data: rooms,
    });
  } catch (err) {
    console.error(`Error fetching rooms for propertyId ${propertyId}:`, err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get rooms of property" });
  }
}

export async function updateRoomById(req, res) {
  const ownerId = req.user?.id;
  const { propertyId, roomId } = req.params;

  if (!ownerId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  if (!propertyId) {
    return res
      .status(400)
      .json({ success: false, message: "PropertyId is required" });
  }
  if (!roomId) {
    return res
      .status(400)
      .json({ success: false, message: "Room ID is required" });
  }

  const fields = req.body;
  if (Object.keys(fields).length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No fields provided" });
  }

  try {
    const updatedRoom = await updateRoomService(
      roomId,
      propertyId,
      fields,
      ownerId
    );

    return res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: updatedRoom,
    });
  } catch (err) {
    const msg = err.message;
    const status =
      msg === "Room not found"
        ? 404
        : msg === "Unauthorized"
          ? 403
          : msg === "No valid fields to update"
            ? 400
            : 500;

    return res.status(status).json({ success: false, message: msg });
  }
}

export async function deleteRoomById(req, res) {
  const { propertyId, roomId } = req.params;
  const ownerId = req.user?.id; // logged-in user

  if (!ownerId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!propertyId || !roomId) {
    return res.status(400).json({
      success: false,
      message: "Property ID and Room ID are required",
    });
  }

  try {
    const deletedRoom = await deleteRoomService(propertyId, roomId, ownerId);

    if (!deletedRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found or you do not have permission to delete it",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Room deleted successfully",
      data: deletedRoom,
    });
  } catch (err) {
    console.error(`Error deleting room ${roomId}:`, err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete room",
    });
  }
}

//Room Type controllers

export async function createRoomTypeByPropertyId(req, res) {
  const { propertyId } = req.params;
  if (!propertyId) {
    return res
      .status(400)
      .json({ success: false, message: "PropertyId is required" });
  }

  const { room_type_name, description, capacity, price } = req.body;
  const owner_id = req.user?.id; // authentication required

  if (!owner_id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  if (!room_type_name) {
    return res
      .status(400)
      .json({ success: false, message: "Room type name is required" });
  }
  if (!capacity) {
    return res
      .status(400)
      .json({ success: false, message: "Capacity is required" });
  }
  if (!price) {
    return res
      .status(400)
      .json({ success: false, message: "Price is required" });
  }

  try {
    const roomTypeData = {
      property_id: propertyId,
      room_type_name,
      description,
      capacity,
      price,
      owner_id,
    };

    const newRoomType = await createRoomTypeService(roomTypeData);

    return res.status(201).json({
      success: true,
      message: "Room type created successfully",
      data: newRoomType,
    });
  } catch (err) {
    console.error(
      `Error creating room type for propertyId ${propertyId}:`,
      err
    );

    const status = err.message.includes("Property not found") ? 404 : 500;

    return res.status(status).json({ success: false, message: err.message });
  }
}

export async function getRoomTypesByPropertyId(req, res) {
  const { propertyId } = req.params;
  const ownerId = req.user?.id;
  if (!propertyId) {
    return res
      .status(400)
      .json({ success: false, message: "PropertyId is required" });
  }
  if (!ownerId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const roomTypes = await getRoomTypesService(propertyId, ownerId);
    if (!roomTypes || roomTypes.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No room types found for this property",
        data: [],
      });
    }
    return res.status(200).json({
      success: true,
      message: "Room types retrieved successfully",
      data: roomTypes,
    });
  } catch (err) {
    console.error(
      `Error fetching room types for propertyId ${propertyId}:`,
      err
    );
    return res
      .status(500)
      .json({ success: false, message: "Failed to get room types" });
  }
}

export async function updateRoomTypeById(req, res) {
  const { roomTypeId } = req.params;
  const ownerId = req.user?.id;

  if (!ownerId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!roomTypeId) {
    return res
      .status(400)
      .json({ success: false, message: "Room Type ID is required" });
  }

  const fields = req.body;
  if (Object.keys(fields).length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No fields provided to update" });
  }

  try {
    await updateRoomTypeService(roomTypeId, fields, ownerId);

    return res.status(200).json({
      success: true,
      message: "Room type updated successfully",
    });
  } catch (err) {
    const msg = err.message;
    const status =
      msg === "Room type not found"
        ? 404
        : msg === "Unauthorized"
          ? 403
          : msg === "No fields to update"
            ? 400
            : 500;

    return res.status(status).json({ success: false, message: msg });
  }
}

export async function deleteRoomTypeById(req, res) {
  const { propertyId, roomTypeId } = req.params;
  const ownerId = req.user?.id;

  if (!ownerId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!propertyId) {
    return res.status(400).json({
      success: false,
      message: "PropertyId is required",
    });
  }

  if (!roomTypeId) {
    return res.status(400).json({
      success: false,
      message: "Room Type ID is required",
    });
  }

  try {
    const deletedRoomType = await deleteRoomTypeService(
      propertyId,
      roomTypeId,
      ownerId
    );

    if (!deletedRoomType) {
      return res.status(404).json({
        success: false,
        message:
          "Room type not found or you do not have permission to delete it",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Room type deleted successfully",
      data: deletedRoomType,
    });
  } catch (err) {
    console.error(`Error deleting room type ${roomTypeId}:`, err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete room type",
    });
  }
}

// Get all properties
export async function getAllProperties(req, res) {
  try {
    const { getAllPropertiesService } = await import("../services/propertyService.js");
    const properties = await getAllPropertiesService();
    res.status(200).json(properties);
  } catch (err) {
    console.error("Error getting all properties (controller):", err);
    res.status(500).json({ message: "Failed to fetch properties" });
  }
}

// Get property by ID
export async function getPropertyById(req, res) {
  try {
    const { id } = req.params;
    const { getPropertyByIdService } = await import("../services/propertyService.js");
    const property = await getPropertyByIdService(id);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    res.status(200).json(property);
  } catch (err) {
    console.error("Error getting property by ID (controller):", err);
    res.status(500).json({ message: "Failed to fetch property" });
  }
}

export async function updateProperty(req, res) {
  res.status(501).json({ message: "Not implemented yet" });
}

export async function deleteProperty(req, res) {
  res.status(501).json({ message: "Not implemented yet" });
}

export async function getRoomsByPropertyId(req, res) {
  res.status(501).json({ message: "Not implemented yet" });
}

export async function createRoomByPropertyId(req, res) {
  res.status(501).json({ message: "Not implemented yet" });
}

export async function updateRoomById(req, res) {
  res.status(501).json({ message: "Not implemented yet" });
}

export async function deleteRoomById(req, res) {
  res.status(501).json({ message: "Not implemented yet" });
}

export async function getRoomTypesByPropertyId(req, res) {
  res.status(501).json({ message: "Not implemented yet" });
}

export async function createRoomTypeByPropertyId(req, res) {
  res.status(501).json({ message: "Not implemented yet" });
}

export async function updateRoomTypeById(req, res) {
  res.status(501).json({ message: "Not implemented yet" });
}

export async function deleteRoomTypeById(req, res) {
  res.status(501).json({ message: "Not implemented yet" });
}
