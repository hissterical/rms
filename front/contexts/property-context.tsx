"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth-context";

interface PropertyContextType {
  selectedPropertyId: string | null;
  setSelectedPropertyId: (id: string | null) => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(
  undefined
);

export function PropertyProvider({ children }: { children: React.ReactNode }) {
  const [selectedPropertyId, setSelectedPropertyIdState] = useState<
    string | null
  >(null);
  const { user } = useAuth();

  useEffect(() => {
    // Load selected property from localStorage
    if (user && ["property_owner", "manager"].includes(user.role)) {
      const storedPropertyId = localStorage.getItem("selectedPropertyId");
      if (storedPropertyId) {
        setSelectedPropertyIdState(storedPropertyId);
      }
    }
  }, [user]);

  const setSelectedPropertyId = (id: string | null) => {
    setSelectedPropertyIdState(id);
    if (id) {
      localStorage.setItem("selectedPropertyId", id);
    } else {
      localStorage.removeItem("selectedPropertyId");
    }
  };

  return (
    <PropertyContext.Provider
      value={{ selectedPropertyId, setSelectedPropertyId }}
    >
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error("useProperty must be used within a PropertyProvider");
  }
  return context;
}
