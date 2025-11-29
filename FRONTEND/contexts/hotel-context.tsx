"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface HotelData {
  // Database ID
  id?: string
  
  // Personal Details
  fullName: string
  email: string
  phone: string
  
  // Hotel Details
  hotelName: string
  hotelType: string
  city: string
  state: string
  country: string
  address: string
  zipCode: string
  
  // Hotel Structure
  numberOfFloors: number
  roomsPerFloor: number
  totalRooms: number
  
  // Additional Info
  description?: string
  
  // Runtime data
  createdAt?: string
}

interface HotelContextType {
  hotelData: HotelData | null
  setHotelData: (data: HotelData) => void
  clearHotelData: () => void
}

const HotelContext = createContext<HotelContextType | undefined>(undefined)

export function HotelProvider({ children }: { children: ReactNode }) {
  const [hotelData, setHotelDataState] = useState<HotelData | null>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('hotelData')
    if (stored) {
      try {
        setHotelDataState(JSON.parse(stored))
      } catch (error) {
        console.error('Error parsing stored hotel data:', error)
        localStorage.removeItem('hotelData')
      }
    }
  }, [])

  const setHotelData = (data: HotelData) => {
    const dataWithTimestamp = {
      ...data,
      createdAt: data.createdAt || new Date().toISOString()
    }
    setHotelDataState(dataWithTimestamp)
    localStorage.setItem('hotelData', JSON.stringify(dataWithTimestamp))
  }

  const clearHotelData = () => {
    setHotelDataState(null)
    localStorage.removeItem('hotelData')
  }

  return (
    <HotelContext.Provider value={{ hotelData, setHotelData, clearHotelData }}>
      {children}
    </HotelContext.Provider>
  )
}

export function useHotel() {
  const context = useContext(HotelContext)
  if (context === undefined) {
    throw new Error('useHotel must be used within a HotelProvider')
  }
  return context
}