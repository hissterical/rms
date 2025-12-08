"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { propertyAPI } from "@/lib/property-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building,
  MapPin,
  Phone,
  Globe,
  ArrowLeft,
  ArrowRight,
  Star,
  Hotel,
  Hash,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { BuildingIllustration } from "@/components/building-illustration";

export default function NewPropertyPage() {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Property Details
    name: "",
    property_type: "Hotel" as
      | "Hotel"
      | "Resort"
      | "Guesthouse"
      | "Hostel"
      | "Apartment",
    phone: "",
    website: "",

    // Location
    city: "",
    state: "",
    country: "",
    address: "",
    zipCode: "",

    // Additional
    description: "",
    main_image_url: "",

    // For visualization
    numberOfFloors: 3,
    roomsPerFloor: 10,
  });

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
      return;
    }

    if (!isAuthenticated || user?.role !== "property_owner") {
      toast({
        title: "Error",
        description: "Only property owners can create properties",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Build the full address from components
      const fullAddress =
        `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`.trim();

      await propertyAPI.createProperty({
        name: formData.name,
        property_type: formData.property_type,
        address: fullAddress,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        description: formData.description || undefined,
        main_image_url: formData.main_image_url || undefined,
        numberOfFloors: formData.numberOfFloors,
        roomsPerFloor: formData.roomsPerFloor,
      });

      toast({
        title: "Success!",
        description: "Property created successfully.",
      });

      router.push("/properties");
    } catch (error: any) {
      console.error("Create property error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create property",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]:
          name === "numberOfFloors" || name === "roomsPerFloor"
            ? Math.max(1, parseInt(value) || 1)
            : value,
      };
      return newData;
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2].map((step) => (
        <div key={step} className="flex items-center">
          <motion.div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              step <= currentStep
                ? "bg-slate-600 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
            animate={{
              scale: step === currentStep ? 1.1 : 1,
              backgroundColor: step <= currentStep ? "#475569" : "#e5e7eb",
            }}
          >
            {step}
          </motion.div>
          {step < 2 && (
            <div
              className={`w-12 h-1 mx-2 transition-all ${
                step < currentStep ? "bg-slate-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Property Information
        </h2>
        <p className="text-gray-600">Tell us about your property</p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="name">Property Name *</Label>
        <div className="relative">
          <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your property name"
            className="pl-10"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="property_type">Property Type *</Label>
        <Select
          value={formData.property_type}
          onValueChange={(value) => handleSelectChange("property_type", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select property type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Hotel">Hotel</SelectItem>
            <SelectItem value="Resort">Resort</SelectItem>
            <SelectItem value="Guesthouse">Guesthouse</SelectItem>
            <SelectItem value="Hostel">Hostel</SelectItem>
            <SelectItem value="Apartment">Apartment</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={itemVariants} className="space-y-2">
          <Label htmlFor="city">City *</Label>
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
          <Label htmlFor="state">State/Province *</Label>
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
        <Label htmlFor="country">Country *</Label>
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
        <Label htmlFor="address">Street Address *</Label>
        <Textarea
          id="address"
          name="address"
          placeholder="Enter street address"
          className="min-h-[80px]"
          value={formData.address}
          onChange={handleInputChange}
          required
        />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
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
  );

  const renderStep2 = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Additional Details
        </h2>
        <p className="text-gray-600">
          Optional information about your property
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Enter phone number"
            className="pl-10"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <div className="relative">
          <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="website"
            name="website"
            type="url"
            placeholder="https://yourproperty.com"
            className="pl-10"
            value={formData.website}
            onChange={handleInputChange}
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="description">Property Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe your property, amenities, and unique features..."
          className="min-h-[100px]"
          value={formData.description}
          onChange={handleInputChange}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="main_image_url">Main Image URL</Label>
        <Input
          id="main_image_url"
          name="main_image_url"
          type="url"
          placeholder="https://example.com/image.jpg"
          value={formData.main_image_url}
          onChange={handleInputChange}
        />
        <p className="text-xs text-muted-foreground">
          Optional: URL to a main image of your property
        </p>
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
          />
          <p className="text-xs text-muted-foreground">
            For visualization only
          </p>
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
          />
          <p className="text-xs text-muted-foreground">
            For visualization only
          </p>
        </motion.div>
      </div>
    </motion.div>
  );

  if (!isAuthenticated || user?.role !== "property_owner") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            Only property owners can create properties
          </p>
          <div className="mt-4 flex justify-center">
            <Link href="/properties">
              <Button variant="outline">Go Back</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

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
              <div className="flex items-center justify-between mb-4">
                <Link href="/dashboard/properties">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
              </div>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mb-4"
              >
                <Hotel className="w-8 h-8 text-white" />
              </motion.div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-800 bg-clip-text text-transparent">
                Create Property
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Add a new property to your portfolio
              </p>
            </CardHeader>

            <CardContent>
              {renderStepIndicator()}

              <form onSubmit={handleSubmit}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}

                <div className="mt-8 flex flex-col space-y-4">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                      />
                    ) : currentStep < 2 ? (
                      <>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Create Property
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
  );
}
