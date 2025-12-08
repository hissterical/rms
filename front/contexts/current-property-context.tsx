"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Property } from "@/lib/property-api";

interface CurrentPropertyContextType {
  currentProperty: Property | null;
  setCurrentProperty: (property: Property | null) => void;
}

const CurrentPropertyContext = createContext<
  CurrentPropertyContextType | undefined
>(undefined);

export function CurrentPropertyProvider({ children }: { children: ReactNode }) {
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);

  return (
    <CurrentPropertyContext.Provider
      value={{ currentProperty, setCurrentProperty }}
    >
      {children}
    </CurrentPropertyContext.Provider>
  );
}

export function useCurrentProperty() {
  const context = useContext(CurrentPropertyContext);
  if (context === undefined) {
    throw new Error(
      "useCurrentProperty must be used within a CurrentPropertyProvider"
    );
  }
  return context;
}
