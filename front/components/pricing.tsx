"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollReveal } from "./scroll-reveal"
import { Check } from "lucide-react"
import { motion } from "framer-motion"

const PLANS = [
  {
    name: "Trial",
    duration: "30 Days Free",
    price: "₹0",
    description: "Perfect for testing our platform",
    features: [
      "Up to 10 rooms",
      "Basic room management",
      "QR code check-in",
      "Guest services portal",
      "Email support",
      "Basic analytics",
      "Single property"
    ],
    cta: "Start Free Trial",
    popular: false
  },
  {
    name: "Pro",
    duration: "per month",
    price: "₹8,299",
    description: "For growing hotels and boutique properties",
    features: [
      "Up to 50 rooms",
      "Advanced room management",
      "QR-powered guest services",
      "AI food ordering with voice search",
      "Multi-language support (8 languages)",
      "Priority support (24/7)",
      "Advanced analytics & reports",
      "Guest journey tracking",
      "Document management",
      "360° virtual room tours",
      "Up to 3 properties"
    ],
    cta: "Get Started",
    popular: true
  },
  {
    name: "Max",
    duration: "per month",
    price: "₹24,999",
    description: "Enterprise solution for hotel chains",
    features: [
      "Unlimited rooms",
      "Full property management suite",
      "QR-powered guest experience",
      "AI chatbot with Gemini integration",
      "Voice search & group ordering",
      "Multi-language (8+ languages)",
      "Dedicated account manager",
      "Custom analytics & BI",
      "API access & integrations",
      "White-label options",
      "Staff management tools",
      "Revenue optimization",
      "Unlimited properties"
    ],
    cta: "Contact Sales",
    popular: false
  }
]

export function Pricing() {
  return (
    <ScrollReveal className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      {PLANS.map((plan, index) => (
        <motion.div key={plan.name} data-reveal >
          <Card 
            className={`h-full card-fun group relative border-2 flex flex-col ${
              plan.popular ? 'border-teal-500 shadow-lg' : 'border-slate-200'
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal-600 to-teal-700 text-white">
                Most Popular
              </Badge>
            )}
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl group-hover:text-teal-600 transition-colors">
                {plan.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {plan.description}
              </CardDescription>
              <div className="mt-4">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-slate-900">
                    {plan.price}
                  </span>
                  {plan.price !== "₹0" && (
                    <span className="text-muted-foreground text-sm">
                      /{plan.duration}
                    </span>
                  )}
                </div>
                {plan.price === "₹0" && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.duration}
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4 flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-6 mt-auto">
              <Button 
                className={`w-full btn-fun transition-transform hover:scale-105 active:scale-95 ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800' 
                    : 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900'
                }`}
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </ScrollReveal>
  )
}
