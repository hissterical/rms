"use client"

import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { FeatureHighlights } from "@/components/feature-highlights"
import { ModulesGrid } from "@/components/modules-grid"
import { Pricing } from "@/components/pricing"
import { Testimonials } from "@/components/testimonials"
import { SiteFooter } from "@/components/site-footer"

export default function Page() {
  return (
    <main className="min-h-dvh">
      <SiteHeader />
      <Hero />
      <section 
        aria-labelledby="highlights" 
        id="highlights" 
        className="py-12 md:py-16"
      >
        <div className="container mx-auto px-4">
          <h2 
            id="highlights-title" 
            className="text-2xl md:text-3xl font-bold text-balance bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent"
          >
            Complete Hotel Operations Dashboard 🏨
          </h2>
          <p 
            className="text-muted-foreground mt-2 max-w-2xl"
          >
            Manage rooms, process check-ins, track occupancy, and deliver exceptional guest experiences—all in one place.
          </p>
          <FeatureHighlights />
        </div>
      </section>
      <section 
        aria-labelledby="modules" 
        id="modules" 
        className="py-12 md:py-16 bg-secondary"
      >
        <div className="container mx-auto px-4">
          <h2 
            className="text-2xl md:text-3xl font-bold text-balance bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent"
          >
            Core Features 🚀
          </h2>
          <p 
            className="text-muted-foreground mt-2 max-w-2xl"
          >
            Everything from room management to QR-powered guest services and AI-assisted ordering.
          </p>
          <ModulesGrid />
        </div>
      </section>
      <section 
        aria-labelledby="pricing" 
        id="pricing" 
        className="py-12 md:py-16"
      >
        <div className="container mx-auto px-4">
          <h2 
            className="text-2xl md:text-3xl font-bold text-balance bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent"
          >
            Simple, Transparent Pricing 💰
          </h2>
          <p 
            className="text-muted-foreground mt-2 max-w-2xl"
          >
            Choose the perfect plan for your hotel. Start with our 30-day free trial, no credit card required.
          </p>
          <Pricing />
        </div>
      </section>
      <section 
        aria-labelledby="testimonials" 
        className="py-12 md:py-16 bg-secondary"
      >
        <div className="container mx-auto px-4">
          <h2 
            id="testimonials" 
            className="text-2xl md:text-3xl font-bold text-balance bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent"
          >
            Trusted by Hotels Worldwide 💙
          </h2>
          <p 
            className="text-muted-foreground mt-2 max-w-2xl"
          >
            See how our system transforms hotel operations and guest experiences.
          </p>
          <Testimonials />
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
