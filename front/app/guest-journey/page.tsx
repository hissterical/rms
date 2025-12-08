"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft,
  Users,
  MapPin,
  Clock,
  TrendingUp,
  Activity,
  Utensils,
  Bed,
  Car,
  Wifi,
  Coffee,
  User,
  Navigation,
  Timer,
  BarChart3
} from "lucide-react"

// Guest journey data
interface GuestActivity {
  id: string
  guestName: string
  guestId: string
  room: string
  currentLocation: string
  activity: string
  timestamp: string
  duration: number
  status: 'active' | 'completed'
  path: string[]
}

interface HeatZone {
  id: string
  name: string
  intensity: number
  guests: number
  location: { x: number, y: number }
  size: { width: number, height: number }
}

const mockGuestActivities: GuestActivity[] = [
  {
    id: "1",
    guestName: "Sarah Johnson",
    guestId: "G001",
    room: "1205",
    currentLocation: "Restaurant",
    activity: "Dining",
    timestamp: "2:30 PM",
    duration: 45,
    status: 'active',
    path: ["Front Desk", "Elevator", "Room 1205", "Elevator", "Restaurant"]
  },
  {
    id: "2", 
    guestName: "Michael Chen",
    guestId: "G002",
    room: "0804",
    currentLocation: "Spa",
    activity: "Massage Therapy",
    timestamp: "1:15 PM",
    duration: 90,
    status: 'active',
    path: ["Lobby", "Elevator", "Room 0804", "Spa"]
  },
  {
    id: "3",
    guestName: "Emma Davis",
    guestId: "G003", 
    room: "1501",
    currentLocation: "Gym",
    activity: "Workout",
    timestamp: "3:00 PM",
    duration: 60,
    status: 'active',
    path: ["Room 1501", "Elevator", "Gym"]
  },
  {
    id: "4",
    guestName: "David Wilson",
    guestId: "G004",
    room: "0612",
    currentLocation: "Pool Area",
    activity: "Swimming", 
    timestamp: "2:45 PM",
    duration: 30,
    status: 'active',
    path: ["Room 0612", "Elevator", "Pool Area"]
  }
]

const heatZones: HeatZone[] = [
  { id: "lobby", name: "Lobby", intensity: 85, guests: 12, location: { x: 10, y: 60 }, size: { width: 25, height: 15 } },
  { id: "restaurant", name: "Restaurant", intensity: 92, guests: 18, location: { x: 40, y: 20 }, size: { width: 20, height: 12 } },
  { id: "elevator1", name: "Elevator Bank 1", intensity: 78, guests: 8, location: { x: 15, y: 40 }, size: { width: 8, height: 20 } },
  { id: "elevator2", name: "Elevator Bank 2", intensity: 65, guests: 5, location: { x: 77, y: 40 }, size: { width: 8, height: 20 } },
  { id: "spa", name: "Spa & Wellness", intensity: 45, guests: 6, location: { x: 65, y: 15 }, size: { width: 18, height: 10 } },
  { id: "gym", name: "Fitness Center", intensity: 35, guests: 4, location: { x: 85, y: 65 }, size: { width: 12, height: 8 } },
  { id: "pool", name: "Pool Area", intensity: 58, guests: 9, location: { x: 40, y: 75 }, size: { width: 25, height: 10 } },
  { id: "frontdesk", name: "Front Desk", intensity: 70, guests: 3, location: { x: 5, y: 45 }, size: { width: 15, height: 8 } }
]

const getHeatColor = (intensity: number) => {
  if (intensity >= 80) return "bg-red-500/70"
  if (intensity >= 60) return "bg-orange-500/70"
  if (intensity >= 40) return "bg-yellow-500/70"
  return "bg-green-500/70"
}

const getActivityIcon = (activity: string) => {
  switch (activity.toLowerCase()) {
    case 'dining': return <Utensils className="h-4 w-4" />
    case 'massage therapy': return <Activity className="h-4 w-4" />
    case 'workout': return <TrendingUp className="h-4 w-4" />
    case 'swimming': return <Activity className="h-4 w-4" />
    default: return <MapPin className="h-4 w-4" />
  }
}

