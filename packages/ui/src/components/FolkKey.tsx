"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";

interface FolkKeyProps {
  className?: string;
}

export function FolkKey({ className }: FolkKeyProps) {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center overflow-hidden",
        className
      )}
    >
      {/* Ambient halo behind the key */}
      <motion.div
        className="absolute size-64 rounded-full bg-primary/15 blur-3xl pointer-events-none"
        initial={{ opacity: 0 }}
        animate={reduced ? { opacity: 0.15 } : { opacity: [0.06, 0.20, 0.06] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />

      {/* Entry: fade + rise + unlock rotation */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: -20, rotate: -28 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 130,
          damping: 18,
          opacity: { duration: 0.45 },
          delay: 0.05,
        }}
      >
        {/* Idle float */}
        <motion.div
          animate={reduced ? {} : { y: [0, -7, 0, 7, 0] }}
          transition={{
            duration: 3.8,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop",
            delay: 1.4,
          }}
        >
          {/* Overall glow pulse */}
          <motion.div
            animate={reduced ? {} : { opacity: [0.80, 1, 0.80] }}
            transition={{
              duration: 4.0,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop",
              delay: 1.7,
            }}
          >
            {/*
              SVG folk key — portrait, Zen Brutalist
              ViewBox: 160 × 340
              Head center: (80, 84), outer ring r=60
              Folk mandala: two overlapping squares at 0° and 45° (8-point star)
              Shaft: 16px wide, runs y=158→280
              3 geometric teeth on right side
            */}
            <svg
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
              <motion.circle
                cx="80"
                cy="84"
                r="13"
                stroke="currentColor"
                strokeWidth="2"
                initial={{ opacity: 0.5 }}
                animate={
                  reduced
                    ? { opacity: 0.7 }
                    : { opacity: [0.5, 0.95, 0.65, 0.95, 0.65] }
                }
                transition={
                  reduced
                    ? {}
                    : { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
                }
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
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
