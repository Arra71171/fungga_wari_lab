"use client";

import * as React from "react";
import { motion, useMotionTemplate, useMotionValue, HTMLMotionProps } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";

export interface SpotlightCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  spotlightColor?: string;
  className?: string;
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "color-mix(in oklch, var(--primary) 15%, transparent)",
  ...props
}: SpotlightCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
    if (props.onMouseMove) {
      props.onMouseMove(e);
    }
  }

  return (
    <motion.div
      className={cn(
        "group relative overflow-hidden rounded-none bg-background",
        className
      )}
      onMouseMove={handleMouseMove}
      data-slot="spotlight-card"
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-none opacity-0 transition duration-300 group-hover:opacity-100 z-[1]"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              ${spotlightColor},
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative z-10 w-full h-full">{children}</div>
    </motion.div>
  );
}