export default function GuestJourneyPage() {
  const [selectedGuest, setSelectedGuest] = useState<GuestActivity | null>(null)
  const [showHeatMap, setShowHeatMap] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Real-Time Guest Journey
              </h1>
              <p className="text-muted-foreground">
                Live tracking • Heat maps • Activity analytics • {currentTime.toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant={showHeatMap ? "default" : "outline"}
              onClick={() => setShowHeatMap(!showHeatMap)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {showHeatMap ? "Hide" : "Show"} Heat Map
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Heat Map Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="card-fun">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Hotel Floor Plan & Guest Flow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border-2 border-slate-300 overflow-hidden">
                  
                  {/* Floor Plan Background */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 left-4 right-4 h-8 bg-blue-200 rounded flex items-center justify-center text-xs font-semibold">
                      GRAND AURELIA HOTEL - GROUND FLOOR
                    </div>
                  </div>

                  {/* Heat Map Zones */}
                  <AnimatePresence>
                    {showHeatMap && heatZones.map((zone) => (
                      <motion.div
                        key={zone.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`absolute ${getHeatColor(zone.intensity)} rounded-lg border border-white/30 backdrop-blur-sm`}
                        style={{
                          left: `${zone.location.x}%`,
                          top: `${zone.location.y}%`,
                          width: `${zone.size.width}%`,
                          height: `${zone.size.height}%`
                        }}
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-xs font-semibold">
                          <div>{zone.name}</div>
                          <div className="text-xs opacity-90">{zone.guests} guests</div>
                        </div>
                        <div className="absolute -top-2 -right-2 bg-white text-gray-800 text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                          {zone.intensity}%
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Animated Guest Paths */}
                  {mockGuestActivities.map((guest, index) => (
                    <motion.div
                      key={guest.id}
                      className="absolute"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.3 }}
                    >
                      {/* Guest Avatar */}
                      <motion.div
                        className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer"
                        style={{
                          left: `${20 + index * 15}%`,
                          top: `${30 + index * 10}%`
                        }}
                        animate={{
                          x: [0, 20, 40, 60, 80],
                          y: [0, -10, 5, -15, 10]
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        onClick={() => setSelectedGuest(guest)}
                        whileHover={{ scale: 1.2, z: 10 }}
                      >
                        <User className="h-3 w-3 text-white" />
                      </motion.div>
                      
                      {/* Guest Path Trail */}
                      <motion.div
                        className="absolute w-1 bg-blue-400/50 rounded-full"
                        style={{
                          left: `${20 + index * 15}%`,
                          top: `${30 + index * 10}%`,
                          height: '2px'
                        }}
                        animate={{
                          width: [0, 100, 200, 300, 400]
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    </motion.div>
                  ))}

                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 border">
                    <div className="text-xs font-semibold mb-2">Heat Map Legend</div>
                    <div className="flex gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500/70 rounded"></div>
                        <span>High (80%+)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-orange-500/70 rounded"></div>
                        <span>Medium (60%+)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-yellow-500/70 rounded"></div>
                        <span>Low (40%+)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Live Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <Card className="card-fun">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Live Guest Activities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockGuestActivities.map((guest, index) => (
                  <motion.div
                    key={guest.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedGuest?.id === guest.id 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                    onClick={() => setSelectedGuest(guest)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{guest.guestName}</div>
                          <div className="text-xs text-muted-foreground">Room {guest.room}</div>
                        </div>
                      </div>
                      <Badge variant={guest.status === 'active' ? 'default' : 'secondary'} className="bg-green-100 text-green-700">
                        {guest.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      {getActivityIcon(guest.activity)}
                      <span>{guest.activity}</span>
                      <span className="text-muted-foreground">at {guest.currentLocation}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {guest.timestamp}
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {guest.duration}m
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Zone Statistics */}
            <Card className="card-fun">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  Zone Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {heatZones.slice(0, 4).map((zone, index) => (
                    <motion.div
                      key={zone.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50"
                    >
                      <div>
                        <div className="font-medium text-sm">{zone.name}</div>
                        <div className="text-xs text-muted-foreground">{zone.guests} active guests</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${getHeatColor(zone.intensity)}`}></div>
                        <span className="text-sm font-semibold">{zone.intensity}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Guest Timeline Detail */}
        <AnimatePresence>
          {selectedGuest && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedGuest(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold">{selectedGuest.guestName}'s Journey</h3>
                    <p className="text-muted-foreground">Guest ID: {selectedGuest.guestId} • Room {selectedGuest.room}</p>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedGuest(null)}>
                    Close
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold">Current Activity</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{selectedGuest.activity}</span> at <span className="text-blue-600">{selectedGuest.currentLocation}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Started at {selectedGuest.timestamp} • Duration: {selectedGuest.duration} minutes
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Navigation className="h-4 w-4" />
                      Journey Path
                    </h4>
                    <div className="space-y-2">
                      {selectedGuest.path.map((location, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                            index === selectedGuest.path.length - 1 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className={`font-medium ${
                              index === selectedGuest.path.length - 1 ? 'text-blue-600' : ''
                            }`}>
                              {location}
                            </div>
                            {index < selectedGuest.path.length - 1 && (
                              <div className="text-xs text-muted-foreground">↓</div>
                            )}
                          </div>
                          {index === selectedGuest.path.length - 1 && (
                            <Badge className="bg-green-100 text-green-700">Current</Badge>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}