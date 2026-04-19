"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";

interface AmbientGridProps {
  className?: string;
}

export function AmbientGrid({ className }: AmbientGridProps) {
  return (
    <div className={cn("absolute inset-0 z-0 overflow-hidden pointer-events-none", className)} aria-hidden="true">
      <div className="absolute left-0 right-0 top-1/2 h-px bg-border/40 w-full" />
      {[20, 40, 60, 80].map((pct, i) => (
        <motion.div
          key={pct}
          className="absolute top-0 bottom-0 w-px bg-border-subtle"
          style={{ left: `${pct}%` }}
          animate={{ opacity: [0.1, 0.4, 0.1] }}
          transition={{
            duration: 4 + i * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}
