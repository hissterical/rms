"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { propertyAPI, Property } from "@/lib/property-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Building,
  Plus,
  MapPin,
  Phone,
  Globe,
  Settings,
  LogOut,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

export default function PropertiesPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user && !["property_owner", "manager"].includes(user.role)) {
      toast({
        title: "Access Denied",
        description: "Only property owners and managers can access this page",
        variant: "destructive",
      });
      router.push("/dashboard");
      return;
    }

    if (user) {
      loadProperties();
    }
  }, [user, isAuthenticated, authLoading, router]);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const data = await propertyAPI.getMyProperties();
      setProperties(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load properties",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertyClick = (propertyId: string) => {
    // Store selected property ID and redirect to dashboard
    localStorage.setItem("selectedPropertyId", propertyId);
    router.push("/dashboard");
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  {user?.role === "property_owner"
                    ? "My Properties"
                    : "Assigned Properties"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {user?.first_name} {user?.last_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Add Property Button (Property Owners Only) */}
        {user?.role === "property_owner" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link href="/properties/new">
              <Button className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800">
                <Plus className="h-4 w-4 mr-2" />
                Add New Property
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Building className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              {user?.role === "property_owner"
                ? "No Properties Yet"
                : "No Properties Assigned"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {user?.role === "property_owner"
                ? "Create your first property to get started"
                : "You haven't been assigned to any properties yet"}
            </p>
            {user?.role === "property_owner" && (
              <Link href="/properties/new">
                <Button className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Property
                </Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => handlePropertyClick(property.id)}
                >
                  {property.main_image_url ? (
                    <div className="h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={property.main_image_url}
                        alt={property.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-t-lg flex items-center justify-center">
                      <Building className="h-16 w-16 text-slate-400" />
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{property.name}</span>
                      <span className="text-xs font-normal px-2 py-1 bg-slate-100 rounded-full">
                        {property.property_type}
                      </span>
                    </CardTitle>
                    {property.description && (
                      <CardDescription className="line-clamp-2">
                        {property.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-2">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{property.address}</span>
                    </div>

                    {property.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{property.phone}</span>
                      </div>
                    )}

                    {property.website && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{property.website}</span>
                      </div>
                    )}

                    <div className="pt-4 mt-4 border-t flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Created{" "}
                        {new Date(property.created_at).toLocaleDateString()}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePropertyClick(property.id);
                        }}
                      >
                        Manage
                        <Settings className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
