"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { generateRoomQRCode, downloadQRCode, copyQRDataToClipboard } from "@/lib/qr-utils"
import { 
  User, 
  Calendar, 
  Clock,
  Bed,
  Wifi,
  Coffee,
  Phone,
  Mail,
  QrCode,
  Download,
  Printer,
  Link as LinkIcon
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
  const [showQR, setShowQR] = useState(false)
  const [qrGenerated, setQrGenerated] = useState(false)
  const [qrCodeImage, setQrCodeImage] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  
  if (!room) return null

  // Generate room-specific QR URL
  const propertyId = 'c77219bf-d16f-4860-9506-d1b5e64e7902' // Default property ID
  const roomQRUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/room-services?room=${room.number}`

  const handleGenerateQR = async () => {
    setIsGenerating(true)
    try {
      // Generate QR code with a mock booking ID
      const mockBookingId = `ROOM-${room.number}-${Date.now()}`
      const qrDataURL = await generateRoomQRCode(
        propertyId,
        room.number,
        mockBookingId
      )
      
      setQrCodeImage(qrDataURL)
      setShowQR(true)
      setQrGenerated(true)
    } catch (error) {
      console.error('Error generating QR code:', error)
      alert('Failed to generate QR code')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadQR = async () => {
    if (!qrCodeImage) return
    try {
      await downloadQRCode(
        roomQRUrl,
        `room-${room.number}-service-qr`,
        {
          errorCorrectionLevel: 'H',
          width: 400,
          margin: 3,
        }
      )
    } catch (error) {
      console.error('Error downloading QR code:', error)
      alert('Failed to download QR code')
    }
  }

  const handleCopyLink = async () => {
    try {
      await copyQRDataToClipboard(roomQRUrl)
      alert('Room service link copied to clipboard!')
    } catch (error) {
      console.error('Error copying link:', error)
      alert('Failed to copy link')
    }
  }

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
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
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
                  <Bed className="h-4 w-4 text-slate-600" />
                  <span className="text-sm">King Bed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-slate-600" />
                  <span className="text-sm">Free WiFi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-slate-600" />
                  <span className="text-sm">Mini Bar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-600" />
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

            {/* Room QR Code Section */}
            <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-teal-600" />
                  <h4 className="font-semibold text-blue-900">Room Service QR Code</h4>
                </div>
                {qrGenerated && (
                  <Badge className="bg-green-500">Generated</Badge>
                )}
              </div>
              
              <p className="text-sm text-blue-700 mb-3">
                Generate a unique QR code for guests to access room services
              </p>

              {!showQR ? (
                <Button 
                  onClick={handleGenerateQR}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900"
                >
                  {isGenerating ? (
                    <>
                      <QrCode className="mr-2 h-4 w-4 animate-pulse" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <QrCode className="mr-2 h-4 w-4" />
                      Generate QR Code
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  {/* Actual QR Code Display */}
                  <div className="bg-white p-6 rounded-lg border-2 border-blue-300 flex flex-col items-center">
                    {qrCodeImage ? (
                      <img 
                        src={qrCodeImage} 
                        alt={`QR Code for Room ${room.number}`} 
                        className="w-48 h-48 object-contain mb-3"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-3">
                        <QrCode className="h-32 w-32 text-teal-600 animate-pulse" />
                      </div>
                    )}
                    <p className="text-xs text-gray-600 text-center font-mono break-all">
                      {roomQRUrl}
                    </p>
                  </div>

                  {/* QR Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      onClick={handleDownloadQR}
                      variant="outline" 
                      size="sm"
                      className="flex-col h-auto py-2"
                    >
                      <Download className="h-4 w-4 mb-1" />
                      <span className="text-xs">Download</span>
                    </Button>
                    <Button 
                      onClick={() => window.print()}
                      variant="outline" 
                      size="sm"
                      className="flex-col h-auto py-2"
                    >
                      <Printer className="h-4 w-4 mb-1" />
                      <span className="text-xs">Print</span>
                    </Button>
                    <Button 
                      onClick={handleCopyLink}
                      variant="outline" 
                      size="sm"
                      className="flex-col h-auto py-2"
                    >
                      <LinkIcon className="h-4 w-4 mb-1" />
                      <span className="text-xs">Copy Link</span>
                    </Button>
                  </div>

                  <div className="text-xs text-teal-600 bg-teal-100 p-2 rounded">
                    💡 <strong>Tip:</strong> Print this QR code and display it in Room {room.number}. Guests can scan it to access services.
                  </div>
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex gap-2">
              {room.status === 'available' && (
                <>
                  <Button className="flex-1 btn-fun bg-gradient-to-r from-slate-700 to-slate-800">
                    Assign Guest
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Block Room
                  </Button>
                </>
              )}
              
              {room.status === 'occupied' && (
                <>
                  <Button className="flex-1 btn-fun bg-gradient-to-r from-slate-700 to-slate-800">
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
                  <Button className="flex-1 btn-fun bg-gradient-to-r from-teal-600 to-teal-700">
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