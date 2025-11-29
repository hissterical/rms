"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface GuestDocument {
  id: string
  guestName: string
  idType: string
  idNumber: string
  photoUrl: string
  uploadedAt: string
}

export interface CheckInData {
  bookingId: string
  roomNumber: string
  guests: GuestDocument[]
  checkInDate: string
  checkOutDate: string
  purposeOfVisit: string
  qrCode: string
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'completed'
}

export interface ServiceRequest {
  id: string
  type: 'emergency' | 'housekeeping' | 'maintenance' | 'concierge' | 'essentials' | 'other'
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: string
}

export interface FoodOrder {
  id: string
  items: {
    id: string
    name: string
    quantity: number
    price: number
    specialInstructions?: string
  }[]
  totalAmount: number
  status: 'pending' | 'preparing' | 'delivered'
  createdAt: string
}

interface GuestContextType {
  checkInData: CheckInData | null
  setCheckInData: (data: CheckInData) => void
  updateCheckInData: (data: CheckInData) => void
  serviceRequests: ServiceRequest[]
  addServiceRequest: (request: Omit<ServiceRequest, 'id' | 'createdAt'>) => void
  foodOrders: FoodOrder[]
  addFoodOrder: (order: Omit<FoodOrder, 'id' | 'createdAt'>) => void
  currentLanguage: string
  setCurrentLanguage: (lang: string) => void
  clearGuestData: () => void
}

const GuestContext = createContext<GuestContextType | undefined>(undefined)

export function GuestProvider({ children }: { children: ReactNode }) {
  const [checkInData, setCheckInDataState] = useState<CheckInData | null>(null)
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
  const [foodOrders, setFoodOrders] = useState<FoodOrder[]>([])
  const [currentLanguage, setCurrentLanguage] = useState('en')

  // Load data from localStorage on mount
  useEffect(() => {
    const storedCheckIn = localStorage.getItem('guestCheckIn')
    const storedServices = localStorage.getItem('serviceRequests')
    const storedOrders = localStorage.getItem('foodOrders')
    const storedLang = localStorage.getItem('currentLanguage')

    if (storedCheckIn) {
      try {
        setCheckInDataState(JSON.parse(storedCheckIn))
      } catch (error) {
        console.error('Error parsing check-in data:', error)
      }
    }

    if (storedServices) {
      try {
        setServiceRequests(JSON.parse(storedServices))
      } catch (error) {
        console.error('Error parsing service requests:', error)
      }
    }

    if (storedOrders) {
      try {
        setFoodOrders(JSON.parse(storedOrders))
      } catch (error) {
        console.error('Error parsing food orders:', error)
      }
    }

    if (storedLang) {
      setCurrentLanguage(storedLang)
    }
  }, [])

  const setCheckInData = (data: CheckInData) => {
    setCheckInDataState(data)
    localStorage.setItem('guestCheckIn', JSON.stringify(data))
  }

  const addServiceRequest = (request: Omit<ServiceRequest, 'id' | 'createdAt'>) => {
    const newRequest: ServiceRequest = {
      ...request,
      id: `SR-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    }
    const updated = [...serviceRequests, newRequest]
    setServiceRequests(updated)
    localStorage.setItem('serviceRequests', JSON.stringify(updated))
  }

  const addFoodOrder = (order: Omit<FoodOrder, 'id' | 'createdAt'>) => {
    const newOrder: FoodOrder = {
      ...order,
      id: `FO-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    }
    const updated = [...foodOrders, newOrder]
    setFoodOrders(updated)
    localStorage.setItem('foodOrders', JSON.stringify(updated))
  }

  const clearGuestData = () => {
    setCheckInDataState(null)
    setServiceRequests([])
    setFoodOrders([])
    localStorage.removeItem('guestCheckIn')
    localStorage.removeItem('serviceRequests')
    localStorage.removeItem('foodOrders')
  }

  return (
    <GuestContext.Provider
      value={{
        checkInData,
        setCheckInData,
        updateCheckInData: setCheckInData, // Same functionality as setCheckInData
        serviceRequests,
        addServiceRequest,
        foodOrders,
        addFoodOrder,
        currentLanguage,
        setCurrentLanguage: (lang) => {
          setCurrentLanguage(lang)
          localStorage.setItem('currentLanguage', lang)
        },
        clearGuestData
      }}
    >
      {children}
    </GuestContext.Provider>
  )
}

export function useGuest() {
  const context = useContext(GuestContext)
  if (context === undefined) {
    throw new Error('useGuest must be used within a GuestProvider')
  }
  return context
}