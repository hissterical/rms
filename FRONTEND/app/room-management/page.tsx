"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useHotel } from "@/contexts/hotel-context"
import { roomAPI, type Room } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Building2,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Hotel,
  Bed,
  Users,
  DollarSign,
} from "lucide-react"
import Link from "next/link"

export default function RoomManagementPage() {
  const { hotelData } = useHotel()
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [floorFilter, setFloorFilter] = useState<string>("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [formData, setFormData] = useState<{
    room_number: string
    floor: string
    status: 'available' | 'reserved' | 'occupied' | 'maintenance'
  }>({
    room_number: "",
    floor: "",
    status: "available",
  })

  // Get property ID from context or use the default SeaView Resort property
  const propertyId = hotelData?.id || "c77219bf-d16f-4860-9506-d1b5e64e7902"

  // Fetch rooms on mount
  useEffect(() => {
    fetchRooms()
  }, [])

  // Filter rooms based on search and filters
  useEffect(() => {
    let filtered = rooms

    if (searchQuery) {
      filtered = filtered.filter(
        (room) =>
          room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.guest_first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.guest_last_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((room) => room.status === statusFilter)
    }

    if (floorFilter !== "all") {
      filtered = filtered.filter((room) => room.floor?.toString() === floorFilter)
    }

    setFilteredRooms(filtered)
  }, [rooms, searchQuery, statusFilter, floorFilter])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const data = await roomAPI.getAllRooms(propertyId)
      setRooms(data)
      setFilteredRooms(data)
    } catch (error) {
      console.error("Error fetching rooms:", error)
      // Show empty state when backend is not connected
      setRooms([])
      setFilteredRooms([])
    } finally {
      setLoading(false)
    }
  }



  const handleCreateRoom = async () => {
    try {
      setSubmitting(true)
      const newRoom = await roomAPI.createRoom({
        property_id: propertyId,
        room_number: formData.room_number,
        floor: formData.floor ? parseInt(formData.floor) : undefined,
        status: formData.status,
      })
      setRooms([...rooms, newRoom])
      setShowCreateModal(false)
      resetForm()
    } catch (error) {
      console.error("Error creating room:", error)
      alert("Failed to create room. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateRoom = async () => {
    if (!selectedRoom) return

    try {
      setSubmitting(true)
      const updatedRoom = await roomAPI.updateRoom(selectedRoom.id, {
        room_number: formData.room_number,
        floor: formData.floor ? parseInt(formData.floor) : undefined,
        status: formData.status,
      })
      setRooms(rooms.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)))
      setShowEditModal(false)
      setSelectedRoom(null)
      resetForm()
    } catch (error) {
      console.error("Error updating room:", error)
      alert("Failed to update room. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStatus = async (roomId: string, newStatus: string) => {
    try {
      const updatedRoom = await roomAPI.updateRoomStatus(roomId, newStatus)
      setRooms(rooms.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)))
    } catch (error) {
      console.error("Error updating room status:", error)
      alert("Failed to update room status. Please try again.")
    }
  }

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return

    try {
      await roomAPI.deleteRoom(roomId)
      setRooms(rooms.filter((r) => r.id !== roomId))
    } catch (error) {
      console.error("Error deleting room:", error)
      alert("Failed to delete room. Please try again.")
    }
  }

  const openEditModal = (room: Room) => {
    setSelectedRoom(room)
    setFormData({
      room_number: room.room_number,
      floor: room.floor?.toString() || "",
      status: room.status,
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      room_number: "",
      floor: "",
      status: "available",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "occupied":
        return "bg-blue-500"
      case "reserved":
        return "bg-yellow-500"
      case "maintenance":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle2 className="h-4 w-4" />
      case "occupied":
        return <Users className="h-4 w-4" />
      case "reserved":
        return <AlertTriangle className="h-4 w-4" />
      case "maintenance":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Hotel className="h-4 w-4" />
    }
  }

  // Get unique floors for filter
  const uniqueFloors = Array.from(new Set(rooms.map((r) => r.floor).filter(Boolean))).sort()

  // Statistics
  const stats = {
    total: rooms.length,
    available: rooms.filter((r) => r.status === "available").length,
    occupied: rooms.filter((r) => r.status === "occupied").length,
    maintenance: rooms.filter((r) => r.status === "maintenance").length,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading rooms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <Building2 className="h-10 w-10 text-blue-600" />
                Room Management
              </h1>
              <p className="text-slate-600">
                Manage all rooms in {hotelData?.hotelName || "your property"}
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Rooms</p>
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <Hotel className="h-10 w-10 text-slate-400" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Available</p>
                <p className="text-3xl font-bold text-green-900">{stats.available}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Occupied</p>
                <p className="text-3xl font-bold text-blue-900">{stats.occupied}</p>
              </div>
              <Users className="h-10 w-10 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Maintenance</p>
                <p className="text-3xl font-bold text-red-900">{stats.maintenance}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="mb-2 flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </Label>
              <Input
                placeholder="Room number or guest name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div>
              <Label className="mb-2 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Floor
              </Label>
              <Select value={floorFilter} onValueChange={setFloorFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Floors</SelectItem>
                  {uniqueFloors.map((floor) => (
                    <SelectItem key={floor} value={floor.toString()}>
                      Floor {floor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4 bg-white hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Room {room.room_number}
                    </h3>
                    <p className="text-sm text-slate-600">Floor {room.floor}</p>
                  </div>
                  <Badge className={getStatusColor(room.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(room.status)}
                      {room.status}
                    </span>
                  </Badge>
                </div>

                {room.room_type_name && (
                  <div className="mb-3 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Bed className="h-4 w-4" />
                      <span>{room.room_type_name}</span>
                    </div>
                    {room.capacity && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="h-4 w-4" />
                        <span>{room.capacity} guests</span>
                      </div>
                    )}
                    {room.price && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <DollarSign className="h-4 w-4" />
                        <span>${room.price}/night</span>
                      </div>
                    )}
                  </div>
                )}

                {room.status === "occupied" && room.guest_first_name && (
                  <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 font-semibold mb-1">Guest</p>
                    <p className="text-sm text-blue-900">
                      {room.guest_first_name} {room.guest_last_name}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditModal(room)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRoom(room.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Quick status change */}
                <div className="mt-3 pt-3 border-t">
                  <Select
                    value={room.status}
                    onValueChange={(value) => handleUpdateStatus(room.id, value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <Card className="p-12 text-center bg-white">
            <Hotel className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {rooms.length === 0 && !loading ? "Backend Not Connected" : "No rooms found"}
            </h3>
            <p className="text-slate-600 mb-4">
              {rooms.length === 0 && !loading
                ? "Please start the backend server on port 5000 to load room data from the database."
                : searchQuery || statusFilter !== "all" || floorFilter !== "all"
                ? "Try adjusting your filters"
                : "Get started by adding your first room"}
            </p>
            {rooms.length === 0 && !loading && (
              <div className="text-sm text-slate-500 mt-4">
                <p>Run: <code className="bg-slate-100 px-2 py-1 rounded">cd back && npm start</code></p>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Create Room Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="room_number">Room Number *</Label>
              <Input
                id="room_number"
                value={formData.room_number}
                onChange={(e) =>
                  setFormData({ ...formData, room_number: e.target.value })
                }
                placeholder="101"
              />
            </div>
            <div>
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                type="number"
                value={formData.floor}
                onChange={(e) =>
                  setFormData({ ...formData, floor: e.target.value })
                }
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateRoom}
              disabled={!formData.room_number || submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Room Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit_room_number">Room Number *</Label>
              <Input
                id="edit_room_number"
                value={formData.room_number}
                onChange={(e) =>
                  setFormData({ ...formData, room_number: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit_floor">Floor</Label>
              <Input
                id="edit_floor"
                type="number"
                value={formData.floor}
                onChange={(e) =>
                  setFormData({ ...formData, floor: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit_status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRoom} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
