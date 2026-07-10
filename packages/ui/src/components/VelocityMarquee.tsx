"use client";

import React, { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
} from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";

interface MarqueeItem {
  title: string;
  category?: string | null;
}

interface VelocityMarqueeProps {
  items: MarqueeItem[];
  baseVelocity?: number;
  className?: string;
}

export function VelocityMarquee({ items, baseVelocity = 2, className }: VelocityMarqueeProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  const [isHovered, setIsHovered] = useState(false);

  const directionFactor = useRef<number>(1);
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    // Speed up based on scroll velocity
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    // Slow down on hover
    if (isHovered) {
      moveBy *= 0.2;
    }

    // Adjust these bounds based on the actual width of your content to make it seamless
    let newX = baseX.get() - moveBy * 3;
    
    // Simple wrap logic assuming 50% width is one full set of items
    if (newX <= -50) {
      newX += 50;
    } else if (newX >= 0) {
      newX -= 50;
    }

    baseX.set(newX);
  });

  // Render the items multiple times to ensure we have enough width to scroll continuously
  const renderItems = () => (
    <div className="flex justify-around min-w-full shrink-0 items-center gap-16 pr-16">
      {items.map((item, i) => (
        <span
          key={i}
          className="flex items-center gap-4 font-mono text-2xs font-bold tracking-widest uppercase text-foreground/80"
        >
          <span className="size-1.5 bg-primary rounded-none shrink-0" />
          <span>{item.title}</span>
          {item.category && (
            <span className="text-[9px] text-primary/75 border border-primary/20 px-2 py-0.5 font-mono rounded-none">
              {item.category.replace(/_/g, " ")}
            </span>
          )}
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={cn("relative w-full overflow-hidden whitespace-nowrap", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="flex w-[400%]"
        style={{ x: useTransform(baseX, (v) => `${v}%`) }}
      >
        {renderItems()}
        {renderItems()}
        {renderItems()}
        {renderItems()}
      </motion.div>
    </div>
  );
}
