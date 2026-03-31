import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@workspace/ui/lib/utils"
import { AvatarBadge } from "@workspace/ui/components/AvatarBadge"

const dialogueBlockVariants = cva(
  "flex w-full gap-4 p-4 my-2 transition-opacity duration-300",
  {
    variants: {
      align: {
        left: "flex-row",
        right: "flex-row-reverse text-right",
      },
      emphasis: {
        default: "opacity-100",
        dimmed: "opacity-50",
      },
    },
    defaultVariants: {
      align: "left",
      emphasis: "default",
    },
  }
)

export interface DialogueBlockProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dialogueBlockVariants> {
  characterName: string
  avatarUrl?: string
  quote: React.ReactNode
}

function DialogueBlock({
  className,
  align,
  emphasis,
  characterName,
  avatarUrl,
  quote,
  ...props
}: DialogueBlockProps) {
  return (
    <div
      data-slot="dialogue-block"
      className={cn(dialogueBlockVariants({ align, emphasis }), className)}
      {...props}
    >
      <AvatarBadge src={avatarUrl} alt={characterName} size="lg" className="border-2 border-brand-ember/20" />
      <div className={cn("flex max-w-[80%] flex-col gap-1", align === "right" && "items-end")}>
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-ochre">
          {characterName}
        </span>
        <div className="rounded-none bg-secondary/50 px-5 py-3 text-sm leading-relaxed text-foreground shadow-sm">
          {quote}
        </div>
      </div>
    </div>
  )
}

export { DialogueBlock, dialogueBlockVariants }
