"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

interface CinematicOrbProps {
  className?: string;
}

export function CinematicOrb({ className }: CinematicOrbProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = prefersReducedMotion ? Math.PI / 2 : 0; // static pose if reduced motion

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Oval ring dimensions — portrait oval
      const rx = Math.min(w, h) * 0.28;
      const ry = Math.min(w, h) * 0.40;

      const N = 130; // strands around the oval
      const barW = 2.2;

      // Global breathing pulse
      const pulse = Math.sin(time * 0.45) * 0.07 + 0.93;

      // Inner ambient glow — drawn first so strands render on top
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx * 1.3);
      glow.addColorStop(0, `hsla(40, 80%, 50%, ${0.08 * pulse})`);
      glow.addColorStop(0.6, `hsla(35, 70%, 40%, ${0.04 * pulse})`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * 1.6, ry * 1.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw all strands
      for (let i = 0; i < N; i++) {
        const theta = (i / N) * Math.PI * 2;

        const x = cx + rx * Math.cos(theta);
        const y = cy + ry * Math.sin(theta);

        // Height: tallest at top & bottom (|sin| ≈ 1), shortest at sides (|cos| ≈ 1)
        const heightFactor = Math.abs(Math.sin(theta));
        const phaseOffset = i * 0.22;
        const oscillation = Math.sin(time * 1.4 + phaseOffset) * 0.18;
        const barH = (8 + 30 * heightFactor + oscillation * 18) * pulse;

        // Depth / perspective: strands closest to viewer (theta ≈ 0 or 2π) are brightest
        const cosVal = Math.cos(theta);
        const depthFactor = (cosVal + 1) / 2; // 0 (far side) → 1 (near side)

        // Warm amber palette — near side brighter/whiter, far side dimmer/deeper amber
        const hue = 33 + depthFactor * 8; // 33 → 41
        const sat = 55 + depthFactor * 35; // 55 → 90%
        const lit = 40 + depthFactor * 30; // 40 → 70%
        const alpha = (0.18 + 0.82 * depthFactor) * pulse;

        // Subtle glow on near-side strands
        ctx.shadowBlur = depthFactor > 0.65 ? 5 + depthFactor * 6 : 0;
        ctx.shadowColor = `hsla(38, 90%, 60%, ${alpha * 0.5})`;

        ctx.fillStyle = `hsla(${hue}, ${sat}%, ${lit}%, ${alpha})`;
        ctx.fillRect(x - barW / 2, y - barH / 2, barW, barH);
      }

      // Reset shadow
      ctx.shadowBlur = 0;

      // Outer ring accent — faint ellipse stroke
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(38, 70%, 50%, ${0.06 * pulse})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      if (!prefersReducedMotion) {
        time += 0.016;
      }

      animationId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 size-full", className)}
      aria-hidden="true"
    />
  );
}
