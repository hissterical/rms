// API configuration and helper functions
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Helper to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

interface Room {
  id: string;
  room_number: string;
  floor: number;
  status: "available" | "reserved" | "occupied" | "maintenance";
  booking_id?: string;
  room_type_name?: string;
  capacity?: number;
  price?: number;
  room_type_description?: string;
  start_date?: string;
  end_date?: string;
  booking_status?: string;
  guest_first_name?: string;
  guest_last_name?: string;
  guest_email?: string;
  guest_phone?: string;
}

interface CreateRoomData {
  property_id: string;
  room_type_id?: string;
  room_number: string;
  floor?: number;
  status?: "available" | "reserved" | "occupied" | "maintenance";
}

interface UpdateRoomData {
  room_type_id?: string;
  room_number?: string;
  floor?: number;
  status?: "available" | "reserved" | "occupied" | "maintenance";
  booking_id?: string;
}

// Room API functions
export const roomAPI = {
  // Get all rooms for a property
  getAllRooms: async (propertyId: string): Promise<Room[]> => {
    const response = await fetch(
      `${API_BASE_URL}/rooms?property_id=${propertyId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch rooms");
    }
    return response.json();
  },

  // Get single room by ID
  getRoomById: async (roomId: string): Promise<Room> => {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch room");
    }
    return response.json();
  },

  // Create new room
  createRoom: async (roomData: CreateRoomData): Promise<Room> => {
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roomData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create room");
    }
    return response.json();
  },

  // Update room
  updateRoom: async (
    roomId: string,
    roomData: UpdateRoomData
  ): Promise<Room> => {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roomData),
    });
    if (!response.ok) {
      throw new Error("Failed to update room");
    }
    return response.json();
  },

  // Update room status only
  updateRoomStatus: async (roomId: string, status: string): Promise<Room> => {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error("Failed to update room status");
    }
    return response.json();
  },

  // Delete room
  deleteRoom: async (roomId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete room");
    }
  },

  // Get available rooms for date range
  getAvailableRooms: async (
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<Room[]> => {
    const response = await fetch(
      `${API_BASE_URL}/rooms/available?property_id=${propertyId}&start_date=${startDate}&end_date=${endDate}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch available rooms");
    }
    return response.json();
  },

  // Bulk create rooms
  bulkCreateRooms: async (
    propertyId: string,
    rooms: CreateRoomData[]
  ): Promise<Room[]> => {
    const response = await fetch(`${API_BASE_URL}/rooms/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ property_id: propertyId, rooms }),
    });
    if (!response.ok) {
      throw new Error("Failed to bulk create rooms");
    }
    return response.json();
  },
};

export type { Room, CreateRoomData, UpdateRoomData };
