import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@workspace/ui/lib/utils"

const choiceButtonVariants = cva(
  "inline-flex w-full items-center justify-between whitespace-nowrap rounded-none border-2 px-6 py-4 text-base font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-muted/50 hover:pl-8",
  {
    variants: {
      variant: {
        default: "border-border bg-background text-foreground hover:border-brand-ember/50 hover:text-brand-ember",
        primary: "border-brand-ember bg-brand-ember/10 text-brand-ember hover:border-brand-ember hover:bg-brand-ember/20",
        ghost: "border-transparent bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-14",
        sm: "h-11 px-4 text-sm",
        lg: "h-16 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ChoiceButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof choiceButtonVariants> {
  asChild?: boolean
  label: string
  sublabel?: string
}

function ChoiceButton({
  className,
  variant,
  size,
  asChild = false,
  label,
  sublabel,
  ...props
}: ChoiceButtonProps) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="choice-button"
      className={cn(choiceButtonVariants({ variant, size, className }))}
      {...props}
    >
      <div className="flex flex-col items-start gap-1">
        <span>{label}</span>
        {sublabel && (
          <span className="text-sm font-normal text-muted-foreground transition-colors group-hover:text-brand-ember/80">
            {sublabel}
          </span>
        )}
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5 shrink-0 opacity-50 transition-transform group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-brand-ember"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </Comp>
  )
}

export { ChoiceButton, choiceButtonVariants }
