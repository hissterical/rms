"use client"

import {
  BedDouble,
  Wifi,
  Coffee,
  Bath,
  UtensilsCrossed,
  Car,
  CalendarRange,
  BarChart3,
  CreditCard,
  PlugZap,
  Sparkles,
} from "lucide-react"
import { ScrollReveal } from "./scroll-reveal"

const ITEMS = [
  { icon: BedDouble, title: "Room Management", text: "Real-time room status tracking, availability, and assignment with 360° virtual tours." },
  { icon: CalendarRange, title: "Smart Check-In", text: "QR code-based check-in, document upload, and automated room assignment." },
  { icon: UtensilsCrossed, title: "Guest Services", text: "QR-powered room services, AI food ordering in 8 languages, and instant requests." },
  { icon: Sparkles, title: "Housekeeping", text: "Real-time status updates, cleaning schedules, and maintenance tracking." },
  { icon: BarChart3, title: "Analytics", text: "Occupancy insights, revenue tracking, guest journey visualization, and performance reports." },
]

export function FeatureHighlights() {
  return (
    <ScrollReveal className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      {ITEMS.map(({ icon: Icon, title, text }, index) => (
        <div 
          key={title} 
          className="rounded-xl border bg-card p-5 shadow-sm card-fun transition-transform hover:-translate-y-1 hover:shadow-md active:scale-95" 
          data-reveal
        >
          <div className="flex items-start gap-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform hover:scale-110">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-medium">
                {title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {text}
              </p>
            </div>
          </div>
        </div>
      ))}
    </ScrollReveal>
  )
}
