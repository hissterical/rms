"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useHotel } from "@/contexts/hotel-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoomDetailModal } from "@/components/room-detail-modal";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Bed,
  Clock,
  Star,
  MapPin,
  Phone,
  Mail,
  Wifi,
  Car,
  Coffee,
  Utensils,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

// Hotel summary data
const hotelData = {
  name: "Grand Aurelia Hotel",
  location: "Downtown, Prague",
  phone: "+420 123 456 789",
  email: "info@grandaurelia.com",
  rating: 4.8,
  totalRooms: 180,
  occupiedRooms: 127,
  occupancyRate: 70.6,
  todayRevenue: 15420,
  avgDailyRate: 185,
  checkins: 24,
  checkouts: 18,
  amenities: [
    { icon: Wifi, name: "Free WiFi" },
    { icon: Car, name: "Parking" },
    { icon: Coffee, name: "Breakfast" },
    { icon: Utensils, name: "Restaurant" },
  ],
};

// Room status types
type RoomStatus = "available" | "occupied" | "cleaning" | "maintenance";

const roomStatusColors = {
  available: "bg-slate-200 border-slate-400",
  occupied: "bg-slate-700 border-slate-800",
  cleaning: "bg-teal-200 border-teal-400",
  maintenance: "bg-gray-400 border-gray-500",
};

const roomStatusLabels = {
  available: "Available",
  occupied: "Occupied",
  cleaning: "Cleaning",
  maintenance: "Maintenance",
};

// Generate room data based on actual hotel structure
const generateRoomData = (floors: number, roomsPerFloor: number) => {
  const rooms = [];
  const statuses: RoomStatus[] = [
    "available",
    "occupied",
    "cleaning",
    "maintenance",
  ];

  for (let floor = floors; floor >= 1; floor--) {
    const floorRooms = [];
    for (let room = 1; room <= roomsPerFloor; room++) {
      const roomNumber = `${floor}${room.toString().padStart(2, "0")}`;
      let randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      // Make it more realistic - higher floors more likely to be available
      if (floor > Math.ceil(floors * 0.6) && Math.random() > 0.6) {
        randomStatus = "available";
      }

      floorRooms.push({
        number: roomNumber,
        status: randomStatus,
        guest:
          randomStatus === "occupied"
            ? `Guest ${Math.floor(Math.random() * 1000)}`
            : null,
        checkIn: randomStatus === "occupied" ? "2025-09-25" : null,
        checkOut: randomStatus === "occupied" ? "2025-09-30" : null,
      });
    }
    rooms.push({ floor, rooms: floorRooms });
  }
  return rooms;
};

