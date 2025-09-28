"use client"

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "./scroll-reveal"
import { motion } from "framer-motion"
import Image from "next/image"

const modules = [
  {
    title: "Property Management",
    description: "Streamline reservations, guest profiles, and daily operations with our comprehensive PMS.",
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&crop=center",
    features: ["Multi-property support", "Guest profiles", "Rate management"]
  },
  {
    title: "Channel Management", 
    description: "Sync your inventory across all booking platforms automatically to maximize revenue.",
    img: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center",
    features: ["Real-time sync", "Rate parity", "Automated distribution"]
  },
  {
    title: "Revenue Analytics",
    description: "Make data-driven decisions with comprehensive reporting and forecasting tools.",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center",
    features: ["Revenue forecasting", "Market insights", "Performance tracking"]
  }
]

export function ModulesGrid() {
  return (
    <ScrollReveal className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      {modules.map((m, index) => (
        <motion.div key={m.title} data-reveal>
          <Card 
            className="overflow-hidden h-full card-fun"
          >
            <motion.div 
              className="relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={m.img || "/placeholder.svg"}
                alt={m.title}
                width={640}
                height={420}
                className="h-48 w-full object-cover transition-transform duration-300"
              />
              <motion.div
                className="absolute inset-0 bg-black/20"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
            <CardHeader className="pb-2">
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CardTitle className="text-lg">{m.title}</CardTitle>
              </motion.div>
            </CardHeader>
            <CardContent className="pt-0">
              <motion.p 
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1 }}
              >
                {m.description}
              </motion.p>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="text-sm">

              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="sm" className="btn-fun bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-500">
                  Learn more 🚀
                </Button>
              </motion.div>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </ScrollReveal>
  )
}
