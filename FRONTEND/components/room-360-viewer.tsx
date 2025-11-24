"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, RotateCw, ZoomIn, ZoomOut, Maximize2, Info, Bed, Tv, Coffee, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Room360ViewerProps {
  roomNumber: string
  onClose: () => void
  onComplete?: () => void
}

export function Room360Viewer({ roomNumber, onClose, onComplete }: Room360ViewerProps) {
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [viewProgress, setViewProgress] = useState(0)
  const viewerRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const startRotationRef = useRef(0)

  // Room amenities - would be dynamic from API
  const amenities = [
    { icon: Bed, label: "King Size Bed", x: 20, y: 50 },
    { icon: Tv, label: "Smart TV", x: 80, y: 40 },
    { icon: Coffee, label: "Coffee Maker", x: 50, y: 70 },
    { icon: Wifi, label: "High-Speed WiFi", x: 50, y: 30 }
  ]

  useEffect(() => {
    // Calculate view progress (full 360° rotation = 100%)
    const normalizedRotation = ((rotation % 360) + 360) % 360
    const progress = (normalizedRotation / 360) * 100
    setViewProgress(progress)

    // Auto-complete after full rotation
    if (normalizedRotation > 350 && onComplete) {
      setTimeout(() => onComplete(), 500)
    }
  }, [rotation, onComplete])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    startXRef.current = e.clientX
    startRotationRef.current = rotation
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const delta = e.clientX - startXRef.current
    setRotation(startRotationRef.current + delta * 0.5)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    startXRef.current = e.touches[0].clientX
    startRotationRef.current = rotation
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const delta = e.touches[0].clientX - startXRef.current
    setRotation(startRotationRef.current + delta * 0.5)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5))
  }

  const handleAutoRotate = () => {
    const interval = setInterval(() => {
      setRotation(prev => prev + 1)
    }, 20)

    setTimeout(() => clearInterval(interval), 3000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full h-full max-w-7xl max-h-screen p-4 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 text-white">
          <div>
            <h2 className="text-2xl font-bold">Room {roomNumber}</h2>
            <p className="text-sm text-gray-400">360° Virtual Tour</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowInfo(!showInfo)}
              className="text-white hover:bg-white/10"
            >
              <Info className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* 360 Viewer */}
        <div className="flex-1 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border-4 border-slate-700">
          <div
            ref={viewerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-full h-full relative cursor-grab active:cursor-grabbing select-none"
            style={{
              transform: `scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
          >
            {/* Simulated 360 Room View - In production, use actual 360 image or three.js */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: `perspective(1000px) rotateY(${rotation}deg)`,
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Room representation - would be replaced with actual 360 image */}
              <div className="relative w-full h-full">
                {/* Back Wall */}
                <div className="absolute inset-0 bg-gradient-to-b from-amber-100 to-amber-200 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Bed className="w-32 h-32 text-slate-700 mx-auto opacity-20" />
                    <p className="text-slate-600 text-lg font-semibold">
                      Drag to rotate 360°
                    </p>
                  </div>
                </div>

                {/* Amenity Hotspots */}
                {amenities.map((amenity, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="absolute cursor-pointer group"
                    style={{
                      left: `${amenity.x}%`,
                      top: `${amenity.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="relative"
                    >
                      {/* Pulsing ring */}
                      <motion.div
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 w-12 h-12 rounded-full bg-blue-400"
                      />
                      
                      {/* Icon */}
                      <div className="relative w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-blue-500">
                        <amenity.icon className="w-6 h-6 text-slate-600" />
                      </div>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                          {amenity.label}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}

                {/* Grid overlay for depth */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="w-full h-full" style={{
                    backgroundImage: 'linear-gradient(0deg, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                  }} />
                </div>
              </div>
            </div>

            {/* Drag instruction */}
            {rotation === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="bg-black/70 px-6 py-3 rounded-full text-white flex items-center gap-2">
                  <RotateCw className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Drag to explore the room</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${viewProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-white text-center mt-1">
                {viewProgress.toFixed(0)}% explored
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            onClick={handleZoomOut}
            variant="outline"
            size="icon"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          
          <Button
            onClick={handleAutoRotate}
            variant="outline"
            size="icon"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RotateCw className="h-5 w-5" />
          </Button>
          
          <Button
            onClick={handleZoomIn}
            variant="outline"
            size="icon"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          
          <Button
            onClick={() => setZoom(1)}
            variant="outline"
            size="icon"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Info Panel */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="absolute right-4 top-20 bottom-20 w-80"
            >
              <Card className="h-full bg-white/95 backdrop-blur-sm p-6 overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">Room Amenities</h3>
                <div className="space-y-3">
                  {amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <amenity.icon className="w-5 h-5 text-slate-600" />
                      </div>
                      <span className="font-medium text-slate-700">{amenity.label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-2">Additional Features</h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• Air Conditioning</li>
                    <li>• Mini Refrigerator</li>
                    <li>• Safe Deposit Box</li>
                    <li>• 24/7 Room Service</li>
                    <li>• Complimentary Toiletries</li>
                  </ul>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}