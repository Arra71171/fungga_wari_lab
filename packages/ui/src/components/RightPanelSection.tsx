import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@workspace/ui/lib/utils"

const rightPanelSectionVariants = cva(
  "flex flex-col gap-3 py-6 px-4 first:pt-4 border-b border-border/50 bg-background/50",
  {
    variants: {
      variant: {
        default: "",
        highlight: "bg-brand-ember/5 border-l-2 border-l-brand-ember",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface RightPanelSectionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof rightPanelSectionVariants> {
  title: string
  action?: React.ReactNode
}

function RightPanelSection({
  className,
  variant,
  title,
  action,
  children,
  ...props
}: RightPanelSectionProps) {
  return (
    <div
      data-slot="right-panel-section"
      className={cn(rightPanelSectionVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
        {action && <div>{action}</div>}
      </div>
      <div className="flex flex-col gap-3">
        {children}
      </div>
    </div>
  )
}

export { RightPanelSection, rightPanelSectionVariants }
