"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bed,
  Users,
  DollarSign,
  Building,
  Hash,
  Layers,
  RefreshCw,
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
  room_type_id?: string;
}

interface PropertyRoomDetailModalProps {
  room: Room | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomUpdated?: () => void;
}

const roomStatusColors = {
  available: "bg-slate-200 border-slate-400 text-slate-800",
  reserved: "bg-blue-500 text-white",
  occupied: "bg-slate-700 text-white",
  maintenance: "bg-gray-400 text-white",
};

const roomStatusLabels = {
  available: "Available",
  reserved: "Reserved",
  occupied: "Occupied",
  maintenance: "Maintenance",
};

export function PropertyRoomDetailModal({
  room,
  open,
  onOpenChange,
  onRoomUpdated,
}: PropertyRoomDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  if (!room) return null;

  const handleStatusChange = async (newStatus: string) => {
    if (!room) return;

    setIsUpdating(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/properties/${room.property_id}/rooms/${room.id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update room status");
      }

      const data = await response.json();
      console.log("Room status updated:", data);

      toast({
        title: "Success",
        description: `Room ${room.room_number} status updated to ${
          roomStatusLabels[newStatus as keyof typeof roomStatusLabels]
        }`,
      });

      // Notify parent to refresh data
      if (onRoomUpdated) {
        onRoomUpdated();
      }

      // Close modal after successful update
      setTimeout(() => {
        onOpenChange(false);
      }, 500);
    } catch (error: any) {
      console.error("Error updating room status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update room status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <DialogHeader>
            <motion.div variants={itemVariants} className="text-center">
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                Room {room.room_number}
              </DialogTitle>
              <Badge className={`mt-2 ${roomStatusColors[room.status]}`}>
                {roomStatusLabels[room.status]}
              </Badge>
            </motion.div>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Room Info */}
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg">
                  <Hash className="h-5 w-5 text-slate-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Room Number</p>
                    <p className="text-sm font-semibold">{room.room_number}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg">
                  <Layers className="h-5 w-5 text-slate-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Floor</p>
                    <p className="text-sm font-semibold">{room.floor}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg">
                  <Bed className="h-5 w-5 text-slate-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Room Type</p>
                    <p className="text-sm font-semibold">
                      {room.room_type || "Standard"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg">
                  <Users className="h-5 w-5 text-slate-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Capacity</p>
                    <p className="text-sm font-semibold">
                      {room.capacity} guests
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg col-span-2">
                  <DollarSign className="h-5 w-5 text-slate-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="text-sm font-semibold">
                      ${room.price?.toFixed(2) || "0.00"} / night
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Status Change Section */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">
                  Change Room Status
                </h4>
              </div>

              <p className="text-sm text-blue-700 mb-3">
                Update the room's current status
              </p>

              <div className="space-y-3">
                <Select
                  value={selectedStatus || room.status}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-200 border-2 border-slate-400"></div>
                        <span>Available</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="reserved">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Reserved</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="occupied">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                        <span>Occupied</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="maintenance">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                        <span>Maintenance</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={() =>
                    handleStatusChange(selectedStatus || room.status)
                  }
                  disabled={
                    isUpdating ||
                    selectedStatus === room.status ||
                    !selectedStatus
                  }
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Update Status
                    </>
                  )}
                </Button>
              </div>
            </motion.div>

            {/* Quick Action Buttons */}
            <motion.div variants={itemVariants} className="flex gap-2">
              {room.status === "maintenance" && (
                <Button
                  onClick={() => handleStatusChange("available")}
                  disabled={isUpdating}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700"
                >
                  Mark as Available
                </Button>
              )}

              {room.status === "occupied" && (
                <Button
                  onClick={() => handleStatusChange("available")}
                  disabled={isUpdating}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
                >
                  Check Out
                </Button>
              )}

              {room.status === "available" && (
                <Button
                  onClick={() => handleStatusChange("maintenance")}
                  disabled={isUpdating}
                  variant="outline"
                  className="flex-1"
                >
                  Set Maintenance
                </Button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
