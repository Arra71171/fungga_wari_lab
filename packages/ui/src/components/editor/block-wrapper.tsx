"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { GripVertical, Plus, Trash2 } from "lucide-react"

type BlockWrapperProps = {
  children: React.ReactNode
  isSelected: boolean
  blockType: string
  onSelect: () => void
  onDelete: () => void
  onAddAfter: () => void
  className?: string
  // Drag and drop props
  isDragging?: boolean
  dndRef?: React.RefCallback<HTMLElement>
  dragHandleProps?: Record<string, unknown>
}

function BlockWrapper({
  children,
  isSelected,
  blockType,
  onSelect,
  onDelete,
  onAddAfter,
  className,
  isDragging,
  dndRef,
  dragHandleProps,
}: BlockWrapperProps) {
  return (
    <div
      ref={dndRef as React.Ref<HTMLDivElement>}
      data-slot="block-wrapper"
      role="button"
      tabIndex={0}
      aria-label={`${blockType} block`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
      className={cn(
        "relative group rounded-none pl-4 transition-all duration-150",
        isSelected && "outline outline-2 outline-primary/40 bg-accent/5",
        !isSelected && "hover:outline hover:outline-1 hover:outline-border",
        isDragging && "opacity-50 scale-[1.02] z-50 ring-2 ring-primary bg-background",
        className
      )}
    >
      {/* Drag handle + Type indicator (left gutter) */}
      <div className={cn(
        "absolute -left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-opacity duration-150",
        isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
        <button
          {...dragHandleProps}
          aria-label="Drag block"
          className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
      </div>

      {/* Action toolbar (top-right) */}
      {isSelected && (
        <div className="absolute -top-9 right-0 flex items-center gap-1 bg-background border border-border rounded-none px-2 py-1 z-10">
          <span className="text-2xs font-mono uppercase tracking-wider text-muted-foreground mr-2">
            {blockType}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            aria-label="Delete block"
            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      )}

      {/* Block content */}
      <div className="px-2 py-1">{children}</div>

      {/* Add block button (below) */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAddAfter()
          }}
          aria-label="Add block after"
          className={cn(
            "size-7 flex items-center justify-center rounded-full",
            "bg-background border-2 border-primary/30 text-primary",
            "hover:bg-primary hover:text-primary-foreground hover:border-primary",
            "transition-all duration-200"
          )}
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

export { BlockWrapper }
