"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useGuest } from "@/contexts/guest-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Chatbot from "@/components/chatbot";
import VoiceAssistant from "@/components/voice-assistant";
import {
  ArrowLeft,
  Phone,
  AlertCircle,
  Sparkles,
  Wrench,
  Bell,
  MessageSquare,
  Package,
  Shirt,
  Droplets,
  Wind,
  Coffee,
  Utensils,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Mic,
  MicOff,
  Send,
  Home,
  User,
} from "lucide-react";

type ServiceCategory =
  | "emergency"
  | "housekeeping"
  | "maintenance"
  | "concierge"
  | "essentials"
  | "other";

interface ServiceRequest {
  id: string;
  category: ServiceCategory;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  createdAt: string;
}

function RoomServicesPageContent() {
  const searchParams = useSearchParams();
  const roomNumber = searchParams.get("room") || "301";

  const router = useRouter();
  const { addServiceRequest, serviceRequests } = useGuest();

  const [activeTab, setActiveTab] = useState<"services" | "requests">(
    "services"
  );
  const [selectedCategory, setSelectedCategory] =
    useState<ServiceCategory | null>(null);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);

  // Emergency contact
  const emergencyNumber = "+1 (555) 123-4567";

  // Service categories
  const serviceCategories = [
    {
      id: "housekeeping" as ServiceCategory,
      title: "Housekeeping",
      icon: Sparkles,
      color: "from-slate-600 to-slate-700",
      items: [
        "Room Cleaning",
        "Fresh Towels",
        "Bed Linens Change",
        "Bathroom Cleaning",
        "Vacuum Service",
      ],
    },
    {
      id: "maintenance" as ServiceCategory,
      title: "Maintenance",
      icon: Wrench,
      color: "from-teal-600 to-teal-700",
      items: [
        "AC/Heating Issue",
        "Plumbing Problem",
        "Electrical Issue",
        "Furniture Repair",
        "TV/Electronics",
      ],
    },
    {
      id: "essentials" as ServiceCategory,
      title: "Essentials",
      icon: Package,
      color: "from-cyan-600 to-cyan-700",
      items: [
        "Extra Pillows",
        "Blankets",
        "Toiletries",
        "Hangers",
        "Iron/Ironing Board",
      ],
    },
    {
      id: "concierge" as ServiceCategory,
      title: "Concierge",
      icon: Bell,
      color: "from-slate-700 to-slate-800",
      items: [
        "Restaurant Booking",
        "Transportation",
        "Tour Information",
        "Local Recommendations",
        "Luggage Assistance",
      ],
    },
    {
      id: "other" as ServiceCategory,
      title: "Other",
      icon: MessageSquare,
      color: "from-slate-500 to-slate-600",
      items: ["Custom Request"],
    },
  ];

  // Voice Assistant
  const startVoiceAssistant = () => {
    setIsListening(true);

    // Simulate voice recognition
    setTimeout(() => {
      setRequestDescription(
        "I need extra towels and pillows in room " + roomNumber
      );
      setIsListening(false);
    }, 3000);
  };

  const stopVoiceAssistant = () => {
    setIsListening(false);
  };

  // Handle service request
  const handleServiceRequest = (category: ServiceCategory, item: string) => {
    setSelectedCategory(category);
    setRequestTitle(item);
    setRequestDescription(`Request for ${item} in Room ${roomNumber}`);
  };

  const submitServiceRequest = () => {
    if (!selectedCategory || !requestTitle) {
      alert("Please select a service first");
      return;
    }

    addServiceRequest({
      type: selectedCategory,
      description: requestDescription || requestTitle,
      status: "pending",
    });

    // Show success modal
    setShowSuccessModal(true);

    // Reset form
    setTimeout(() => {
      setSelectedCategory(null);
      setRequestTitle("");
      setRequestDescription("");
      setShowSuccessModal(false);
    }, 2000);
  };

  // Filter requests for this room
  const roomRequests = serviceRequests.filter((req) =>
    req.description.includes(roomNumber)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm border-b sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-800 bg-clip-text text-transparent">
                  Room Services
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Home className="h-4 w-4 text-gray-600" />
                  <p className="text-sm text-gray-600">Room {roomNumber}</p>
                </div>
              </div>
            </div>

            {/* Emergency Button */}
            <a href={`tel:${emergencyNumber}`}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg animate-pulse"
              >
                <AlertCircle className="mr-2 h-5 w-5" />
                Emergency
              </Button>
            </a>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={activeTab === "services" ? "default" : "outline"}
              onClick={() => setActiveTab("services")}
              className={activeTab === "services" ? "bg-slate-700" : ""}
            >
              Services
            </Button>
            <Button
              variant={activeTab === "requests" ? "default" : "outline"}
              onClick={() => setActiveTab("requests")}
              className={activeTab === "requests" ? "bg-slate-700" : ""}
            >
              My Requests
              {roomRequests.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {roomRequests.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "services" ? (
            /* Services Tab */
            <motion.div
              key="services"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Emergency Contact Card */}
              <Card className="shadow-xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-red-500 rounded-full flex items-center justify-center">
                        <Phone className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-red-900">
                          24/7 Emergency
                        </h3>
                        <p className="text-red-700">
                          Available anytime for urgent assistance
                        </p>
                        <a
                          href={`tel:${emergencyNumber}`}
                          className="text-2xl font-bold text-red-600 hover:text-red-700 transition-colors"
                        >
                          {emergencyNumber}
                        </a>
                      </div>
                    </div>
                    <a href={`tel:${emergencyNumber}`}>
                      <Button size="lg" className="bg-red-600 hover:bg-red-700">
                        <Phone className="mr-2 h-5 w-5" />
                        Call Now
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Restaurant Menu Card */}
              <Link href={`/food?room=${roomNumber}`}>
                <Card className="shadow-lg border-2 border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 hover:shadow-xl transition-all cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-teal-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Utensils className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">
                            Restaurant Menu
                          </h3>
                          <p className="text-slate-700">
                            Order food & beverages to your room
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            Multi-language • Voice search • Group ordering
                          </p>
                        </div>
                      </div>
                      <Button
                        size="lg"
                        className="bg-teal-600 hover:bg-teal-700 group-hover:scale-105 transition-transform"
                      >
                        Order Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Voice Assistant Card */}
              <Card className="shadow-lg border-2 border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-6 w-6 text-slate-700" />
                    Voice Assistant
                  </CardTitle>
                  <CardDescription>
                    Speak your request and get voice responses instantly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg text-center">
                    <Mic className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-700">
                      Use voice commands to request services, ask questions, and
                      get instant voice replies
                    </p>
                  </div>

                  <Button
                    onClick={() => setIsVoiceAssistantOpen(true)}
                    size="lg"
                    className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900"
                  >
                    <Mic className="mr-2 h-5 w-5" />
                    Open Voice Assistant
                  </Button>

                  <p className="text-xs text-slate-500 text-center">
                    AI-powered • Works in Chrome/Edge
                  </p>
                </CardContent>
              </Card>

              {/* Service Categories Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {serviceCategories.map((category) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="shadow-lg hover:shadow-xl transition-all h-full">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`h-12 w-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center`}
                          >
                            <category.icon className="h-6 w-6 text-white" />
                          </div>
                          <CardTitle className="text-xl">
                            {category.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {category.items.map((item, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="w-full justify-start text-left hover:bg-slate-50 hover:border-slate-400"
                              onClick={() =>
                                handleServiceRequest(category.id, item)
                              }
                            >
                              {item}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Custom Request Form */}
              {selectedCategory && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="shadow-xl border-2 border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Send className="h-6 w-6 text-blue-600" />
                        Submit Service Request
                      </CardTitle>
                      <CardDescription>
                        Review and customize your request
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="requestTitle">Service</Label>
                        <Input
                          id="requestTitle"
                          value={requestTitle}
                          onChange={(e) => setRequestTitle(e.target.value)}
                          placeholder="What do you need?"
                        />
                      </div>

                      <div>
                        <Label htmlFor="requestDescription">
                          Additional Details (Optional)
                        </Label>
                        <Textarea
                          id="requestDescription"
                          value={requestDescription}
                          onChange={(e) =>
                            setRequestDescription(e.target.value)
                          }
                          placeholder="Any specific instructions or preferences..."
                          rows={4}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => setSelectedCategory(null)}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={submitServiceRequest}
                          className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Submit Request
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Requests Tab */
            <motion.div
              key="requests"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Your Service Requests</CardTitle>
                  <CardDescription>
                    Track all your requests and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {roomRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg">
                        No service requests yet
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        Submit a request from the Services tab
                      </p>
                      <Button
                        onClick={() => setActiveTab("services")}
                        className="mt-4"
                        variant="outline"
                      >
                        Browse Services
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {roomRequests.map((request, index) => (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="border-2">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge
                                      variant={
                                        request.status === "completed"
                                          ? "default"
                                          : request.status === "in-progress"
                                          ? "secondary"
                                          : "outline"
                                      }
                                      className={
                                        request.status === "completed"
                                          ? "bg-green-500"
                                          : request.status === "in-progress"
                                          ? "bg-blue-500"
                                          : "bg-yellow-500"
                                      }
                                    >
                                      {request.status === "completed" && (
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                      )}
                                      {request.status === "in-progress" && (
                                        <Clock className="h-3 w-3 mr-1" />
                                      )}
                                      {request.status === "pending" && (
                                        <Clock className="h-3 w-3 mr-1" />
                                      )}
                                      {request.status
                                        .replace("-", " ")
                                        .toUpperCase()}
                                    </Badge>
                                    <span className="text-xs text-gray-500 capitalize">
                                      {request.type}
                                    </span>
                                  </div>
                                  <p className="font-semibold text-lg">
                                    {request.description}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Requested:{" "}
                                    {new Date(
                                      request.createdAt
                                    ).toLocaleString()}
                                  </p>
                                </div>
                                {request.status === "completed" && (
                                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4"
              >
                <CheckCircle2 className="h-10 w-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Request Submitted!
              </h3>
              <p className="text-gray-600">
                Our team will respond shortly. You can track the status in "My
                Requests" tab.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Chatbot */}
      <Chatbot
        context={{
          roomNumber: roomNumber,
          hotelName: "Sohara Hotel",
          services: serviceCategories.flatMap((cat) =>
            cat.items.map((item) => `${cat.title}: ${item}`)
          ),
        }}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistant
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        context={{
          roomNumber: roomNumber,
          hotelName: "Sohara Hotel",
        }}
      />
    </div>
  );
}

export default function RoomServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <RoomServicesPageContent />
    </Suspense>
  );
}
