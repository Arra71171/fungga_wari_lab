import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@workspace/ui/lib/utils"

const chapterItemVariants = cva(
  "flex w-full items-center justify-between rounded-none border border-border bg-card p-4 transition-colors hover:bg-muted/50",
  {
    variants: {
      status: {
        locked: "opacity-50 grayscale",
        active: "border-primary shadow-sm shadow-primary/10",
        completed: "border-secondary bg-muted/20",
      },
    },
    defaultVariants: {
      status: "locked",
    },
  }
)

export interface ChapterItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chapterItemVariants> {
  title: string
  order: number
  sceneCount?: number
}

function ChapterItem({
  className,
  status,
  title,
  order,
  sceneCount = 0,
  ...props
}: ChapterItemProps) {
  return (
    <div
      data-slot="chapter-item"
      className={cn(chapterItemVariants({ status }), className)}
      {...props}
    >
      <div className="flex items-center gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-muted font-mono text-muted-foreground font-semibold">
          {order}
        </span>
        <div className="flex flex-col space-y-1">
          <h4 className="font-heading font-medium leading-none tracking-tight">
            {title}
          </h4>
          <p className="text-sm text-muted-foreground">
            {sceneCount} Scenes
          </p>
        </div>
      </div>
      <div>
        {status === "completed" && (
          <span className="text-secondary-foreground text-sm font-medium">Completed</span>
        )}
        {status === "active" && (
          <span className="text-primary text-sm font-medium animate-pulse">Current</span>
        )}
        {status === "locked" && (
          <span className="text-muted-foreground text-sm">Locked</span>
        )}
      </div>
    </div>
  )
}

export { ChapterItem, chapterItemVariants }
