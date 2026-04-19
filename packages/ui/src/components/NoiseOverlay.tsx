import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

interface NoiseOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  opacity?: number
}

export function NoiseOverlay({ opacity = 0.04, className, ...props }: NoiseOverlayProps) {
  return (
    <div
      className={cn("pointer-events-none fixed inset-0 z-50 size-full overflow-hidden", className)}
      style={{ opacity }}
      aria-hidden="true"
      {...props}
    >
      <svg className="absolute inset-0 size-full">
        <filter id="noiseFilter">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.9" 
            numOctaves="3" 
            stitchTiles="stitch" 
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  )
}
