import {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  getPropertiesByOwnerId,
  getPropertiesByManagerId,
  addPropertyManager,
  removePropertyManager,
  getPropertyManagers,
} from "../services/userService.js";
import { generateToken } from "../middleware/auth.js";

export async function register(req, res) {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

    const user = await registerUser({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: role || "offline_customer",
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (err) {
    console.error("Error in register controller:", err);
    res.status(400).json({ message: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await loginUser(email, password);
    const token = generateToken(user);

    res.json({
      message: "Login successful",
      user,
      token,
    });
  } catch (err) {
    console.error("Error in login controller:", err);
    res.status(401).json({ message: err.message });
  }
}

export async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const user = await getUserById(userId);

    res.json({ user });
  } catch (err) {
    console.error("Error in getProfile controller:", err);
    res.status(404).json({ message: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email, phone } = req.body;

    const user = await updateUser(userId, {
      firstName,
      lastName,
      email,
      phone,
    });

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    console.error("Error in updateProfile controller:", err);
    res.status(400).json({ message: err.message });
  }
}

export async function getMyProperties(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let properties;

    if (userRole === "property_owner") {
      properties = await getPropertiesByOwnerId(userId);
    } else if (userRole === "manager") {
      properties = await getPropertiesByManagerId(userId);
    } else {
      return res
        .status(403)
        .json({
          message: "Only property owners and managers can view properties",
        });
    }

    res.json({ properties });
  } catch (err) {
    console.error("Error in getMyProperties controller:", err);
    res.status(500).json({ message: err.message });
  }
}

export async function assignManager(req, res) {
  try {
    const { propertyId, managerId } = req.body;

    if (!propertyId || !managerId) {
      return res
        .status(400)
        .json({ message: "Property ID and Manager ID are required" });
    }

    const assignment = await addPropertyManager(propertyId, managerId);

    res.status(201).json({
      message: "Manager assigned successfully",
      assignment,
    });
  } catch (err) {
    console.error("Error in assignManager controller:", err);
    res.status(400).json({ message: err.message });
  }
}

export async function unassignManager(req, res) {
  try {
    const { propertyId, managerId } = req.body;

    if (!propertyId || !managerId) {
      return res
        .status(400)
        .json({ message: "Property ID and Manager ID are required" });
    }

    await removePropertyManager(propertyId, managerId);

    res.json({ message: "Manager unassigned successfully" });
  } catch (err) {
    console.error("Error in unassignManager controller:", err);
    res.status(400).json({ message: err.message });
  }
}

export async function getManagers(req, res) {
  try {
    const { propertyId } = req.params;

    const managers = await getPropertyManagers(propertyId);

    res.json({ managers });
  } catch (err) {
    console.error("Error in getManagers controller:", err);
    res.status(500).json({ message: err.message });
  }
}
