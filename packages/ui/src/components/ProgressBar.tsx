import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@workspace/ui/lib/utils"

const progressBarVariants = cva(
  "relative w-full overflow-hidden rounded-none bg-secondary",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        default: "h-2",
        sm: "h-1",
        lg: "h-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressBarVariants> {
  value?: number
  max?: number
}

function ProgressBar({
  className,
  variant,
  size,
  value = 0,
  max = 100,
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  return (
    <div
      data-slot="progress-bar"
      className={cn(progressBarVariants({ variant, size, className }))}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full flex-1 bg-primary transition-all duration-500 ease-in-out"
        )}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  )
}

export { ProgressBar, progressBarVariants }
