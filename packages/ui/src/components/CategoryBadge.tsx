import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@workspace/ui/lib/utils"

const categoryBadgeVariants = cva(
  "inline-flex items-center rounded-none border px-2.5 py-0.5 text-xs font-semibold select-none transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        folk: "border-transparent bg-brand-ember text-primary-foreground",
        legend: "border-transparent bg-brand-ochre text-primary-foreground",
        myth: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CategoryBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof categoryBadgeVariants> {}

function CategoryBadge({ className, variant, ...props }: CategoryBadgeProps) {
  return (
    <div
      data-slot="category-badge"
      className={cn(categoryBadgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { CategoryBadge, categoryBadgeVariants }
