"use client"

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "./scroll-reveal"
import Image from "next/image"

const modules = [
  {
    title: "Room & Property Management",
    description: "Complete CRUD operations for rooms, real-time availability tracking, and visual 360° room previews for guests.",
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&crop=center",
    features: ["Room CRUD operations", "Status management", "360° virtual tours"]
  },
  {
    title: "QR-Powered Guest Experience", 
    description: "Guests scan QR codes to access room services, order food in multiple languages, and request assistance instantly.",
    img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&crop=center",
    features: ["QR check-in", "Voice-enabled ordering", "Multi-language support"]
  },
  {
    title: "AI Food Ordering & Services",
    description: "Gemini AI-powered chatbot with voice search, group ordering, bill splitting, and 8-language menu translation.",
    img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&crop=center",
    features: ["AI chatbot", "Voice search", "Split billing"]
  }
]

export function ModulesGrid() {
  return (
    <ScrollReveal className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      {modules.map((m, index) => (
        <div key={m.title} data-reveal>
          <Card className="overflow-hidden h-full card-fun group">
            <div className="relative overflow-hidden">
              <Image
                src={m.img || "/placeholder.svg"}
                alt={m.title}
                width={640}
                height={420}
                className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg transition-transform group-hover:translate-x-1">
                {m.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                {m.description}
              </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="text-sm" />
              <Button 
                size="sm" 
                className="btn-fun bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 transition-transform hover:scale-105 active:scale-95"
              >
                Learn more 🚀
              </Button>
            </CardFooter>
          </Card>
        </div>
      ))}
    </ScrollReveal>
  )
}
