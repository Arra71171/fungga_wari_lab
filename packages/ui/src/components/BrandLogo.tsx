import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

type BrandLogoProps = {
  /** Show just the icon glyph, or icon + wordmark, or wordmark only */
  variant?: "full" | "icon" | "text"
  /** Size scale */
  size?: "sm" | "md" | "lg"
  /** Extra classes on the wrapper */
  className?: string
}

const sizeMap = {
  sm: { svgSize: 18, text: "text-base", dot: "text-xs" },
  md: { svgSize: 22, text: "text-xl", dot: "text-sm" },
  lg: { svgSize: 30, text: "text-3xl", dot: "text-xl" },
}

/**
 * FungaMark — the Fungga Wari Lab identity glyph.
 *
 * A minimalist brutalist mark evoking the oral tradition by the hearth:
 *  ① Ground line     — the foundation, the hearth.
 *  ② Arch            — the warmth of the fireplace (Fungga).
 *  ③ Vertical bars   — audio waves / oral storytelling (Wari).
 */
function FungaMark({
  size = 22,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className={className}
    >
      {/* Hearth / Base Stones */}
      <line x1="4" y1="20" x2="20" y2="20" />
      <line x1="8" y1="16" x2="16" y2="16" />
      {/* stylized flames reaching up */}
      <path d="M12 16L12 9" />
      <path d="M8 16L6 11" />
      <path d="M16 16L18 11" />
      {/* The Rising Story Spark */}
      <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

/**
 * BrandLogo — Fungga Wari Lab folk-story identity mark.
 *
 * Typography follows the Zen Brutalist design system:
 *  - `font-mono uppercase font-black tracking-widest` for "Fungga Wari"
 *  - `font-mono` for the ".Lab" suffix (precision, archive, digital)
 */
function BrandLogo({ variant = "full", size = "md", className }: BrandLogoProps) {
  const { svgSize, text, dot } = sizeMap[size]

  if (variant === "icon") {
    return (
      <span
        data-slot="brand-logo"
        aria-label="Fungga Wari Lab"
        className={cn(
          "inline-flex items-center justify-center rounded-none border-2 border-border-strong bg-primary/10 p-1.5 text-primary",
          className
        )}
      >
        <FungaMark size={svgSize} />
      </span>
    )
  }

  if (variant === "text") {
    return (
      <span
        data-slot="brand-logo"
        className={cn("inline-flex items-center gap-1", className)}
      >
        <span className={cn("font-meetei font-black tracking-wide text-foreground", text)}>
          ꯐꯨꯡꯒꯥ ꯋꯥꯔꯤ
        </span>
        <span className={cn("font-mono font-bold text-muted-foreground/80 opacity-90", dot)}>.Lab</span>
      </span>
    )
  }

  // variant === "full"
  return (
    <span
      data-slot="brand-logo"
      className={cn("inline-flex items-center gap-3", className)}
    >
      {/* SVG mark */}
      <span
        aria-hidden="true"
        className="inline-flex shrink-0 items-center justify-center rounded-none border-2 border-border-strong bg-primary/10 p-1.5 text-primary"
      >
        <FungaMark size={svgSize} />
      </span>

      {/* Wordmark */}
      <span className="inline-flex items-center gap-1 leading-none mt-1">
        <span className={cn("font-meetei font-black tracking-wide text-foreground", text)}>
          ꯐꯨꯡꯒꯥ ꯋꯥꯔꯤ
        </span>
        <span className={cn("font-mono font-bold text-muted-foreground/80 opacity-90", dot)}>.Lab</span>
      </span>
    </span>
  )
}

export { BrandLogo, FungaMark }
export type { BrandLogoProps }
