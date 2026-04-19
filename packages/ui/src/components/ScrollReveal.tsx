"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

// Ensure GSAP registers the plugin only once on the client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
}

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  direction?: "up" | "down" | "left" | "right" | "none"
  distance?: number
  duration?: number
  stagger?: number
  scrub?: boolean | number
  delay?: number
  scale?: number
}

export function ScrollReveal({
  children,
  direction = "up",
  distance = 50,
  duration = 1,
  stagger = 0,
  scrub = false,
  delay = 0,
  scale = 1,
  className,
  ...props
}: ScrollRevealProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = containerRef.current
      if (!el) return

      // Reduced motion fallback inside GSAP configuration
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      if (prefersReducedMotion) return

      let x = 0
      let y = 0

      switch (direction) {
        case "up":
          y = distance
          break
        case "down":
          y = -distance
          break
        case "left":
          x = distance
          break
        case "right":
          x = -distance
          break
      }

      const tweenParams: gsap.TweenVars = {
        scrollTrigger: {
          trigger: el,
          start: "top 85%", // Triggers when the top of the element hits 85% from top of viewport
          scrub: scrub,
        },
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration,
        delay,
        ease: "power3.out",
      }

      if (stagger > 0) {
        // If staggering, assume children are the targets
        const children = gsap.utils.toArray(el.children)
        // Reset children
        gsap.set(children, {
          opacity: 0,
          x,
          y,
          scale,
        })
        
        tweenParams.stagger = stagger
        gsap.to(children, tweenParams)
      } else {
        // Reset container
        gsap.set(el, {
          opacity: 0,
          x,
          y,
          scale,
        })
        gsap.to(el, tweenParams)
      }
    },
    { scope: containerRef, dependencies: [direction, distance, duration, stagger, scrub, delay, scale] }
  )

  return (
    <div ref={containerRef} className={cn(className)} {...props}>
      {children}
    </div>
  )
}
