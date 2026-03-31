import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@workspace/ui/lib/utils"
import { CategoryBadge } from "@workspace/ui/components/CategoryBadge"
import { ProgressBar } from "@workspace/ui/components/ProgressBar"

const storyCardVariants = cva(
  "group relative flex flex-col overflow-hidden rounded-md border border-border/50 bg-card text-card-foreground transition-all duration-300 hover:border-primary hover:shadow-brutal hover:-translate-y-0.5 hover:-translate-x-0.5",
  {
    variants: {
      variant: {
        default: "",
        compact: "flex-row h-24 sm:h-32",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface StoryCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof storyCardVariants> {
  title: string
  category: "folk" | "legend" | "myth" | "default"
  coverUrl?: string
  progress?: number
  totalScenes?: number
}

function StoryCard({
  className,
  variant,
  title,
  category,
  coverUrl,
  progress = 0,
  totalScenes = 100,
  ...props
}: StoryCardProps) {
  const isCompact = variant === "compact"
  return (
    <div
      data-slot="story-card"
      className={cn(storyCardVariants({ variant }), className)}
      {...props}
    >
      {/* Cover Image Container */}
      <div
        className={cn(
          "relative overflow-hidden bg-muted",
          isCompact ? "h-full w-1/3 shrink-0" : "aspect-video w-full"
        )}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-muted to-secondary flex items-center justify-center opacity-70">
            <span className="text-muted-foreground font-heading opacity-50">No Cover</span>
          </div>
        )}
        
        {/* Category Overlay */}
        <div className="absolute top-2 left-2 z-10">
          <CategoryBadge variant={category === "default" ? "default" : category}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </CategoryBadge>
        </div>
      </div>
      
      {/* Content Container */}
      <div className={cn("flex flex-1 flex-col p-4", isCompact && "justify-center")}>
        <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground line-clamp-2">
          {title}
        </h3>
        
        {/* Progress Section */}
        {progress > 0 && (
          <div className="mt-auto pt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{Math.round((progress / totalScenes) * 100)}% read</span>
              <span>{progress} / {totalScenes} scenes</span>
            </div>
            <ProgressBar value={progress} max={totalScenes} variant="default" size="sm" />
          </div>
        )}
      </div>
    </div>
  )
}

export { StoryCard, storyCardVariants }
