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
