import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

interface SectionDividerProps extends React.SVGProps<SVGSVGElement> {
  variant?: "smoke" | "ink-wash" | "wave"
  position?: "top" | "bottom"
}

export function SectionDivider({ 
  variant = "ink-wash", 
  position = "top", 
  className,
  ...props 
}: SectionDividerProps) {
  
  // Choose the SVG path based on variant
  const getPath = () => {
    switch (variant) {
      case "smoke":
        return "M0,50 C150,150 250,0 400,50 C550,100 650,20 800,50 C950,80 1050,40 1200,50 L1200,100 L0,100 Z"
      case "ink-wash":
        return "M0,80 Q200,10 400,60 T800,40 T1200,70 L1200,100 L0,100 Z"
      case "wave":
      default:
        return "M0,30 Q150,90 300,30 T600,30 T900,30 T1200,30 L1200,100 L0,100 Z" 
    }
  }

  // Adjust SVG to anchor to top or bottom
  const containerClass = position === "top" ? 
    "absolute top-0 left-0 w-full overflow-hidden rotate-180 transform translate-y-[-1px]" : 
    "absolute bottom-0 left-0 w-full overflow-hidden translate-y-[1px]"

  return (
    <div className={cn(containerClass, "h-8 md:h-16 lg:h-24 pointer-events-none text-background fill-current z-10", className)}>
      <svg 
        viewBox="0 0 1200 100" 
        preserveAspectRatio="none" 
        className="h-full w-full opacity-80"
        aria-hidden="true"
        {...props}
      >
        <path d={getPath()} />
        {/* Layer a second path slightly offset for the "ink wash/smoke" feel */}
        {(variant === "smoke" || variant === "ink-wash") && (
          <path d={getPath()} className="opacity-50" style={{ transform: "scaleY(-0.8) scaleX(1.05) translateX(-2%)" }} />
        )}
      </svg>
    </div>
  )
}
