"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Facebook, Instagram, Twitter } from "lucide-react"
import { motion } from "framer-motion"
import Spline from '@splinetool/react-spline/next'

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  }

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden bg-secondary min-h-screen"
    >
      {/* 3D Spline Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Spline
          scene="https://prod.spline.design/iW4KuDCbnqTWLCRb/scene.splinecode"
          style={{
            width: '120%',
            height: '130%',
            background: 'transparent',
            position: 'absolute',
            top: '-20%',
            left: '0%',
            zIndex: 0,
            opacity: 0.8
          }}
        />
      </div>
      
      {/* Content Overlay */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 container mx-auto px-4 py-12 md:py-20"
      >
        <div className="max-w-2xl text-left">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 15 }}
            className="text-pretty text-4xl font-semibold leading-tight md:text-5xl bg-gradient-to-r from-primary via-blue-600 to-blue-800 bg-clip-text text-transparent"
          >
            Grow your hotel with modern software built to convert and delight ✨
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100, damping: 15 }}
            className="mt-4 max-w-prose text-muted-foreground leading-relaxed"
          >
            All-in-one platform for reservations, channel management, housekeeping, billing, and analytics— designed for
            independent hotels and groups. Register your property in minutes.
          </motion.p>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 100, damping: 15 }}
            className="mt-6 flex flex-wrap items-center gap-3"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button className="px-6 shadow-lg btn-fun bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-500">
                Get a Demo
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button variant="outline" className="btn-fun border-2 hover:bg-primary/5">
                Register Property
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex items-center gap-3 text-muted-foreground"
          >
            <span className="text-sm">Follow us</span>
            <a aria-label="Facebook" href="#" className="rounded p-2 hover:bg-accent">
              <Facebook className="h-4 w-4" />
            </a>
            <a aria-label="Instagram" href="#" className="rounded p-2 hover:bg-accent">
              <Instagram className="h-4 w-4" />
            </a>
            <a aria-label="Twitter" href="#" className="rounded p-2 hover:bg-accent">
              <Twitter className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  )
}
