"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollReveal } from "./scroll-reveal"
import { motion } from "framer-motion"

const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah M.",
    location: "Grand Plaza Hotel",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80",
    text: "The QR-based guest services transformed our operations. Check-ins are 60% faster and guests love the multi-language food ordering with voice search.",
  },
  {
    id: 2,
    name: "Raj K.",
    location: "Skyline Residency",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    text: "Real-time room status tracking and the AI chatbot for guest requests have reduced our response time by 75%. The 360° room previews increased bookings significantly.",
  },
]

export function Testimonials() {
  return (
    <ScrollReveal className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
      {TESTIMONIALS.map((t, index) => (
        <motion.div key={t.id} data-reveal>
          <Card 
            className="shadow-sm card-fun h-full"
          >
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Image
                  src={t.avatar || "/placeholder.svg"}
                  alt={`${t.name} avatar`}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </motion.div>
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CardTitle className="text-base">{t.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{t.location}</p>
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.p 
                className="text-sm leading-relaxed"
                initial={{ opacity: 0.9 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                "{t.text}"
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </ScrollReveal>
  )
}
