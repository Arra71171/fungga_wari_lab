"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

interface EmberParticlesProps extends React.HTMLAttributes<HTMLCanvasElement> {
  density?: number
  speed?: number
}

export function EmberParticles({ density = 50, speed = 1, className, ...props }: EmberParticlesProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let particles: Array<{
      x: number
      y: number
      size: number
      speedY: number
      speedX: number
      opacity: number
      life: number
      maxLife: number
      hue: number
    }> = []

    const resizeCanvas = () => {
      // Need to take pixel ratio into account for high DPI screens
      const pixelRatio = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      
      canvas.width = rect.width * pixelRatio
      canvas.height = rect.height * pixelRatio
      ctx.scale(pixelRatio, pixelRatio)
      
      initParticles()
    }

    const initParticles = () => {
      particles = []
      const rect = canvas.getBoundingClientRect()
      // Adjust density based on screen size
      const calculatedDensity = Math.floor((rect.width * rect.height) / 15000) * (density / 50)
      
      for (let i = 0; i < calculatedDensity; i++) {
        createParticle(true)
      }
    }

    const createParticle = (initial = false) => {
      const rect = canvas.getBoundingClientRect()
      // Hue range for amber/fire (mostly 30-45 in HSL approx, or we can use generic amber RGBA)
      // Since OKLCH is hard to interpolate in raw canvas directly without parsing,
      // we'll use HSL for raw rendering: H:30-45, S:80-100%, L:45-65%
      const hue = Math.random() * 15 + 30 
      
      particles.push({
        x: Math.random() * rect.width,
        y: initial ? Math.random() * rect.height : rect.height + Math.random() * 20,
        size: Math.random() * 2.5 + 0.5,
        speedY: (Math.random() * -0.5 - 0.2) * speed,
        speedX: (Math.random() * 0.4 - 0.2) * speed,
        opacity: Math.random() * 0.5 + 0.1,
        life: 0,
        maxLife: Math.random() * 200 + 100,
        hue
      })
    }

    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      // Use "destination-out" to create trail effect or standard clear
      ctx.clearRect(0, 0, rect.width, rect.height)
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        if (!p) continue
        
        p.x += p.speedX
        p.y += p.speedY
        p.life++
        
        // Horizontal oscillation
        p.x += Math.sin(p.life / 30) * 0.2

        // Fade out
        const opacity = p.opacity * (1 - p.life / p.maxLife)
        
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${opacity})`
        
        // Add a subtle glow
        ctx.shadowBlur = p.size * 2
        ctx.shadowColor = `hsla(${p.hue}, 100%, 50%, ${opacity})`
        
        ctx.fill()
        
        // Reset when particle dies or goes off screen
        if (p.life >= p.maxLife || p.y < -10 || p.x < -10 || p.x > rect.width + 10) {
          particles.splice(i, 1)
          i--
          createParticle()
        }
      }
      
      animationFrameId = requestAnimationFrame(animate)
    }

    window.addEventListener("resize", resizeCanvas)
    resizeCanvas()
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [density, speed])

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0 size-full mix-blend-screen", className)}
      aria-hidden="true"
      {...props}
    />
  )
}
