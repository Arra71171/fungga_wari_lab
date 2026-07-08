import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@workspace/ui/lib/utils"

const nordicCardVariants = cva(
  "border rounded-xl transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-border-subtle/50 bg-bg-surface backdrop-blur-sm",
        panel: "border-border-subtle/30 bg-bg-panel backdrop-blur-sm",
        interactive: "border-border-subtle/50 bg-bg-surface hover:-translate-y-1 hover:border-border-strong/50 transition-transform",
        ghost: "border-transparent bg-bg-surface hover:-translate-y-[1px] hover:border-border-subtle/50",
      },
      padding: {
        none: "",
        sm: "p-4 md:p-6",
        md: "p-6 md:p-8",
        lg: "p-8 md:p-10",
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
)

type NordicCardProps = React.ComponentProps<"div"> & 
  VariantProps<typeof nordicCardVariants> & {
    asChild?: boolean
  }

function NordicCard({
  className,
  variant,
  padding,
  asChild = false,
  ...props
}: NordicCardProps) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="nordic-card"
      className={cn(nordicCardVariants({ variant, padding, className }))}
      {...props}
    />
  )
}

export { NordicCard, nordicCardVariants }
export type { NordicCardProps }
