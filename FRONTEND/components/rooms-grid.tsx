import Image from "next/image"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

const rooms = [
  {
    name: "Deluxe King Room",
    price: "$199",
    img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop&crop=center",
    amenities: ["King bed", "City view", "Free WiFi", "Mini bar"]
  },
  {
    name: "Executive Suite", 
    price: "$399",
    img: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=300&fit=crop&crop=center",
    amenities: ["Separate living area", "Ocean view", "Premium amenities", "Concierge service"]
  },
  {
    name: "Twin Standard",
    price: "$149", 
    img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center",
    amenities: ["Two twin beds", "Garden view", "Work desk", "Coffee maker"]
  }
]

export function RoomsGrid() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      {rooms.map((room) => (
        <Card key={room.name} className="overflow-hidden">
          <div className="relative">
            <Image
              src={room.img || "/placeholder.svg"}
              alt={room.name}
              width={640}
              height={420}
              className="h-48 w-full object-cover"
            />
            <button
              aria-label="Save to favorites"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-primary shadow"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{room.name}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">

          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-semibold text-primary">${room.price}</span>{" "}
              <span className="text-muted-foreground">/ night</span>
            </div>
            <Button size="sm">Book Room</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
