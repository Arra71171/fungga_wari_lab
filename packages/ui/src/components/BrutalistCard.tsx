import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@workspace/ui/lib/utils"

const brutalistCardVariants = cva(
  "border-2 rounded-none transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-border shadow-brutal bg-bg-surface",
        panel: "border-border-strong shadow-brutal bg-bg-panel",
        interactive: "border-border shadow-brutal-sm bg-bg-surface hover:-translate-y-1 hover:shadow-brutal hover:border-primary",
        ghost: "border-border bg-bg-surface hover:shadow-brutal-sm hover:-translate-y-[2px] hover:border-primary",
      },
      padding: {
        none: "",
        sm: "p-3 md:p-4",
        md: "p-4 md:p-6",
        lg: "p-6 md:p-8",
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
)

type BrutalistCardProps = React.ComponentProps<"div"> & 
  VariantProps<typeof brutalistCardVariants> & {
    asChild?: boolean
  }

function BrutalistCard({
  className,
  variant,
  padding,
  asChild = false,
  ...props
}: BrutalistCardProps) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="brutalist-card"
      className={cn(brutalistCardVariants({ variant, padding, className }))}
      {...props}
    />
  )
}

export { BrutalistCard, brutalistCardVariants }
export type { BrutalistCardProps }
