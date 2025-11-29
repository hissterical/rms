"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  CurrentPropertyProvider,
  useCurrentProperty,
} from "@/contexts/current-property-context";
import { propertyAPI, Property } from "@/lib/property-api";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

function PropertyLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentProperty, setCurrentProperty } = useCurrentProperty();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();
  const params = useParams();
  const propertyId = params.propertyId as string;

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return;

      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      if (!["property_owner", "manager"].includes(user?.role || "")) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this property",
          variant: "destructive",
        });
        router.push("/");
        return;
      }

      try {
        setIsLoading(true);
        console.log("Fetching property data for ID:", propertyId);
        // This endpoint will automatically check if the user has access
        const propertyData = await propertyAPI.getPropertyById(propertyId);
        console.log("Property data loaded:", propertyData);
        setCurrentProperty(propertyData);
        setHasAccess(true);
      } catch (error: any) {
        toast({
          title: "Access Denied",
          description:
            error.message ||
            "You don't have permission to access this property",
          variant: "destructive",
        });
        router.push("/properties");
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [
    user,
    isAuthenticated,
    authLoading,
    propertyId,
    router,
    setCurrentProperty,
  ]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!hasAccess || !currentProperty) {
    return null;
  }

  return <>{children}</>;
}

export default function PropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CurrentPropertyProvider>
      <PropertyLayoutContent>{children}</PropertyLayoutContent>
    </CurrentPropertyProvider>
  );
}
