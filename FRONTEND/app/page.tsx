"use client"

import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { FeatureHighlights } from "@/components/feature-highlights"
import { ModulesGrid } from "@/components/modules-grid"
import { ArticlesGrid } from "@/components/articles-grid"
import { Testimonials } from "@/components/testimonials"
import { SiteFooter } from "@/components/site-footer"
import { motion } from "framer-motion"

export default function Page() {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  }

  return (
    <main className="min-h-dvh">
      <SiteHeader />
      <Hero />
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        aria-labelledby="highlights" 
        id="highlights" 
        className="py-12 md:py-16"
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            id="highlights-title" 
            className="text-2xl md:text-3xl font-bold text-balance bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
          >
            Built for modern hoteliers 🏨
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-muted-foreground mt-2 max-w-2xl"
          >
            Everything you need to run operations, drive direct bookings, and grow revenue.
          </motion.p>
          <FeatureHighlights />
        </div>
      </motion.section>
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        aria-labelledby="modules" 
        id="modules" 
        className="py-12 md:py-16 bg-secondary"
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl md:text-3xl font-bold text-balance bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
          >
            Product Modules 🚀
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-muted-foreground mt-2 max-w-2xl"
          >
            Start with PMS Core and add modules as you scale—no lock‑in.
          </motion.p>
          <ModulesGrid />
        </div>
      </motion.section>
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        aria-labelledby="resources" 
        id="resources" 
        className="py-12 md:py-16"
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl md:text-3xl font-bold text-balance bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
          >
            Guides & Resources 📚
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-muted-foreground mt-2 max-w-2xl"
          >
            Field‑tested playbooks to help you operate and market better.
          </motion.p>
          <ArticlesGrid />
        </div>
      </motion.section>
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        aria-labelledby="testimonials" 
        className="py-12 md:py-16 bg-secondary"
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            id="testimonials" 
            className="text-2xl md:text-3xl font-bold text-balance bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
          >
            Trusted by teams like yours 💙
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-muted-foreground mt-2 max-w-2xl"
          >
            What hoteliers say after switching to Sohraa.
          </motion.p>
          <Testimonials />
        </div>
      </motion.section>
      <SiteFooter />
    </main>
  )
}
