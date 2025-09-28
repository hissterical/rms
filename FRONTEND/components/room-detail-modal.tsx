"use client"

import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  User, 
  Calendar, 
  Clock,
  Bed,
  Wifi,
  Coffee,
  Phone,
  Mail
} from "lucide-react"

interface Room {
  number: string
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance'
  guest: string | null
  checkIn: string | null
  checkOut: string | null
}

interface RoomDetailModalProps {
  room: Room | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const roomStatusColors = {
  available: 'bg-emerald-500',
  occupied: 'bg-red-500', 
  cleaning: 'bg-amber-400',
  maintenance: 'bg-gray-400'
}

const roomStatusLabels = {
  available: 'Available',
  occupied: 'Occupied',
  cleaning: 'Cleaning',
  maintenance: 'Maintenance'
}

export function RoomDetailModal({ room, open, onOpenChange }: RoomDetailModalProps) {
  if (!room) return null

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

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
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Room {room.number}
              </DialogTitle>
              <Badge 
                className={`mt-2 text-white ${roomStatusColors[room.status]}`}
              >
                {roomStatusLabels[room.status]}
              </Badge>
            </motion.div>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Room Info */}
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">King Bed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Free WiFi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Mini Bar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Room Service</span>
                </div>
              </div>
            </motion.div>

            {/* Guest Information */}
            {room.guest && (
              <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Guest Information
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Guest Name:</span>
                    <span className="text-sm font-medium">{room.guest}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Check-in:</span>
                    <span className="text-sm">{room.checkIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Check-out:</span>
                    <span className="text-sm">{room.checkOut}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex gap-2">
              {room.status === 'available' && (
                <>
                  <Button className="flex-1 btn-fun bg-gradient-to-r from-blue-500 to-blue-700">
                    Assign Guest
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Block Room
                  </Button>
                </>
              )}
              
              {room.status === 'occupied' && (
                <>
                  <Button className="flex-1 btn-fun bg-gradient-to-r from-blue-500 to-blue-700">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Guest
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Early Checkout
                  </Button>
                </>
              )}
              
              {room.status === 'cleaning' && (
                <>
                  <Button className="flex-1 btn-fun bg-gradient-to-r from-green-500 to-green-700">
                    Mark Clean
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Assign Cleaner
                  </Button>
                </>
              )}
              
              {room.status === 'maintenance' && (
                <>
                  <Button className="flex-1 btn-fun bg-gradient-to-r from-gray-500 to-gray-700">
                    Complete Maintenance
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Update Status
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}