"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

interface MarqueeProps extends React.ComponentPropsWithoutRef<"div"> {
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean
  /**
   * Content to be displayed in the marquee
   */
  children: React.ReactNode
  /**
   * Whether to animate vertically instead of horizontally
   * @default false
   */
  vertical?: boolean
  /**
   * Number of times to repeat the content for a seamless loop
   * @default 4
   */
  repeat?: number
  /**
   * Duration of the animation loop in seconds
   * @default 40
   */
  duration?: number
}

/**
 * Refined Marquee using standard CSS for better performance for high-frequency loops
 */
function MarqueeRefined({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  duration = 40,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      data-slot="marquee"
      className={cn(
        "group flex gap-(--gap) overflow-hidden p-2 [--gap:1rem]",
        vertical ? "flex-col" : "flex-row",
        pauseOnHover && "pause-on-hover",
        className
      )}
      style={{
        ["--duration" as string]: `${duration}s`,
        ["--gap" as string]: `1rem`,
      } as React.CSSProperties}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            data-slot="marquee-content"
            className={cn("flex shrink-0 justify-around gap-(--gap)", {
              "animate-marquee-x flex-row": !vertical,
              "animate-marquee-y flex-col": vertical,
              "animate-reverse": reverse,
            })}
          >
            {children}
          </div>
        ))}
        {/* We use a scoped style tag to keep it self-contained whilst following shadcn patterns */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee-x {
            from { transform: translateX(0); }
            to { transform: translateX(calc(-100% - var(--gap))); }
          }
          @keyframes marquee-y {
            from { transform: translateY(0); }
            to { transform: translateY(calc(-100% - var(--gap))); }
          }
          .animate-marquee-x {
            animation: marquee-x var(--duration) linear infinite;
          }
          .animate-marquee-y {
            animation: marquee-y var(--duration) linear infinite;
          }
          .animate-reverse {
            animation-direction: reverse;
          }
          .pause-on-hover:hover > div {
            animation-play-state: paused;
          }
        `}} />
    </div>
  )
}

export { MarqueeRefined as Marquee }
