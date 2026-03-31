import * as React from "react"
import { ScrollText } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

type BrandLogoProps = {
  /** Show just the icon glyph, or icon + text */
  variant?: "full" | "icon" | "text"
  /** Size scale */
  size?: "sm" | "md" | "lg"
  /** Extra classes on the wrapper */
  className?: string
}

const sizeMap = {
  sm: { icon: "size-4", text: "text-base", dot: "text-sm" },
  md: { icon: "size-5", text: "text-xl", dot: "text-base" },
  lg: { icon: "size-7", text: "text-3xl", dot: "text-2xl" },
}

/**
 * BrandLogo — Fungga Wari Lab folk-story identity mark.
 *
 * Uses `ScrollText` (parchment / scripture / story) from lucide-react
 * as the icon glyph — semantically perfect for a folklore archive platform.
 *
 * Typography follows the Zen Brutalist design system:
 *  - font-display (Instrument Serif italic) for the wordmark
 *  - font-heading (Bacasime Antique) for the .Lab suffix
 *
 * @example
 * <BrandLogo />                     // full wordmark
 * <BrandLogo variant="icon" />      // just the scroll icon
 * <BrandLogo size="lg" />           // large wordmark
 */
function BrandLogo({ variant = "full", size = "md", className }: BrandLogoProps) {
  const { icon, text, dot } = sizeMap[size]

  if (variant === "icon") {
    return (
      <span
        data-slot="brand-logo"
        aria-label="Fungga Wari Lab"
        className={cn(
          "inline-flex items-center justify-center rounded-none border border-border/60 bg-secondary/30 p-1.5 text-primary",
          className
        )}
      >
        <ScrollText className={icon} strokeWidth={1.5} />
      </span>
    )
  }

  if (variant === "text") {
    return (
      <span
        data-slot="brand-logo"
        className={cn("inline-flex items-baseline gap-0", className)}
      >
        <span className={cn("font-display italic tracking-tight text-foreground", text)}>
          Fungga Wari
        </span>
        <span className={cn("font-heading not-italic text-primary", dot)}>.Lab</span>
      </span>
    )
  }

  // variant === "full"
  return (
    <span
      data-slot="brand-logo"
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      {/* Icon mark — a scroll/parchment, evocative of oral-tradition manuscripts */}
      <span
        aria-hidden="true"
        className="inline-flex shrink-0 items-center justify-center rounded-none border border-border/60 bg-primary/8 p-1.5 text-primary"
      >
        <ScrollText className={icon} strokeWidth={1.5} />
      </span>

      {/* Wordmark */}
      <span className="inline-flex items-baseline gap-0 leading-none">
        <span className={cn("font-display italic tracking-tight text-foreground", text)}>
          Fungga Wari
        </span>
        <span className={cn("font-heading not-italic text-primary", dot)}>.Lab</span>
      </span>
    </span>
  )
}

export { BrandLogo }
export type { BrandLogoProps }
