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
import { motion } from "framer-motion"

const ITEMS = [
  { icon: CalendarRange, title: "Reservations", text: "Direct bookings, calendar view, quick assignments." },
  { icon: Sparkles, title: "Housekeeping", text: "Mobile tasks, status updates, and inspections." },
  { icon: CreditCard, title: "Billing & Invoices", text: "Integrated payments, folios, and exports." },
  { icon: PlugZap, title: "Integrations", text: "PMS APIs for door locks, POS, and more." },
  { icon: BarChart3, title: "Analytics", text: "Occupancy, ADR, RevPAR, and custom reports." },
]

export function FeatureHighlights() {
  return (
    <ScrollReveal className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      {ITEMS.map(({ icon: Icon, title, text }, index) => (
        <motion.div 
          key={title} 
          className="rounded-xl border bg-card p-5 shadow-sm card-fun" 
          data-reveal
          whileHover={{ 
            y: -4,
            scale: 1.02,
            transition: { type: "spring", stiffness: 300, damping: 20 }
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-start gap-4">
            <motion.span 
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
              whileHover={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: 1.1
              }}
              transition={{ duration: 0.6 }}
            >
              <Icon className="h-5 w-5" />
            </motion.span>
            <div>
              <motion.h3 
                className="font-medium"
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1 }}
              >
                {title}
              </motion.h3>
              <motion.p 
                className="mt-1 text-sm text-muted-foreground"
                initial={{ opacity: 0.7 }}
                whileHover={{ opacity: 1 }}
              >
                {text}
              </motion.p>
            </div>
          </div>
        </motion.div>
      ))}
    </ScrollReveal>
  )
}
