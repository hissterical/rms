"use client"

import type React from "react"

import { useEffect, useRef } from "react"

type Props = {
  children: React.ReactNode
  className?: string
  once?: boolean
  y?: number
  duration?: number
  stagger?: number
}

export function ScrollReveal({ children, className, once = true, y = 24, duration = 0.7, stagger = 0.08 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let ctx: any
    async function run() {
      const gsap = (await import("gsap")).default
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")
      gsap.registerPlugin(ScrollTrigger)
      const container = ref.current
      if (!container) return

      const items = gsap.utils.toArray<HTMLElement>(container.querySelectorAll("[data-reveal]"))
      gsap.set(items, { y, opacity: 0 })

      ctx = ScrollTrigger.batch(items, {
        start: "top 85%",
        once,
        onEnter: (batch) => {
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            ease: "power2.out",
            duration,
            stagger,
          })
        },
      })
    }
    run()
    return () => {
      try {
        const ST = (window as any).ScrollTrigger
        if (ST) ST.getAll().forEach((t: any) => t.kill())
      } catch {}
    }
  }, [once, y, duration, stagger])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
