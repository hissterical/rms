//filter property based on location done on get all
import express from "express";
import { createPropertyService } from "../services/propertyService.js";

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
    //needs more validation
    if (!name) {
      return res.status(400).json({ message: "Property name is required" });
    }
    if (!owner_id) {
      return res.status(400).json({ message: "Owner ID is required" });
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
    console.error("Error creating property (controller): ", err);
    res.status(500).json({ message: "Failed to create property" });
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
