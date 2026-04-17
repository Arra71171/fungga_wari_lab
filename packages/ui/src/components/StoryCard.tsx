import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@workspace/ui/lib/utils"
// CategoryBadge reserved for future use in category display variations
import { ProgressBar } from "@workspace/ui/components/ProgressBar"
import { Flame, BookOpen, Globe2 } from "lucide-react"

const storyCardVariants = cva(
  "group relative flex flex-col overflow-hidden border border-border transition-colors duration-300 hover:border-primary cursor-pointer hover:-translate-y-0.5",
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
  category: string | "folk" | "legend" | "myth" | "default"
  coverUrl?: string
  /** Render prop for framework-specific image optimization (e.g. next/image) */
  renderImage?: () => React.ReactNode
  progress?: number
  totalScenes?: number
  description?: string
  status?: string
  chapterCount?: number
  language?: string
}

function StoryCard({
  className,
  variant,
  title,
  category,
  coverUrl,
  renderImage,
  progress = 0,
  totalScenes = 100,
  description,
  status,
  chapterCount,
  language,
  ...props
}: StoryCardProps) {
  const isCompact = variant === "compact"

  if (isCompact) {
    // Compact Horizontal Layout (Bento structure applied differently)
    return (
      <div
        data-slot="story-card"
        className={cn(storyCardVariants({ variant }), "bg-border gap-px flex", className)}
        {...props}
      >
        <div className="bg-background h-full w-1/3 shrink-0 relative overflow-hidden">
          {renderImage ? (
            renderImage()
          ) : coverUrl ? (
            // eslint-disable-next-line no-restricted-syntax
            <img
              src={coverUrl}
              alt={title}
              className="h-full w-full object-cover grayscale transition-transform duration-500 group-hover:grayscale-0 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-cinematic-bg to-bg-overlay flex items-center justify-center">
              <Flame className="size-8 text-brand-ember/30 group-hover:text-brand-ember/50 transition-colors duration-300" />
            </div>
          )}
        </div>
        <div className="bg-background flex flex-1 flex-col p-4 justify-center">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-heading text-base font-semibold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            {status && (
              <span className={cn(
                "text-[9px] uppercase font-mono tracking-widest px-1.5 py-0.5 border shrink-0",
                status.toLowerCase() === 'published' ? "bg-primary/5 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"
              )}>
                {status}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-3 text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
            <span>{category}</span>
            {language && <span>· {language}</span>}
          </div>
        </div>
      </div>
    )
  }

  // Bento Grid Zen Brutalist Vertical Layout
  return (
    <div
      data-slot="story-card"
      className={cn(storyCardVariants({ variant }), "bg-border gap-px flex flex-col", className)}
      {...props}
    >
      {/* 1. Cover Image Compartment */}
      <div className="bg-muted relative overflow-hidden aspect-[3/4] w-full shrink-0">
        {renderImage ? (
          renderImage()
        ) : coverUrl ? (
          // eslint-disable-next-line no-restricted-syntax
          <img
            src={coverUrl}
            alt={title}
            className="h-full w-full object-cover grayscale-[20%] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-cinematic-panel to-cinematic-bg flex items-center justify-center">
            <Flame className="size-12 text-brand-ember/20 group-hover:text-brand-ember/40 transition-colors duration-300" />
          </div>
        )}
        
        {/* Status Overlay */}
        {status && (
          <div className="absolute top-2 right-2 z-10">
            <span className={cn(
              "text-[9px] uppercase font-mono tracking-widest px-2 py-1 flex items-center backdrop-blur-sm shadow-sm border",
              status.toLowerCase() === 'published' ? "bg-background/90 text-primary border-primary/30" : "bg-background/90 text-muted-foreground border-border"
            )}>
              {status}
            </span>
          </div>
        )}
      </div>
      
      {/* 2. Main Text Compartment */}
      <div className="bg-background flex flex-col p-4 flex-1">
        <h3 className="font-heading text-lg font-black uppercase tracking-tighter leading-tight text-foreground transition-colors group-hover:text-primary line-clamp-2">
          {title}
        </h3>
        
        {description && (
          <p className="mt-2 text-xs text-muted-foreground font-mono leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* 3. Metadata Compartments Split (Bento Bottom) */}
      <div className="grid grid-cols-2 gap-px bg-border shrink-0">
        <div className="bg-background p-3 flex flex-col justify-center items-center text-center">
          <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">Category</span>
          <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-primary truncate w-full px-1">{category}</span>
        </div>
        
        <div className="bg-background p-3 flex flex-col justify-center items-center text-center">
          <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">
            {language ? "Language" : "Chapters"}
          </span>
          <span className="text-[10px] uppercase tracking-widest font-mono text-foreground flex items-center gap-1.5 truncate flex-wrap justify-center">
            {language ? (
              <>
                <Globe2 className="size-2.5 text-muted-foreground shrink-0" />
                {language}
              </>
            ) : (
              <>
                <BookOpen className="size-2.5 text-muted-foreground shrink-0" />
                {chapterCount ?? 0}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Progress Compartment (If Applicable) */}
      {progress > 0 && (
        <div className="bg-background p-3 pt-2 shrink-0 border-t border-border">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-2">
            <span>{Math.round((progress / totalScenes) * 100)}%</span>
            <span>{progress} / {totalScenes}</span>
          </div>
          <ProgressBar value={progress} max={totalScenes} variant="default" size="sm" className="h-1 rounded-none" />
        </div>
      )}
    </div>
  )
}

export { StoryCard, storyCardVariants }
