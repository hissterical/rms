"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useCurrentProperty } from "@/contexts/current-property-context";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PropertyRoomDetailModal } from "@/components/property-room-detail-modal";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Bed,
  MapPin,
  Phone,
  Globe,
  Settings,
  ArrowLeft,
  Building,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
  room_type: string;
  capacity: number;
  price: number;
  property_id: string;
}

interface RoomType {
  id: string;
  room_type_name: string;
  description: string;
  capacity: number;
  price: number;
  property_id: string;
}

interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  occupancyRate: number;
}

export default function PropertyDashboard() {
  const { currentProperty } = useCurrentProperty();
  const { user } = useAuth();
  const params = useParams();
  const propertyId = params.propertyId as string;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    maintenanceRooms: 0,
    occupancyRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomModalOpen, setRoomModalOpen] = useState(false);

  console.log("Dashboard - currentProperty:", currentProperty);
  console.log("Dashboard - rooms:", rooms);
  console.log("Dashboard - stats:", stats);

  const isOwner = user?.role === "property_owner";

  useEffect(() => {
    if (propertyId) {
      loadDashboardData();
    }
  }, [propertyId]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch rooms
      const roomsResponse = await fetch(
        `${API_BASE_URL}/properties/${propertyId}/rooms`,
        { headers: getAuthHeaders() }
      );
      if (roomsResponse.ok) {
        const roomsData = await roomsResponse.json();
        console.log("Rooms API response:", roomsData);
        const roomsList = roomsData.data || roomsData.rooms || [];
        setRooms(roomsList);
        calculateStats(roomsList);
      } else {
        console.error("Failed to fetch rooms:", roomsResponse.status);
      }

      // Fetch room types
      const roomTypesResponse = await fetch(
        `${API_BASE_URL}/properties/${propertyId}/roomtypes`,
        { headers: getAuthHeaders() }
      );
      if (roomTypesResponse.ok) {
        const roomTypesData = await roomTypesResponse.json();
        console.log("Room types API response:", roomTypesData);
        const roomTypesList =
          roomTypesData.data || roomTypesData.roomTypes || [];
        setRoomTypes(roomTypesList);
      } else {
        console.error("Failed to fetch room types:", roomTypesResponse.status);
      }
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (roomsList: Room[]) => {
    const totalRooms = roomsList.length;
    const occupiedRooms = roomsList.filter(
      (r) => r.status === "occupied"
    ).length;
    const availableRooms = roomsList.filter(
      (r) => r.status === "available"
    ).length;
    const maintenanceRooms = roomsList.filter(
      (r) => r.status === "maintenance"
    ).length;
    const occupancyRate =
      totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    setStats({
      totalRooms,
      occupiedRooms,
      availableRooms,
      maintenanceRooms,
      occupancyRate,
    });
  };

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setRoomModalOpen(true);
  };

  const handleRoomUpdated = () => {
    // Reload dashboard data after room update
    loadDashboardData();
  };

  if (!currentProperty) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/properties">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Properties
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">
                    {currentProperty.name}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {currentProperty.property_type}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOwner && (
                <Link href={`/${propertyId}/settings`}>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
          </div>
        ) : (
          <>
            {/* Property Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Property Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Address</p>
                        <p className="text-sm text-muted-foreground">
                          {currentProperty.address}
                        </p>
                      </div>
                    </div>

                    {currentProperty.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Phone</p>
                          <p className="text-sm text-muted-foreground">
                            {currentProperty.phone}
                          </p>
                        </div>
                      </div>
                    )}

                    {currentProperty.website && (
                      <div className="flex items-start gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Website</p>
                          <a
                            href={currentProperty.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {currentProperty.website}
                          </a>
                        </div>
                      </div>
                    )}

                    {currentProperty.description && (
                      <div className="flex items-start gap-3 md:col-span-2">
                        <div className="w-full">
                          <p className="text-sm font-medium mb-1">
                            Description
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {currentProperty.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Dashboard Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Rooms
                    </CardTitle>
                    <Bed className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalRooms}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.availableRooms} available
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Occupancy Rate
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.occupancyRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.occupiedRooms} occupied
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Room Types
                    </CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{roomTypes.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Different room categories
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Maintenance
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.maintenanceRooms}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Rooms under maintenance
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href={`/${propertyId}/room-management`}>
                      <Button className="w-full" variant="outline">
                        <Bed className="h-4 w-4 mr-2" />
                        Manage Rooms
                      </Button>
                    </Link>
                    <Link href={`/${propertyId}/check-in`}>
                      <Button className="w-full" variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Check-in Guest
                      </Button>
                    </Link>
                    {isOwner && (
                      <Link href={`/${propertyId}/settings`}>
                        <Button className="w-full" variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Property Settings
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Live Room Viewer */}
            {rooms.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mb-8"
              >
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                          Live Building View 🏨
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Real-time room status • {stats.totalRooms} Rooms
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-slate-200 border-2 border-slate-400"></div>
                          <span className="text-xs text-muted-foreground">
                            Available
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-blue-200 border-2 border-blue-400"></div>
                          <span className="text-xs text-muted-foreground">
                            Reserved
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-slate-700 border-2 border-slate-800"></div>
                          <span className="text-xs text-muted-foreground">
                            Occupied
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-gray-400 border-2 border-gray-500"></div>
                          <span className="text-xs text-muted-foreground">
                            Maintenance
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 bg-gradient-to-b from-slate-50 to-slate-100">
                    {/* Building Structure */}
                    <div className="w-full max-w-7xl mx-auto">
                      <div className="relative transform-gpu">
                        {/* Building Shadow */}
                        <div className="absolute -bottom-2 -right-4 w-full h-full bg-gray-400 opacity-20 rounded-lg transform rotate-1 blur-sm"></div>

                        {/* Main Building */}
                        <div className="relative bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 rounded-lg shadow-2xl border border-gray-300 overflow-hidden">
                          {/* Building Roof */}
                          <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="h-12 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 relative"
                          >
                            <div className="absolute inset-0 flex items-center justify-center gap-4">
                              <div className="w-3 h-8 bg-gray-500 rounded-t shadow-md"></div>
                              <div className="w-2 h-10 bg-gray-400 rounded-t shadow-md"></div>
                              <div className="w-4 h-6 bg-gray-600 rounded shadow-md"></div>
                              <div className="w-2 h-8 bg-gray-400 rounded-t shadow-md"></div>
                              <div className="w-3 h-8 bg-gray-500 rounded-t shadow-md"></div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-800 to-gray-700"></div>
                          </motion.div>

                          {/* Floors Container */}
                          <div className="relative">
                            {(() => {
                              // Group rooms by floor
                              const roomsByFloor = rooms.reduce((acc, room) => {
                                const floor = room.floor || 1;
                                if (!acc[floor]) acc[floor] = [];
                                acc[floor].push(room);
                                return acc;
                              }, {} as Record<number, Room[]>);

                              const floors = Object.keys(roomsByFloor)
                                .map(Number)
                                .sort((a, b) => b - a); // Descending order

                              return floors.map((floor, floorIndex) => {
                                const floorRooms = roomsByFloor[floor];
                                const roomStatusColors = {
                                  available: "bg-slate-200 border-slate-400",
                                  reserved: "bg-blue-200 border-blue-400",
                                  occupied: "bg-slate-700 border-slate-800",
                                  maintenance: "bg-gray-400 border-gray-500",
                                };

                                return (
                                  <motion.div
                                    key={floor}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      duration: 0.4,
                                      delay: floorIndex * 0.05,
                                    }}
                                    className="relative flex items-center border-b border-gray-300 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 hover:from-gray-150 hover:via-gray-100 hover:to-gray-150 transition-all duration-500"
                                    style={{
                                      height: `${Math.max(
                                        60,
                                        Math.min(
                                          100,
                                          80 -
                                            (floors.length > 8
                                              ? (floors.length - 8) * 5
                                              : 0)
                                        )
                                      )}px`,
                                    }}
                                  >
                                    {/* Floor Number Panel */}
                                    <div className="relative w-28 h-full bg-gradient-to-br from-gray-600 to-gray-800 text-white flex items-center justify-center font-bold shadow-lg border-r-2 border-gray-500">
                                      <div className="text-center">
                                        <div className="text-xs opacity-75 font-normal">
                                          Floor
                                        </div>
                                        <div className="text-xl font-bold">
                                          {floor}
                                        </div>
                                      </div>
                                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-white/20 to-transparent"></div>
                                    </div>

                                    {/* Elevator Shaft */}
                                    <div className="w-14 h-full bg-gradient-to-br from-gray-700 to-gray-900 border-r border-gray-600 flex items-center justify-center relative">
                                      <div className="w-6 h-8 bg-gradient-to-b from-gray-300 to-gray-400 rounded border border-gray-500 flex items-center justify-center">
                                        <div className="w-2 h-4 bg-gray-200 rounded-sm"></div>
                                      </div>
                                    </div>

                                    {/* Central Hallway */}
                                    <div className="w-18 h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 border-r border-gray-300 flex items-center justify-center relative">
                                      <div className="w-2 h-12 bg-gray-400 rounded-full shadow-inner"></div>
                                    </div>

                                    {/* Rooms Layout */}
                                    <div className="flex-1 flex justify-center px-3 py-2 relative">
                                      <div className="flex gap-1.5 flex-wrap justify-center max-w-full">
                                        {floorRooms.map((room, roomIndex) => (
                                          <motion.div
                                            key={room.id}
                                            initial={{ opacity: 0, scale: 0.7 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{
                                              duration: 0.3,
                                              delay:
                                                floorIndex * 0.05 +
                                                roomIndex * 0.02,
                                              type: "spring",
                                              stiffness: 200,
                                            }}
                                            whileHover={{ scale: 1.08, y: -3 }}
                                            onClick={() =>
                                              handleRoomClick(room)
                                            }
                                            className={`
                                              relative ${
                                                floorRooms.length > 8
                                                  ? "w-16 h-14"
                                                  : floorRooms.length > 6
                                                  ? "w-20 h-16"
                                                  : "w-24 h-18"
                                              } rounded-lg cursor-pointer shadow-lg border-2 border-white
                                              ${
                                                roomStatusColors[room.status] ||
                                                roomStatusColors.available
                                              }
                                              hover:shadow-xl transition-all duration-300 transform-gpu
                                            `}
                                            title={`Room ${
                                              room.room_number
                                            } - ${room.status} - ${
                                              room.room_type || "Standard"
                                            } - Click to manage`}
                                          >
                                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                              <span
                                                className={`${
                                                  floorRooms.length > 8
                                                    ? "text-[10px]"
                                                    : "text-xs"
                                                } font-bold ${
                                                  room.status === "available" ||
                                                  room.status === "reserved"
                                                    ? "text-slate-800"
                                                    : "text-white"
                                                } drop-shadow-lg`}
                                              >
                                                {room.room_number}
                                              </span>
                                              {room.status === "occupied" && (
                                                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1 animate-pulse"></div>
                                              )}
                                            </div>

                                            {/* Window Effect */}
                                            <div className="absolute top-1 right-1 w-3 h-2 bg-blue-100 rounded border border-gray-400"></div>

                                            {/* Door Effect */}
                                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-3 bg-gray-700 rounded-t"></div>
                                          </motion.div>
                                        ))}
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              });
                            })()}
                          </div>

                          {/* Grand Lobby */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="h-24 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-400/20 to-gray-800/30"></div>
                            <div className="relative flex items-center justify-center h-full">
                              <div className="flex items-center gap-4 text-white">
                                <Bed className="h-6 w-6 drop-shadow-lg" />
                                <span className="text-xl font-bold drop-shadow-lg">
                                  LOBBY & RECEPTION
                                </span>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800"></div>
                          </motion.div>
                        </div>

                        {/* Building Foundation */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 1 }}
                          className="h-6 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-gray-400/50 to-gray-800/50"></div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800"></div>
                        </motion.div>

                        {/* Ground */}
                        <div className="h-8 bg-gradient-to-r from-teal-400 via-teal-300 to-teal-400 relative overflow-hidden rounded-b-lg">
                          <div className="absolute inset-0 bg-gradient-to-b from-green-200/50 to-green-600/30"></div>
                          <div className="absolute bottom-0 left-8 w-3 h-6 bg-green-600 rounded-t"></div>
                          <div className="absolute bottom-0 right-12 w-2 h-4 bg-green-600 rounded-t"></div>
                          <div className="absolute bottom-0 left-1/3 w-4 h-5 bg-green-600 rounded-t"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* Room Detail Modal */}
      <PropertyRoomDetailModal
        room={selectedRoom}
        open={roomModalOpen}
        onOpenChange={setRoomModalOpen}
        onRoomUpdated={handleRoomUpdated}
      />
    </div>
  );
}
