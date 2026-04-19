"use client";

import { useEffect, useRef } from "react";

export function EmberCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas to match window
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    // Ember particles
    const particles: { x: number; y: number; size: number; speedY: number; speedX: number; opacity: number }[] = [];
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
     // OKLCH approx ~45 hue: orange/amber
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedY: Math.random() * -0.5 - 0.2, // move upwards
        speedX: Math.random() * 0.4 - 0.2, // sway
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Update positions
        p.y += p.speedY;
        p.x += p.speedX;

        // Reset if goes off top
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        // Using brand-ember approx color
        ctx.fillStyle = `rgba(255, 120, 50, ${p.opacity})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(255, 100, 0, 0.5)";
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1] opacity-60"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
