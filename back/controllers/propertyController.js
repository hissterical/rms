//filter property based on location done on get all

import {
  createPropertyService,
  getPropertyByIdService,
  updatePropertyService,
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
      owner_id,
    } = req.body;

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
    res.status(201).json(newProperty);
  } catch (err) {
    console.error("Error creating property: ", err);
    res.status(500).json({ message: "Failed to create property" });
  }
}

export async function getAllProperties(req, res) {
  try {
    const { location, property_type, owner_id, search } = req.query;

    const filters = {};
    if (location) filters.location = location;
    if (property_type) filters.property_type = property_type;
    if (owner_id) filters.owner_id = owner_id;
    if (search) filters.search = search;

    const properties = await getAllPropertiesService(filters);

    if (!properties || properties.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No properties found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Properties retrieved successfully",
      data: properties,
    });
  } catch (err) {
    console.error("Error fetching all properties:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch properties" });
  }
}

export async function getPropertyById(req, res) {
  try {
    const { propertyId } = req.params;
    if (!propertyId) {
      return res
        .status(400)
        .json({ success: false, message: "Property ID is required" });
    }
    const property = await getPropertyByIdService(propertyId);
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
  if (!propertyId) {
    return res.status(400).json({ message: "Property ID is required" });
  }
  const fields = req.body;
  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ message: "No fields provided to update" });
  }
  try {
    const updatedProperty = await updatePropertyService(propertyId, fields);
    if (!updatedProperty) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }
    return res.status(200).json(updatedProperty);
  } catch (err) {
    console.error("Error updating property:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update property" });
  }
}

export async function deleteProperty(req, res) {
  const { propertyId } = req.params;
  if (!propertyId) {
    return res
      .status(400)
      .json({ success: false, message: "Property ID is required" });
  }
  try {
    const deletedProperty = await deletePropertyService(propertyId);
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
  const { propertyId } = req.params;
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
      booking_id: null, // null initially, set when room is booked
      room_number,
      floor,
      status: status || "available", // Default to available
    };

    const newRoom = await createRoomService(roomData);
    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: newRoom,
    });
  } catch (err) {
    console.error(`Error creating room for propertyId ${propertyId}:`, err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create room" });
  }
}

export async function getRoomsByPropertyId(req, res) {
  const { propertyId } = req.params;
  if (!propertyId) {
    return res
      .status(400)
      .json({ success: false, message: "PropertyId is required" });
  }
  try {
    const rooms = await getRoomsService(propertyId);
    if (!rooms || rooms.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No rooms found for this property",
        data: [],
      });
    }
    return res.status(200).json({
      success: true,
      message: "Rooms of property retrieved successfully",
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
  const { propertyId, roomId } = req.params;
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
      .json({ success: false, message: "No fields provided to update" });
  }
  try {
    const updatedRoom = await updateRoomService(roomId, fields);
    if (!updatedRoom) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: updatedRoom,
    });
  } catch (err) {
    console.error(`Error updating room ${roomId}:`, err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update room" });
  }
}

export async function deleteRoomById(req, res) {
  const { propertyId, roomId } = req.params;
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
  try {
    const deletedRoom = await deleteRoomService(roomId);
    if (!deletedRoom) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Room deleted successfully",
      data: deletedRoom,
    });
  } catch (err) {
    console.error(`Error deleting room ${roomId}:`, err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete room" });
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
    return res
      .status(500)
      .json({ success: false, message: "Failed to create room type" });
  }
}

export async function getRoomTypesByPropertyId(req, res) {
  const { propertyId } = req.params;
  if (!propertyId) {
    return res
      .status(400)
      .json({ success: false, message: "PropertyId is required" });
  }
  try {
    const roomTypes = await getRoomTypesService(propertyId);
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
  const { propertyId, roomTypeId } = req.params;
  if (!propertyId) {
    return res
      .status(400)
      .json({ success: false, message: "PropertyId is required" });
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
    const updatedRoomType = await updateRoomTypeService(roomTypeId, fields);
    if (!updatedRoomType) {
      return res
        .status(404)
        .json({ success: false, message: "Room type not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Room type updated successfully",
      data: updatedRoomType,
    });
  } catch (err) {
    console.error(`Error updating room type ${roomTypeId}:`, err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update room type" });
  }
}

export async function deleteRoomTypeById(req, res) {
  const { propertyId, roomTypeId } = req.params;
  if (!propertyId) {
    return res
      .status(400)
      .json({ success: false, message: "PropertyId is required" });
  }
  if (!roomTypeId) {
    return res
      .status(400)
      .json({ success: false, message: "Room Type ID is required" });
  }
  try {
    const deletedRoomType = await deleteRoomTypeService(roomTypeId);
    if (!deletedRoomType) {
      return res
        .status(404)
        .json({ success: false, message: "Room type not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Room type deleted successfully",
      data: deletedRoomType,
    });
  } catch (err) {
    console.error(`Error deleting room type ${roomTypeId}:`, err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete room type" });
  }
}
