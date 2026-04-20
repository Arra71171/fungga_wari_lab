"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@workspace/ui/lib/utils";

// Register the useGSAP plugin once on the client
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

type FolkKeyProps = {
  className?: string;
};

export function FolkKey({ className }: FolkKeyProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const keyRef = React.useRef<SVGSVGElement>(null);
  const haloRef = React.useRef<HTMLDivElement>(null);
  const keyholeRef = React.useRef<SVGCircleElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const key = keyRef.current;
      const halo = haloRef.current;
      const keyhole = keyholeRef.current;

      if (!key || !halo || !keyhole) return;

      if (prefersReducedMotion) {
        // Instant reveal — no animation
        gsap.set([key, halo], { opacity: 1 });
        return;
      }

      // ── Entry timeline ────────────────────────────────────────────────────
      // Mirrors the "unlock" metaphor: key drops, rotates to 0°, unlocks.
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Start state
      gsap.set(halo, { opacity: 0, scale: 0.6 });
      gsap.set(key, { opacity: 0, y: -28, rotation: -32, transformOrigin: "50% 25%" });
      gsap.set(keyhole, { opacity: 0.5 });

      tl
        // 1. Halo blooms first — atmosphere before the key
        .to(halo, { opacity: 0.18, scale: 1, duration: 0.7, ease: "power2.out" }, 0)

        // 2. Key drops and rotates into position — the "unlock" drop
        .to(
          key,
          {
            opacity: 1,
            y: 0,
            rotation: 0,
            duration: 0.65,
            ease: "back.out(1.3)",
          },
          0.06
        )

        // 3. Keyhole flashes to full brightness — "access granted" pulse
        .to(keyhole, { opacity: 1, duration: 0.18, ease: "power2.in" }, 0.58)
        .to(keyhole, { opacity: 0.65, duration: 0.22, ease: "power2.out" }, 0.76)

        // 4. Subtle settle micro-bounce on the whole key
        .to(key, { y: 3, duration: 0.12, ease: "power1.in" }, 0.72)
        .to(key, { y: 0, duration: 0.22, ease: "elastic.out(1.1, 0.5)" }, 0.84);

      // ── Idle loop after entry ──────────────────────────────────────────────
      // Floats the key + breathes the halo — a living artefact.
      tl.call(() => {
        // Float oscillation
        gsap.to(key, {
          y: -8,
          duration: 2.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 0.2,
        });

        // Halo breath
        gsap.to(halo, {
          opacity: 0.22,
          scale: 1.08,
          duration: 2.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });

        // Keyhole slow pulse
        gsap.to(keyhole, {
          opacity: 0.95,
          duration: 1.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 0.6,
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 flex items-center justify-center overflow-hidden",
        className
      )}
      data-slot="folk-key"
    >
      {/* Ambient halo behind the key */}
      <div
        ref={haloRef}
        aria-hidden="true"
        className="absolute size-64 rounded-full bg-primary/15 blur-3xl pointer-events-none"
      />

      {/*
        SVG folk key — portrait, Zen Brutalist
        ViewBox: 160 × 340
        Head center: (80, 84), outer ring r=60
        Folk mandala: two overlapping squares at 0° and 45° (8-point star)
        Shaft: 16px wide, runs y=158→280
        3 geometric teeth on right side
      */}
      <svg
        ref={keyRef}
        viewBox="0 0 160 340"
        className="h-72 w-auto text-primary"
        aria-hidden="true"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── KEY HEAD ─────────────────────────────────────── */}

        {/* Outer ring — primary weight */}
        <circle cx="80" cy="84" r="60" stroke="currentColor" strokeWidth="2" />

        {/* Subtle spacer ring */}
        <circle cx="80" cy="84" r="52" stroke="currentColor" strokeWidth="0.8" opacity="0.30" />

        {/* Inner decorative ring */}
        <circle cx="80" cy="84" r="44" stroke="currentColor" strokeWidth="1" opacity="0.45" />

        {/* Folk mandala: 8-point star — two overlapping squares inscribed at r=36 */}
        {/* Square 1 (0°) — N, E, S, W vertices */}
        <polygon
          points="80,48 116,84 80,120 44,84"
          stroke="currentColor"
          strokeWidth="1.1"
          opacity="0.42"
        />
        {/* Square 2 (45°) — NE, SE, SW, NW vertices */}
        <polygon
          points="105.5,58.5 105.5,109.5 54.5,109.5 54.5,58.5"
          stroke="currentColor"
          strokeWidth="1.1"
          opacity="0.42"
        />

        {/* Cardinal tick marks — N, E, W (S omitted; shaft is there) */}
        <line x1="80" y1="24" x2="80" y2="15" stroke="currentColor" strokeWidth="1.5" />
        <line x1="140" y1="84" x2="149" y2="84" stroke="currentColor" strokeWidth="1.5" />
        <line x1="20" y1="84" x2="11" y2="84" stroke="currentColor" strokeWidth="1.5" />

        {/* Intercardinal accent ticks */}
        <line x1="122" y1="46" x2="128" y2="40" stroke="currentColor" strokeWidth="1" opacity="0.32" />
        <line x1="38" y1="46" x2="32" y2="40" stroke="currentColor" strokeWidth="1" opacity="0.32" />
        <line x1="122" y1="122" x2="128" y2="128" stroke="currentColor" strokeWidth="1" opacity="0.32" />
        <line x1="38" y1="122" x2="32" y2="128" stroke="currentColor" strokeWidth="1" opacity="0.32" />

        {/* Keyhole circle — pulses after unlock rotation settles */}
        <circle
          ref={keyholeRef}
          cx="80"
          cy="84"
          r="13"
          stroke="currentColor"
          strokeWidth="2"
        />

        {/* Keyhole slot — drops from circle to collar */}
        <rect x="75.5" y="93" width="9" height="16" stroke="currentColor" strokeWidth="1.5" />

        {/* ── COLLAR (head → shaft transition) ─────────────── */}
        <rect x="64" y="144" width="32" height="9" stroke="currentColor" strokeWidth="1.5" />
        <rect x="68" y="153" width="24" height="5" stroke="currentColor" strokeWidth="1" opacity="0.40" />

        {/* ── SHAFT ────────────────────────────────────────── */}
        <rect x="72" y="158" width="16" height="122" stroke="currentColor" strokeWidth="1.5" />

        {/* ── TEETH — 3 geometric notches on right side ─────── */}
        <rect x="88" y="184" width="24" height="18" stroke="currentColor" strokeWidth="1.5" />
        <rect x="88" y="218" width="17" height="14" stroke="currentColor" strokeWidth="1.5" />
        <rect x="88" y="248" width="21" height="16" stroke="currentColor" strokeWidth="1.5" />

        {/* ── BOTTOM CAP ───────────────────────────────────── */}
        <rect x="66" y="280" width="28" height="7" stroke="currentColor" strokeWidth="1.5" />
        <line x1="71" y1="292" x2="89" y2="292" stroke="currentColor" strokeWidth="1" opacity="0.32" />
      </svg>
    </div>
  );
}
