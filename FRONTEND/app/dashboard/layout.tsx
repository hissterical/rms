"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [propertyId, setPropertyId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user) {
      // If property owner or manager, check if they have selected a property
      if (["property_owner", "manager"].includes(user.role)) {
        const selectedPropertyId = localStorage.getItem("selectedPropertyId");

        if (
          !selectedPropertyId &&
          !window.location.pathname.includes("/properties")
        ) {
          // Redirect to properties selection page
          // router.push("/dashboard/properties");
          return;
        }

        setPropertyId(selectedPropertyId);
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
