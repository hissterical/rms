import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
}

// Middleware to authenticate requests
export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Middleware to check if user has required role
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
}

// Middleware to check if user is property owner or manager of a specific property
export async function requirePropertyAccess(req, res, next) {
  try {
    const propertyId = req.params.propertyId || req.body.property_id;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    // Import here to avoid circular dependency
    const pool = (await import("../config/db.js")).default;

    // Check if user is the owner
    if (userRole === "property_owner") {
      const ownerQuery = `SELECT id FROM properties WHERE id = $1 AND owner_id = $2;`;
      const ownerResult = await pool.query(ownerQuery, [propertyId, userId]);

      if (ownerResult.rows.length > 0) {
        req.isPropertyOwner = true;
        return next();
      }
    }

    // Check if user is a manager of this property
    if (userRole === "manager") {
      const managerQuery = `
        SELECT id FROM property_managers 
        WHERE property_id = $1 AND manager_id = $2;
      `;
      const managerResult = await pool.query(managerQuery, [
        propertyId,
        userId,
      ]);

      if (managerResult.rows.length > 0) {
        req.isPropertyManager = true;
        return next();
      }
    }

    return res
      .status(403)
      .json({ message: "You don't have access to this property" });
  } catch (err) {
    console.error("Error checking property access:", err);
    return res.status(500).json({ message: "Error checking property access" });
  }
}
