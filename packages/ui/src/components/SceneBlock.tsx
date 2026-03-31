import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@workspace/ui/lib/utils"

const sceneBlockVariants = cva(
  "w-full text-lg leading-relaxed font-sans tracking-normal transition-opacity duration-500",
  {
    variants: {
      type: {
        paragraph: "mb-6 text-foreground/90",
        dialogue: "my-8",
        action: "mb-6 italic text-muted-foreground",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
    },
    defaultVariants: {
      type: "paragraph",
      align: "left",
    },
  }
)

export interface SceneBlockProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sceneBlockVariants> {
  children: React.ReactNode
  characterName?: string
}

function SceneBlock({
  className,
  type,
  align,
  children,
  characterName,
  ...props
}: SceneBlockProps) {
  if (type === "dialogue") {
    return (
      <div 
        data-slot="scene-block-dialogue"
        className={cn(sceneBlockVariants({ type, align }), className)} 
        {...props}
      >
        {characterName && (
          <span className="block mb-2 text-primary font-heading font-semibold tracking-wider uppercase text-sm">
            {characterName}
          </span>
        )}
        <blockquote>
          {children}
        </blockquote>
      </div>
    )
  }

  return (
    <div
      data-slot="scene-block"
      className={cn(sceneBlockVariants({ type, align }), className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { SceneBlock, sceneBlockVariants }
