"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useGuest } from "@/contexts/guest-context"
import { useHotel } from "@/contexts/hotel-context"
import { Room360Viewer } from "@/components/room-360-viewer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { generateRoomQRCode, downloadQRCode } from "@/lib/qr-utils"
import { 
  ArrowLeft, 
  CheckCircle2, 
  User, 
  IdCard, 
  MapPin,
  Calendar,
  QrCode,
  Eye,
  AlertCircle,
  Loader2,
  Home,
  Sparkles,
  Download
} from "lucide-react"

type VerificationStep = 'guest-review' | 'id-verification' | 'purpose' | 'room-assignment' | '360-view' | 'qr-generation' | 'complete'

export default function CheckInPage() {
  const router = useRouter()
  const { checkInData, updateCheckInData } = useGuest()
  const { hotelData } = useHotel()
  
  const [currentStep, setCurrentStep] = useState<VerificationStep>('guest-review')
  const [loading, setLoading] = useState(false)
  const [show360View, setShow360View] = useState(false)
  const [hasViewed360, setHasViewed360] = useState(false)
  
  // Form state
  const [purposeOfVisit, setPurposeOfVisit] = useState('')
  const [visitDetails, setVisitDetails] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [assignedRoom, setAssignedRoom] = useState('')
  const [generatedQR, setGeneratedQR] = useState('')
  const [qrCodeImage, setQrCodeImage] = useState<string>('')

  const steps: { id: VerificationStep; title: string; icon: any }[] = [
    { id: 'guest-review', title: 'Guest Review', icon: User },
    { id: 'id-verification', title: 'ID Verification', icon: IdCard },
    { id: 'purpose', title: 'Purpose of Visit', icon: MapPin },
    { id: 'room-assignment', title: 'Room Assignment', icon: Home },
    { id: '360-view', title: '360° Room View', icon: Eye },
    { id: 'qr-generation', title: 'QR Code', icon: QrCode },
    { id: 'complete', title: 'Complete', icon: CheckCircle2 }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  useEffect(() => {
    if (!checkInData || !checkInData.guests || checkInData.guests.length === 0) {
      router.push('/document-upload')
    }
  }, [checkInData, router])

  const handleGuestReviewComplete = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setCurrentStep('id-verification')
    }, 1500)
  }

  const handleIdVerificationComplete = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setCurrentStep('purpose')
    }, 2000)
  }

  const handlePurposeSubmit = () => {
    if (!purposeOfVisit || !checkOutDate) {
      alert('Please fill in all required fields')
      return
    }

    updateCheckInData({
      ...checkInData!,
      purposeOfVisit,
      checkOutDate,
      verificationStatus: 'verified'
    })

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setCurrentStep('room-assignment')
    }, 1000)
  }

  const handleRoomAssignment = () => {
    if (!assignedRoom) {
      alert('Please assign a room')
      return
    }

    updateCheckInData({
      ...checkInData!,
      roomNumber: assignedRoom
    })

    setCurrentStep('360-view')
  }

  const handle360ViewComplete = () => {
    setHasViewed360(true)
    setShow360View(false)
    setCurrentStep('qr-generation')
  }

  const handleGenerateQR = async () => {
    setLoading(true)
    try {
      const propertyId = hotelData?.id || 'c77219bf-d16f-4860-9506-d1b5e64e7902'
      const bookingId = checkInData?.bookingId || 'unknown'
      
      // Generate actual QR code image
      const qrDataURL = await generateRoomQRCode(
        propertyId,
        assignedRoom,
        bookingId
      )
      
      const qrCode = `CHECKIN-${bookingId}-${assignedRoom}-${Date.now()}`
      setGeneratedQR(qrCode)
      setQrCodeImage(qrDataURL)
      
      updateCheckInData({
        ...checkInData!,
        qrCode,
        verificationStatus: 'completed'
      })

      setLoading(false)
      setCurrentStep('complete')
    } catch (error) {
      console.error('Error generating QR code:', error)
      setLoading(false)
      alert('Failed to generate QR code. Please try again.')
    }
  }

  const handleDownloadQR = async () => {
    if (!qrCodeImage) return
    try {
      const propertyId = hotelData?.id || 'c77219bf-d16f-4860-9506-d1b5e64e7902'
      const bookingId = checkInData?.bookingId || 'unknown'
      const roomServiceURL = `${typeof window !== 'undefined' ? window.location.origin : ''}/room-services?hotel=${propertyId}&room=${assignedRoom}&booking=${bookingId}`
      
      await downloadQRCode(
        roomServiceURL,
        `room-${assignedRoom}-access-${bookingId}`,
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

  if (!checkInData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm border-b sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/document-upload">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-800 bg-clip-text text-transparent">
                Guest Check-In
              </h1>
              <p className="text-sm text-gray-600">Complete verification process</p>
            </div>
            <Badge variant="outline" className="text-sm">
              Booking: {checkInData.bookingId}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="relative flex-1">
                  <div className={`h-2 rounded-full transition-all ${
                    index <= currentStepIndex 
                      ? 'bg-gradient-to-r from-slate-600 to-slate-700' 
                      : 'bg-gray-200'
                  }`} />
                  <div className={`absolute -top-8 left-0 right-0 text-center ${
                    index === currentStepIndex ? 'block' : 'hidden md:block'
                  }`}>
                    <div className={`text-xs font-medium ${
                      index <= currentStepIndex ? 'text-slate-700' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Guest Review */}
          {currentStep === 'guest-review' && (
            <motion.div
              key="guest-review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <User className="h-6 w-6 text-slate-600" />
                    Review All Guests
                  </CardTitle>
                  <p className="text-gray-600">
                    Verify all guest information before proceeding
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {checkInData.guests.map((guest, index) => (
                      <motion.div
                        key={guest.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="overflow-hidden border-2 border-slate-200 hover:border-slate-400 transition-all">
                          <div className="flex gap-4 p-4">
                            <div className="relative w-24 h-24 flex-shrink-0">
                              <img
                                src={guest.photoUrl}
                                alt={guest.guestName}
                                className="w-full h-full object-cover rounded-lg border-2 border-slate-300"
                              />
                              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                                <CheckCircle2 className="h-4 w-4 text-white" />
                              </div>
                            </div>
                            <div className="flex-1 space-y-1">
                              <h3 className="font-bold text-lg">{guest.guestName}</h3>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <IdCard className="h-4 w-4" />
                                  <span className="capitalize">{guest.idType.replace('_', ' ')}</span>
                                </div>
                                <p className="text-gray-600 font-mono">{guest.idNumber}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                Guest {index + 1}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleGuestReviewComplete}
                      disabled={loading}
                      size="lg"
                      className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Confirm All Guests
                          <CheckCircle2 className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: ID Verification */}
          {currentStep === 'id-verification' && (
            <motion.div
              key="id-verification"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <IdCard className="h-6 w-6 text-slate-600" />
                    ID Verification
                  </CardTitle>
                  <p className="text-gray-600">
                    Verifying identity documents...
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {checkInData.guests.map((guest, index) => (
                    <motion.div
                      key={guest.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.3 }}
                      className="p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-2 border-green-500">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-green-900">
                              {guest.guestName}
                            </h3>
                            <p className="text-sm text-green-700">
                              {guest.idType.toUpperCase()}: {guest.idNumber}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              ✓ Identity Verified Successfully
                            </p>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.6, delay: index * 0.3 }}
                        >
                          <Sparkles className="h-8 w-8 text-green-600" />
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}

                  <Button
                    onClick={handleIdVerificationComplete}
                    disabled={loading}
                    size="lg"
                    className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        All IDs Verified
                        <CheckCircle2 className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Purpose of Visit */}
          {currentStep === 'purpose' && (
            <motion.div
              key="purpose"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-slate-600" />
                    Purpose of Visit
                  </CardTitle>
                  <p className="text-gray-600">
                    Please provide visit details
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="purpose">Purpose of Visit *</Label>
                    <Select value={purposeOfVisit} onValueChange={setPurposeOfVisit}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="leisure">Leisure / Vacation</SelectItem>
                        <SelectItem value="conference">Conference / Event</SelectItem>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="family">Family Visit</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="checkOutDate">Expected Check-out Date *</Label>
                    <Input
                      id="checkOutDate"
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="visitDetails">Additional Details (Optional)</Label>
                    <Textarea
                      id="visitDetails"
                      value={visitDetails}
                      onChange={(e) => setVisitDetails(e.target.value)}
                      placeholder="Any special requirements or notes..."
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handlePurposeSubmit}
                    disabled={loading || !purposeOfVisit || !checkOutDate}
                    size="lg"
                    className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
                  >
                    Continue to Room Assignment
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Room Assignment */}
          {currentStep === 'room-assignment' && (
            <motion.div
              key="room-assignment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Home className="h-6 w-6 text-slate-600" />
                    Room Assignment
                  </CardTitle>
                  <p className="text-gray-600">
                    Select available room for {checkInData.guests.length} guest(s)
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="roomSelect">Select Room</Label>
                    <Select value={assignedRoom} onValueChange={setAssignedRoom}>
                      <SelectTrigger className="text-lg h-12">
                        <SelectValue placeholder="Choose a room" />
                      </SelectTrigger>
                      <SelectContent>
                        {hotelData && Array.from({ length: hotelData.numberOfFloors }, (_, floor) =>
                          Array.from({ length: hotelData.roomsPerFloor }, (_, room) => {
                            const roomNum = `${floor + 1}${String(room + 1).padStart(2, '0')}`
                            return (
                              <SelectItem key={roomNum} value={roomNum}>
                                Room {roomNum} - Floor {floor + 1}
                              </SelectItem>
                            )
                          })
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {assignedRoom && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                          <Home className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-blue-900">
                            Room {assignedRoom}
                          </h3>
                          <p className="text-sm text-blue-700 mt-1">
                            Floor {assignedRoom[0]} • Deluxe Room
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge variant="secondary">King Bed</Badge>
                            <Badge variant="secondary">City View</Badge>
                            <Badge variant="secondary">WiFi</Badge>
                            <Badge variant="secondary">Mini Bar</Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <Button
                    onClick={handleRoomAssignment}
                    disabled={!assignedRoom}
                    size="lg"
                    className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
                  >
                    Confirm Room {assignedRoom}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 5: 360 View */}
          {currentStep === '360-view' && (
            <motion.div
              key="360-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="shadow-xl">
                <CardHeader className="text-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="mx-auto w-20 h-20 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mb-4"
                  >
                    <Eye className="w-10 h-10 text-white" />
                  </motion.div>
                  <CardTitle className="text-3xl font-bold">
                    Virtual Room Tour
                  </CardTitle>
                  <p className="text-gray-600 mt-2">
                    Explore your room in 360° before check-in
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-8 rounded-xl bg-gradient-to-br from-slate-100 to-gray-100 border-2 border-slate-300 text-center">
                    <h3 className="text-xl font-bold mb-2">Room {assignedRoom}</h3>
                    <p className="text-gray-600 mb-6">
                      Take a virtual tour to familiarize yourself with your accommodation
                    </p>
                    <Button
                      onClick={() => setShow360View(true)}
                      size="lg"
                      className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
                    >
                      <Eye className="mr-2 h-5 w-5" />
                      Start 360° Tour
                    </Button>
                  </div>

                  {hasViewed360 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Button
                        onClick={() => setCurrentStep('qr-generation')}
                        size="lg"
                        variant="outline"
                        className="w-full border-2"
                      >
                        Skip Tour & Continue
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 6: QR Generation */}
          {currentStep === 'qr-generation' && (
            <motion.div
              key="qr-generation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="shadow-xl">
                <CardHeader className="text-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="mx-auto w-20 h-20 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mb-4"
                  >
                    <QrCode className="w-10 h-10 text-white" />
                  </motion.div>
                  <CardTitle className="text-3xl font-bold">
                    Generate Access QR Code
                  </CardTitle>
                  <p className="text-gray-600 mt-2">
                    Your digital room key
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-200 text-center">
                    <p className="text-gray-700 mb-4">
                      Generate a unique QR code for room access and services
                    </p>
                    <Button
                      onClick={handleGenerateQR}
                      disabled={loading}
                      size="lg"
                      className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating QR Code...
                        </>
                      ) : (
                        <>
                          <QrCode className="mr-2 h-5 w-5" />
                          Generate QR Code
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 7: Complete */}
          {currentStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
                <CardContent className="p-12 text-center space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="mx-auto w-24 h-24 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-14 h-14 text-white" />
                  </motion.div>

                  <div>
                    <h2 className="text-4xl font-bold text-green-900 mb-2">
                      Check-In Complete!
                    </h2>
                    <p className="text-lg text-green-700">
                      Welcome to {hotelData?.hotelName || 'our hotel'}
                    </p>
                  </div>

                  <div className="p-6 bg-white rounded-xl shadow-lg">
                    <div className="grid md:grid-cols-2 gap-6 text-left">
                      <div>
                        <p className="text-sm text-gray-600">Booking ID</p>
                        <p className="text-lg font-bold">{checkInData.bookingId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Room Number</p>
                        <p className="text-lg font-bold">{assignedRoom}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Guests</p>
                        <p className="text-lg font-bold">{checkInData.guests.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Check-out</p>
                        <p className="text-lg font-bold">
                          {new Date(checkOutDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {generatedQR && qrCodeImage && (
                      <div className="mt-6 p-6 bg-slate-100 rounded-lg">
                        <div className="w-64 h-64 mx-auto bg-white rounded-lg shadow-md p-4 mb-3">
                          <img 
                            src={qrCodeImage} 
                            alt="Room Access QR Code" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-xs text-gray-600 text-center font-mono mb-2">
                          {generatedQR}
                        </p>
                        <p className="text-sm text-gray-600 text-center mb-3">
                          Use this QR code for room access and services
                        </p>
                        <Button
                          onClick={handleDownloadQR}
                          variant="outline"
                          size="sm"
                          className="mx-auto block"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download QR Code
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => router.push(`/room-services?room=${assignedRoom}`)}
                      size="lg"
                      className="flex-1 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900"
                    >
                      Room Services
                    </Button>
                    <Button
                      onClick={() => router.push('/dashboard')}
                      size="lg"
                      variant="outline"
                      className="flex-1"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 360 Viewer Modal */}
      <AnimatePresence>
        {show360View && (
          <Room360Viewer
            roomNumber={assignedRoom}
            onClose={() => setShow360View(false)}
            onComplete={handle360ViewComplete}
          />
        )}
      </AnimatePresence>
    </div>
  )
}