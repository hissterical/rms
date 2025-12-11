// API configuration and helper functions
const API_BASE_URL =
  `${process.env.NEXT_PUBLIC_API_URL}/api` || "http://localhost:5000/api";

// Helper to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface Property {
  id: string;
  name: string;
  address: string;
  description?: string;
  property_type: "Hotel" | "Resort" | "Guesthouse" | "Hostel" | "Apartment";
  phone?: string;
  website?: string;
  main_image_url?: string;
  owner_id: string;
  created_at: string;
}

export interface CreatePropertyData {
  name: string;
  address: string;
  description?: string;
  property_type: "Hotel" | "Resort" | "Guesthouse" | "Hostel" | "Apartment";
  phone?: string;
  website?: string;
  main_image_url?: string;
  numberOfFloors?: number;
  roomsPerFloor?: number;
}

export interface Manager {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  assigned_at: string;
}

// Property API functions
export const propertyAPI = {
  // Get all properties for the authenticated user (owner or manager)
  getMyProperties: async (): Promise<Property[]> => {
    const response = await fetch(`${API_BASE_URL}/users/my-properties`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch properties");
    }
    const data = await response.json();
    return data.properties;
  },

  // Get single property by ID
  getPropertyById: async (propertyId: string): Promise<Property> => {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch property");
    }
    const result = await response.json();
    return result.data || result;
  },

  // Create new property (property owners only)
  createProperty: async (
    propertyData: CreatePropertyData
  ): Promise<Property> => {
    const response = await fetch(`${API_BASE_URL}/properties`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(propertyData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create property");
    }
    return response.json();
  },

  // Update property
  updateProperty: async (
    propertyId: string,
    propertyData: Partial<CreatePropertyData>
  ): Promise<Property> => {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(propertyData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update property");
    }
    return response.json();
  },

  // Delete property
  deleteProperty: async (propertyId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete property");
    }
  },

  // Get managers for a property
  getPropertyManagers: async (propertyId: string): Promise<Manager[]> => {
    const response = await fetch(
      `${API_BASE_URL}/users/properties/${propertyId}/managers`,
      {
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch managers");
    }
    const data = await response.json();
    return data.managers;
  },

  // Assign manager to property (property owners only)
  assignManager: async (
    propertyId: string,
    managerEmail: string
  ): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/users/properties/${propertyId}/managers`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ managerEmail }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to assign manager");
    }
  },

  // Unassign manager from property (property owners only)
  unassignManager: async (
    propertyId: string,
    managerId: string
  ): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/users/properties/${propertyId}/managers`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ propertyId, managerId }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to unassign manager");
    }
  },
};
