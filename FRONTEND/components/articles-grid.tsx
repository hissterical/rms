"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollReveal } from "./scroll-reveal"
import { motion } from "framer-motion"

const POSTS = [
  {
    id: 1,
    title: "Increase Direct Bookings in 30 Days",
    date: "23 Mar",
    img: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400&h=300&fit=crop&crop=center",
  },
  {
    id: 2,
    title: "Housekeeping SOPs You Can Copy",
    date: "23 Mar",
    img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop&crop=center",
  },
  {
    id: 3,
    title: "ADR vs RevPAR: What Matters When",
    date: "23 Mar",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=center",
  },
]

export function ArticlesGrid() {
  return (
    <ScrollReveal className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      {POSTS.map((p, index) => (
        <motion.div key={p.id} data-reveal>
          <Card 
            className="overflow-hidden cursor-pointer h-full group card-fun"
          >
            <motion.div 
              className="relative overflow-hidden"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={p.img || "/placeholder.svg"}
                alt={p.title}
                width={640}
                height={420}
                className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <motion.div
                initial={{ opacity: 1 }}
                whileHover={{ opacity: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Badge className="absolute left-3 top-3 rounded-full px-3 py-1 bg-background/90 text-foreground">
                  {p.date}
                </Badge>
              </motion.div>
            </motion.div>
            <CardHeader>
              <motion.div
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CardTitle className="text-base group-hover:text-primary transition-colors">
                  {p.title}
                </CardTitle>
              </motion.div>
            </CardHeader>
            <CardContent className="pt-0">
              <motion.p 
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1 }}
              >
                Practical playbooks and insights for modern hoteliers.
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </ScrollReveal>
  )
}
