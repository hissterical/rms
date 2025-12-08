"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { PhotoCapture } from "@/components/photo-capture"
import { useGuest } from "@/contexts/guest-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Camera, 
  ArrowLeft, 
  User, 
  IdCard, 
  CheckCircle2, 
  Upload,
  Users,
  ArrowRight
} from "lucide-react"

interface GuestData {
  id: string
  name: string
  idType: string
  idNumber: string
  photoUrl: string
}

export default function DocumentUploadPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('booking') || 'BOOKING-DEFAULT'
  
  const router = useRouter()
  const { setCheckInData } = useGuest()
  
  const [guests, setGuests] = useState<GuestData[]>([])
  const [currentGuestIndex, setCurrentGuestIndex] = useState(0)
  const [showCamera, setShowCamera] = useState(false)
  const [numberOfGuests, setNumberOfGuests] = useState(1)
  const [setupComplete, setSetupComplete] = useState(false)
  
  const [currentGuest, setCurrentGuest] = useState({
    name: '',
    idType: '',
    idNumber: ''
  })

  const currentGuestData = guests[currentGuestIndex]
  const allGuestsCompleted = guests.length === numberOfGuests && guests.every(g => g.photoUrl)

  const handlePhotoCapture = (photoUrl: string) => {
    const newGuest: GuestData = {
      id: `GUEST-${Date.now()}`,
      name: currentGuest.name,
      idType: currentGuest.idType,
      idNumber: currentGuest.idNumber,
      photoUrl
    }

    setGuests(prev => {
      const updated = [...prev]
      updated[currentGuestIndex] = newGuest
      return updated
    })
    
    setShowCamera(false)
    
    // Move to next guest or complete
    if (currentGuestIndex < numberOfGuests - 1) {
      setCurrentGuestIndex(prev => prev + 1)
      setCurrentGuest({ name: '', idType: '', idNumber: '' })
    }
  }

  const handleStartCapture = () => {
    if (!currentGuest.name || !currentGuest.idType || !currentGuest.idNumber) {
      alert('Please fill in all guest details before capturing photo')
      return
    }
    setShowCamera(true)
  }

  const handleProceedToCheckin = () => {
    // Save all guest data
    setCheckInData({
      bookingId,
      roomNumber: '', // Will be assigned during check-in
      guests: guests.map(g => ({
        id: g.id,
        guestName: g.name,
        idType: g.idType,
        idNumber: g.idNumber,
        photoUrl: g.photoUrl,
        uploadedAt: new Date().toISOString()
      })),
      checkInDate: new Date().toISOString(),
      checkOutDate: '',
      purposeOfVisit: '',
      qrCode: bookingId,
      verificationStatus: 'pending'
    })

    router.push('/check-in')
  }

  const handleSetupGuests = () => {
    if (numberOfGuests < 1 || numberOfGuests > 10) {
      alert('Please enter a valid number of guests (1-10)')
      return
    }
    setSetupComplete(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/scanner">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-800 bg-clip-text text-transparent">
                Document Upload
              </h1>
              <p className="text-sm text-gray-600">Upload photos and IDs for all guests</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Booking Info */}
          <Card className="mb-6 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Booking ID</p>
                  <p className="text-lg font-bold text-slate-700">{bookingId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Guests Completed</p>
                  <p className="text-lg font-bold text-slate-700">
                    {guests.filter(g => g.photoUrl).length} / {numberOfGuests}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!setupComplete ? (
            /* Initial Setup */
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="mx-auto w-20 h-20 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mb-4"
                >
                  <Users className="w-10 h-10 text-white" />
                </motion.div>
                <CardTitle className="text-3xl font-bold">
                  How many guests?
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  We'll collect photos and documents for each guest
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="max-w-xs mx-auto space-y-4">
                  <div>
                    <Label htmlFor="numberOfGuests">Number of Guests</Label>
                    <Input
                      id="numberOfGuests"
                      type="number"
                      min="1"
                      max="10"
                      value={numberOfGuests}
                      onChange={(e) => setNumberOfGuests(parseInt(e.target.value) || 1)}
                      className="text-center text-2xl font-bold h-16"
                    />
                  </div>

                  <Button
                    onClick={handleSetupGuests}
                    size="lg"
                    className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Guest Upload Flow */
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Guest List Sidebar */}
              <Card className="lg:col-span-1 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    All Guests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Array.from({ length: numberOfGuests }, (_, i) => {
                    const guest = guests[i]
                    const isCompleted = guest?.photoUrl
                    const isCurrent = i === currentGuestIndex

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => !isCompleted && setCurrentGuestIndex(i)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isCurrent
                            ? 'border-slate-600 bg-slate-50'
                            : isCompleted
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isCompleted ? (
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-sm">
                              {guest?.name || `Guest ${i + 1}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Main Upload Form */}
              <Card className="lg:col-span-2 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Guest {currentGuestIndex + 1} Details
                  </CardTitle>
                  <p className="text-gray-600">
                    Please provide guest information and capture photo
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {currentGuestData?.photoUrl ? (
                    /* Show completed guest */
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center space-y-4"
                    >
                      <div className="relative w-48 h-48 mx-auto">
                        <img
                          src={currentGuestData.photoUrl}
                          alt={currentGuestData.name}
                          className="w-full h-full object-cover rounded-2xl border-4 border-green-300"
                        />
                        <div className="absolute -top-2 -right-2 w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center border-4 border-white">
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold">{currentGuestData.name}</h3>
                        <p className="text-gray-600">
                          {currentGuestData.idType}: {currentGuestData.idNumber}
                        </p>
                      </div>

                      {currentGuestIndex < numberOfGuests - 1 && (
                        <Button
                          onClick={() => {
                            setCurrentGuestIndex(prev => prev + 1)
                            setCurrentGuest({ name: '', idType: '', idNumber: '' })
                          }}
                          size="lg"
                          className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
                        >
                          Next Guest
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      )}
                    </motion.div>
                  ) : (
                    /* Guest form */
                    <>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="guestName">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="guestName"
                              value={currentGuest.name}
                              onChange={(e) => setCurrentGuest(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter guest full name"
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="idType">ID Type</Label>
                          <Select
                            value={currentGuest.idType}
                            onValueChange={(value) => setCurrentGuest(prev => ({ ...prev, idType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select ID type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="passport">Passport</SelectItem>
                              <SelectItem value="drivers_license">Driver's License</SelectItem>
                              <SelectItem value="national_id">National ID</SelectItem>
                              <SelectItem value="aadhar">Aadhar Card</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="idNumber">ID Number</Label>
                          <div className="relative">
                            <IdCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="idNumber"
                              value={currentGuest.idNumber}
                              onChange={(e) => setCurrentGuest(prev => ({ ...prev, idNumber: e.target.value }))}
                              placeholder="Enter ID number"
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleStartCapture}
                        size="lg"
                        className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 h-14"
                        disabled={!currentGuest.name || !currentGuest.idType || !currentGuest.idNumber}
                      >
                        <Camera className="mr-2 h-5 w-5" />
                        Capture Selfie Photo
                      </Button>

                      <p className="text-xs text-center text-gray-500">
                        Make sure the guest's face is clearly visible in good lighting
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Proceed to Check-in Button */}
          {allGuestsCompleted && setupComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Card className="shadow-xl bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
                    <div>
                      <h3 className="text-2xl font-bold text-green-900">
                        All Guests Registered!
                      </h3>
                      <p className="text-green-700 mt-2">
                        All guest photos and documents have been uploaded successfully
                      </p>
                    </div>
                    <Button
                      onClick={handleProceedToCheckin}
                      size="lg"
                      className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
                    >
                      Proceed to Check-in
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Photo Capture Modal */}
      <AnimatePresence>
        {showCamera && (
          <PhotoCapture
            onCapture={handlePhotoCapture}
            onClose={() => setShowCamera(false)}
            title={`Photo for ${currentGuest.name}`}
            instructions="Please face the camera and ensure good lighting"
          />
        )}
      </AnimatePresence>
    </div>
  )
}