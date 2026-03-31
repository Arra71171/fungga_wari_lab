"use client";

import * as React from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";

type SplitTextProps = {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
};

const containerVariants = (stagger: number, delay: number): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
});

const wordVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    clipPath: "inset(100% 0 0 0)",
  },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: "inset(0% 0 0 0)",
    transition: {
      type: "spring",
      stiffness: 180,
      damping: 20,
    },
  },
};

/**
 * SplitText — splits text into words and staggers each word's entrance
 * using a clip-path wipe + spring physics. 2026 scroll-triggered reveal pattern.
 *
 * @param text - The text string to animate
 * @param stagger - Delay between words (default 0.06s)
 * @param delay - Delay before first word (default 0s)
 * @param once - Only animate once (default true)
 * @param as - HTML tag to render (default "h1")
 */
function SplitText({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.06,
  once = true,
  as: Tag = "h1",
}: SplitTextProps) {
  const ref = React.useRef<HTMLElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once, margin: "0px 0px -60px 0px" });

  const words = text.split(" ");

  const MotionTag = motion[Tag] as typeof motion.h1;

  return (
    <MotionTag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      variants={containerVariants(stagger, delay)}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={cn("overflow-hidden", className)}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            variants={wordVariants}
            className={cn("inline-block", wordClassName)}
          >
            {word}
            {i < words.length - 1 && "\u00A0"}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

export { SplitText };
