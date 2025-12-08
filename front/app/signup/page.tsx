"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { useHotel } from "@/contexts/hotel-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { BuildingIllustration } from "@/components/building-illustration"
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Building, 
  MapPin, 
  Phone,
  Hash,
  ArrowRight,
  Hotel,
  Star
} from "lucide-react"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    
    // Hotel Details
    hotelName: "",
    hotelType: "",
    city: "",
    state: "",
    country: "",
    address: "",
    zipCode: "",
    
    // Hotel Structure
    numberOfFloors: 1,
    roomsPerFloor: 1,
    totalRooms: 1,
    
    // Additional Info
    description: ""
  })
  
  const router = useRouter()
  const { setHotelData } = useHotel()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
      return
    }
    
    setIsLoading(true)
    
    // Save hotel data to context
    setHotelData(formData)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push('/dashboard')
    }, 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: name === 'numberOfFloors' || name === 'roomsPerFloor' ? 
          Math.max(1, parseInt(value) || 1) : value
      }
      
      // Auto-calculate total rooms
      if (name === 'numberOfFloors' || name === 'roomsPerFloor') {
        newData.totalRooms = newData.numberOfFloors * newData.roomsPerFloor
      }
      
      return newData
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <motion.div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              step <= currentStep
                ? "bg-slate-600 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
            animate={{
              scale: step === currentStep ? 1.1 : 1,
              backgroundColor: step <= currentStep ? "#475569" : "#e5e7eb"
            }}
          >
            {step}
          </motion.div>
          {step < 3 && (
            <div
              className={`w-12 h-1 mx-2 transition-all ${
                step < currentStep ? "bg-slate-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-gray-600">Let's start with your basic details</p>
      </motion.div>
      
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Enter your full name"
            className="pl-10"
            value={formData.fullName}
            onChange={handleInputChange}
            required
          />
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            className="pl-10"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Enter your phone number"
            className="pl-10"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            className="pl-10 pr-10"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            className="pl-10 pr-10"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )

  const renderStep2 = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hotel Information</h2>
        <p className="text-gray-600">Tell us about your hotel property</p>
      </motion.div>
      
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="hotelName">Hotel Name</Label>
        <div className="relative">
          <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="hotelName"
            name="hotelName"
            type="text"
            placeholder="Enter your hotel name"
            className="pl-10"
            value={formData.hotelName}
            onChange={handleInputChange}
            required
          />
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="hotelType">Hotel Type</Label>
        <Select onValueChange={(value) => handleSelectChange("hotelType", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select hotel type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="luxury">Luxury Hotel</SelectItem>
            <SelectItem value="business">Business Hotel</SelectItem>
            <SelectItem value="boutique">Boutique Hotel</SelectItem>
            <SelectItem value="resort">Resort</SelectItem>
            <SelectItem value="budget">Budget Hotel</SelectItem>
            <SelectItem value="motel">Motel</SelectItem>
            <SelectItem value="hostel">Hostel</SelectItem>
            <SelectItem value="inn">Inn</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>
      
      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={itemVariants} className="space-y-2">
          <Label htmlFor="city">City</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="city"
              name="city"
              type="text"
              placeholder="City"
              className="pl-10"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="space-y-2">
          <Label htmlFor="state">State/Province</Label>
          <Input
            id="state"
            name="state"
            type="text"
            placeholder="State/Province"
            value={formData.state}
            onChange={handleInputChange}
            required
          />
        </motion.div>
      </div>
      
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          name="country"
          type="text"
          placeholder="Country"
          value={formData.country}
          onChange={handleInputChange}
          required
        />
      </motion.div>
      
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="address">Full Address</Label>
        <Textarea
          id="address"
          name="address"
          placeholder="Enter complete address"
          className="min-h-[80px]"
          value={formData.address}
          onChange={handleInputChange}
          required
        />
      </motion.div>
      
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="zipCode">ZIP/Postal Code</Label>
        <div className="relative">
          <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="zipCode"
            name="zipCode"
            type="text"
            placeholder="ZIP/Postal Code"
            className="pl-10"
            value={formData.zipCode}
            onChange={handleInputChange}
            required
          />
        </div>
      </motion.div>
    </motion.div>
  )

  const renderStep3 = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hotel Structure</h2>
        <p className="text-gray-600">Configure your hotel's physical layout</p>
      </motion.div>
      
      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={itemVariants} className="space-y-2">
          <Label htmlFor="numberOfFloors">Number of Floors</Label>
          <Input
            id="numberOfFloors"
            name="numberOfFloors"
            type="number"
            min="1"
            max="50"
            placeholder="Floors"
            value={formData.numberOfFloors}
            onChange={handleInputChange}
            required
          />
        </motion.div>
        
        <motion.div variants={itemVariants} className="space-y-2">
          <Label htmlFor="roomsPerFloor">Rooms per Floor</Label>
          <Input
            id="roomsPerFloor"
            name="roomsPerFloor"
            type="number"
            min="1"
            max="100"
            placeholder="Rooms"
            value={formData.roomsPerFloor}
            onChange={handleInputChange}
            required
          />
        </motion.div>
      </div>
      
      <motion.div variants={itemVariants} className="space-y-2">
        <Label>Total Rooms</Label>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-2xl font-bold text-slate-700">
            {formData.totalRooms} rooms
          </div>
          <div className="text-sm text-slate-600">
            {formData.numberOfFloors} floors × {formData.roomsPerFloor} rooms per floor
          </div>
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="description">Hotel Description (Optional)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe your hotel, amenities, and unique features..."
          className="min-h-[100px]"
          value={formData.description}
          onChange={handleInputChange}
        />
      </motion.div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center"
        >
          <Card className="w-full max-w-md shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mb-4"
              >
                <Hotel className="w-8 h-8 text-white" />
              </motion.div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-800 bg-clip-text text-transparent">
                Create Hotel Profile
              </CardTitle>
              <p className="text-muted-foreground mt-2">Join the future of hotel management</p>
            </CardHeader>
            
            <CardContent>
              {renderStepIndicator()}
              
              <form onSubmit={handleSubmit}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                
                <div className="mt-8 flex flex-col space-y-4">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                      />
                    ) : currentStep < 3 ? (
                      <>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Create Hotel Profile
                        <Star className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="w-full"
                    >
                      Back
                    </Button>
                  )}
                </div>
              </form>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 text-center"
              >
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-slate-600 hover:text-slate-700 font-medium hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Illustration Section */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:flex items-center justify-center"
        >
          <Card className="w-full h-[600px] shadow-xl border-0 bg-gradient-to-br from-gray-50 to-slate-50 overflow-hidden">
            <CardContent className="h-full p-0 flex items-center justify-center">
              <div className="w-full max-w-full overflow-x-auto">
                <BuildingIllustration 
                  floors={formData.numberOfFloors} 
                  roomsPerFloor={formData.roomsPerFloor} 
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}