export default function DashboardPage() {
  const { hotelData } = useHotel();
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [roomModalOpen, setRoomModalOpen] = useState(false);

  // Generate room data based on actual hotel structure or defaults
  const roomsData = useMemo(() => {
    const floors = hotelData?.numberOfFloors || 3;
    const roomsPerFloor = hotelData?.roomsPerFloor || 4;
    return generateRoomData(floors, roomsPerFloor);
  }, [hotelData]);

  // Calculate dynamic hotel stats
  const dynamicHotelData = useMemo(() => {
    if (!hotelData) {
      return null; // No demo data - show connection warning
    }

    const totalRooms = hotelData.totalRooms;
    const occupiedRooms = Math.floor(totalRooms * 0.7); // 70% occupancy simulation
    const occupancyRate =
      Math.round((occupiedRooms / totalRooms) * 100 * 10) / 10;

    return {
      name: hotelData.hotelName,
      location: `${hotelData.city}, ${hotelData.state}`,
      phone: hotelData.phone,
      email: hotelData.email,
      rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
      totalRooms,
      occupiedRooms,
      occupancyRate,
      todayRevenue: Math.floor(occupiedRooms * (100 + Math.random() * 150)), // Dynamic revenue
      avgDailyRate: Math.floor(100 + Math.random() * 100), // Random ADR
      checkins: Math.floor(totalRooms * 0.15), // 15% of rooms checking in
      checkouts: Math.floor(totalRooms * 0.12), // 12% checking out
      amenities: [
        { icon: Wifi, name: "Free WiFi" },
        { icon: Car, name: "Parking" },
        { icon: Coffee, name: "Breakfast" },
        { icon: Utensils, name: "Restaurant" },
      ],
    };
  }, [hotelData]);

  const handleRoomClick = (room: any) => {
    setSelectedRoom(room);
    setRoomModalOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Show welcome message if no hotel data exists
  if (!hotelData || !dynamicHotelData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-6">
            <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Backend Not Connected
            </h1>
            <p className="text-gray-600 mb-4">
              No hotel data available. Please start the backend server on port
              5000 to load data from the database.
            </p>
            <div className="text-sm text-gray-500 bg-white rounded p-3 mb-4">
              <p className="font-mono">cd back && npm start</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">Or create a new hotel profile:</p>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white">
              Create Hotel Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-blue-100"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                  {dynamicHotelData.name}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {dynamicHotelData.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {dynamicHotelData.phone}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {dynamicHotelData.rating.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="hidden md:inline-flex">
                Settings
              </Button>
              <Button className="btn-fun bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900">
                View Reports
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hotel Summary Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-8"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold mb-6">Today's Overview</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div variants={itemVariants}>
              <Card className="card-fun">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Occupancy Rate
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {dynamicHotelData.occupancyRate}%
                      </p>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        +5.2% from yesterday
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Bed className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="card-fun">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Today's Revenue
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${dynamicHotelData.todayRevenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        +12.5% from yesterday
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="card-fun">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Check-ins Today
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {dynamicHotelData.checkins}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dynamicHotelData.checkouts} check-outs
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-slate-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="card-fun">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Average Daily Rate
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${dynamicHotelData.avgDailyRate}
                      </p>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        +3.2% from last week
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions Section */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/scanner">
                <Card className="card-fun hover:shadow-lg transition-all cursor-pointer group border-2 border-transparent hover:border-blue-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="h-16 w-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg
                          className="h-8 w-8 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Check-In Guest</h3>
                        <p className="text-sm text-muted-foreground">
                          Scan booking QR code
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/room-management">
                <Card className="card-fun hover:shadow-lg transition-all cursor-pointer group border-2 border-transparent hover:border-teal-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="h-16 w-16 bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Bed className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Room Management</h3>
                        <p className="text-sm text-muted-foreground">
                          Add, edit & manage rooms
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/feedback">
                <Card className="card-fun hover:shadow-lg transition-all cursor-pointer group border-2 border-transparent hover:border-slate-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="h-16 w-16 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Star className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">View Feedback</h3>
                        <p className="text-sm text-muted-foreground">
                          Guest reviews & ratings
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/food-management">
                <Card className="card-fun hover:shadow-lg transition-all cursor-pointer group border-2 border-transparent hover:border-teal-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="h-16 w-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Utensils className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Food Management</h3>
                        <p className="text-sm text-muted-foreground">
                          Manage restaurant menu
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/bot-config">
                <Card className="card-fun hover:shadow-lg transition-all cursor-pointer group border-2 border-transparent hover:border-purple-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="h-16 w-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg
                          className="h-8 w-8 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Bot Configuration</h3>
                        <p className="text-sm text-muted-foreground">
                          Configure AI assistants
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Card className="card-fun hover:shadow-lg transition-all cursor-pointer group border-2 border-transparent hover:border-green-500">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="h-16 w-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Manage Requests</h3>
                      <p className="text-sm text-muted-foreground">
                        View guest service requests
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Quick Stats & Amenities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="card-fun">
                <CardHeader>
                  <CardTitle>Room Status Legend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(roomStatusLabels).map(([status, label]) => (
                      <div key={status} className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded ${
                            roomStatusColors[status as RoomStatus]
                          }`}
                        ></div>
                        <span className="text-sm">{label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="card-fun">
                <CardHeader>
                  <CardTitle>Hotel Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dynamicHotelData.amenities.map(({ icon: Icon, name }) => (
                      <div key={name} className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Building Visualization */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="py-8 bg-gradient-to-b from-slate-50 to-slate-100"
      >
        <div className="w-full px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-2">
              Grand Aurelia Hotel - Live Building View 🏨
            </h2>
            <p className="text-muted-foreground">
              Real-time room occupancy • 15 Floors • 180 Rooms
            </p>
          </motion.div>

          {/* 3D Building Structure */}
          <div className="w-full max-w-7xl mx-auto perspective-1000">
            {/* Main Building Structure */}
            <div className="relative transform-gpu">
              {/* Building Shadow */}
              <div className="absolute -bottom-2 -right-4 w-full h-full bg-gray-400 opacity-20 rounded-lg transform rotate-1 blur-sm"></div>

              {/* Main Building */}
              <div className="relative bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 rounded-lg shadow-2xl border border-gray-300 overflow-hidden">
                {/* Building Top/Roof */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
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
                  {/* Roof edge */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-800 to-gray-700"></div>
                </motion.div>

                {/* Floors Container */}
                <div className="relative">
                  {roomsData.map(({ floor, rooms }, floorIndex) => (
                    <motion.div
                      key={floor}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: floorIndex * 0.05 }}
                      className={`
                        relative flex items-center border-b border-gray-300
                        bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100
                        hover:from-gray-150 hover:via-gray-100 hover:to-gray-150 transition-all duration-500
                        ${floorIndex === 0 ? "border-t-2 border-gray-400" : ""}
                      `}
                      style={{
                        height: `${Math.max(
                          60,
                          Math.min(
                            100,
                            80 -
                              (roomsData.length > 8
                                ? (roomsData.length - 8) * 5
                                : 0)
                          )
                        )}px`,
                        background: `linear-gradient(90deg, 
                          hsl(${210 + floorIndex * 2}, 15%, ${
                          95 - floorIndex * 0.5
                        }%) 0%, 
                          hsl(${210}, 10%, 98%) 50%, 
                          hsl(${210 - floorIndex * 2}, 15%, ${
                          95 - floorIndex * 0.5
                        }%) 100%)`,
                      }}
                    >
                      {/* Floor Number Panel */}
                      <motion.div
                        whileHover={{ scale: 1.02, z: 10 }}
                        className="relative w-28 h-full bg-gradient-to-br from-gray-600 to-gray-800 text-white flex items-center justify-center font-bold shadow-lg border-r-2 border-gray-500"
                        style={{
                          background: `linear-gradient(135deg, 
                            hsl(210, 25%, ${35 + floorIndex * 1}%) 0%, 
                            hsl(210, 30%, ${25 + floorIndex * 1}%) 100%)`,
                        }}
                      >
                        <div className="text-center">
                          <div className="text-xs opacity-75 font-normal">
                            Floor
                          </div>
                          <div className="text-xl font-bold">{floor}</div>
                        </div>
                        {/* Floor panel edge effect */}
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-white/20 to-transparent"></div>
                      </motion.div>

                      {/* Elevator Shaft */}
                      <div className="w-14 h-full bg-gradient-to-br from-gray-700 to-gray-900 border-r border-gray-600 flex items-center justify-center relative">
                        <div className="w-6 h-8 bg-gradient-to-b from-gray-300 to-gray-400 rounded border border-gray-500 flex items-center justify-center">
                          <div className="w-2 h-4 bg-gray-200 rounded-sm"></div>
                        </div>
                        {floor % 5 === 0 && (
                          <div className="absolute right-1 top-1 w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                        )}
                      </div>

                      {/* Central Hallway */}
                      <div className="w-18 h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 border-r border-gray-300 flex items-center justify-center relative">
                        <div className="w-2 h-12 bg-gray-400 rounded-full shadow-inner"></div>
                        <div className="absolute top-4 left-2 w-8 h-1 bg-gray-500 rounded opacity-60"></div>
                        <div className="absolute bottom-4 left-2 w-8 h-1 bg-gray-500 rounded opacity-60"></div>
                      </div>

                      {/* Rooms Layout */}
                      <div className="flex-1 flex justify-center px-3 py-2 relative">
                        {/* All Rooms */}
                        <div className="flex gap-1.5 flex-wrap justify-center max-w-full">
                          {rooms.map((room, roomIndex) => (
                            <motion.div
                              key={room.number}
                              initial={{ opacity: 0, scale: 0.7, rotateX: -90 }}
                              whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 0.3,
                                delay: floorIndex * 0.05 + roomIndex * 0.02,
                                type: "spring",
                                stiffness: 200,
                              }}
                              whileHover={{
                                scale: 1.08,
                                y: -3,
                                rotateY: 5,
                                transition: { duration: 0.2 },
                              }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRoomClick(room)}
                              className={`
                                relative ${
                                  rooms.length > 8
                                    ? "w-16 h-14"
                                    : rooms.length > 6
                                    ? "w-20 h-16"
                                    : "w-24 h-18"
                                } rounded-lg cursor-pointer shadow-lg border-2 border-white
                                ${roomStatusColors[room.status]}
                                hover:shadow-xl transition-all duration-300 transform-gpu
                                before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none
                              `}
                              title={`Room ${room.number} - ${
                                roomStatusLabels[room.status]
                              }${room.guest ? ` - ${room.guest}` : ""}`}
                            >
                              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                <span
                                  className={`${
                                    rooms.length > 8 ? "text-[10px]" : "text-xs"
                                  } font-bold ${
                                    room.status === "available" ||
                                    room.status === "cleaning"
                                      ? "text-slate-800"
                                      : "text-white"
                                  } drop-shadow-lg`}
                                >
                                  {room.number}
                                </span>
                                {room.status === "occupied" && (
                                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1 animate-pulse"></div>
                                )}
                              </div>

                              {/* Window Effect */}
                              <div className="absolute top-1 right-1 w-3 h-2 bg-blue-100 rounded border border-gray-400"></div>

                              {/* Door Effect */}
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-3 bg-gray-700 rounded-t"></div>

                              {/* 3D Tooltip */}
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8, z: -50 }}
                                whileHover={{ opacity: 1, scale: 1, z: 50 }}
                                className="absolute left-1/2 transform -translate-x-1/2 -translate-y-full -mt-2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none z-50 whitespace-nowrap shadow-2xl border border-gray-700"
                                style={{
                                  transform:
                                    "translateX(-50%) translateY(-100%) translateZ(50px)",
                                }}
                              >
                                <div className="font-semibold text-blue-300">
                                  Room {room.number}
                                </div>
                                <div className="text-gray-300">
                                  {roomStatusLabels[room.status]}
                                </div>
                                {room.guest && (
                                  <div className="text-green-300">
                                    {room.guest}
                                  </div>
                                )}
                                {room.checkOut && (
                                  <div className="text-yellow-300">
                                    Until {room.checkOut}
                                  </div>
                                )}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                              </motion.div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Grand Lobby */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="h-28 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-400/20 to-gray-800/30"></div>
                  <div className="relative flex items-center justify-center h-full">
                    <div className="flex items-center gap-4 text-white">
                      <Bed className="h-8 w-8 drop-shadow-lg" />
                      <span className="text-2xl font-bold drop-shadow-lg">
                        GRAND LOBBY & RECEPTION
                      </span>
                      <div className="flex gap-3">
                        <div className="w-4 h-12 bg-gray-800 rounded shadow-lg"></div>
                        <div className="w-4 h-12 bg-gray-800 rounded shadow-lg"></div>
                        <div className="w-4 h-12 bg-gray-800 rounded shadow-lg"></div>
                      </div>
                    </div>
                  </div>
                  {/* Lobby floor pattern */}
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800"></div>
                </motion.div>
              </div>

              {/* Building Foundation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1 }}
                className="h-6 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-gray-400/50 to-gray-800/50"></div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800"></div>
              </motion.div>

              {/* Ground/Landscape */}
              <div className="h-8 bg-gradient-to-r from-teal-400 via-teal-300 to-teal-400 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-green-200/50 to-green-600/30"></div>
                <div className="absolute bottom-0 left-8 w-3 h-6 bg-green-600 rounded-t"></div>
                <div className="absolute bottom-0 right-12 w-2 h-4 bg-green-600 rounded-t"></div>
                <div className="absolute bottom-0 left-1/3 w-4 h-5 bg-green-600 rounded-t"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Room Detail Modal */}
      <RoomDetailModal
        room={selectedRoom}
        open={roomModalOpen}
        onOpenChange={setRoomModalOpen}
      />
    </div>
  );
}
