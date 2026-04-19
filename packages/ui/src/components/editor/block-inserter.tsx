"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import {
  Type,
  Heading2,
  ImageIcon,
  MessageCircle,
  GitBranch,
  Minus,
  Quote,
  Sparkles,
} from "lucide-react"
import type { BlockType } from "@workspace/ui/components/story-blocks"

type BlockTypeOption = {
  type: BlockType
  label: string
  icon: React.ReactNode
  description: string
}

const BLOCK_OPTIONS: BlockTypeOption[] = [
  { type: "text", label: "Text", icon: <Type className="size-4" />, description: "Plain paragraph text" },
  { type: "heading", label: "Heading", icon: <Heading2 className="size-4" />, description: "Section heading" },
  { type: "image", label: "Image", icon: <ImageIcon className="size-4" />, description: "Illustration or photo" },
  { type: "dialogue", label: "Dialogue", icon: <MessageCircle className="size-4" />, description: "Character speech" },
  { type: "choice", label: "Choice", icon: <GitBranch className="size-4" />, description: "Branching options" },
  { type: "divider", label: "Divider", icon: <Minus className="size-4" />, description: "Visual separator" },
  { type: "quote", label: "Quote", icon: <Quote className="size-4" />, description: "Folk wisdom / proverb" },
  { type: "scene_break", label: "Scene Break", icon: <Sparkles className="size-4" />, description: "New scene marker" },
]

type BlockInserterProps = {
  onSelect: (type: BlockType) => void
  onClose: () => void
  className?: string
}

function BlockInserter({ onSelect, onClose, className }: BlockInserterProps) {
  const [search, setSearch] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)

  const filtered = BLOCK_OPTIONS.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      opt.description.toLowerCase().includes(search.toLowerCase())
  )

  // Close on click outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  // Close on Escape
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  return (
    <div
      ref={containerRef}
      data-slot="block-inserter"
      className={cn(
        "w-64 bg-background border-2 border-border rounded-none shadow-brutal p-2 z-50",
        className
      )}
    >
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Filter blocksâ€¦"
        aria-label="Filter block types"
        autoFocus
        className="w-full px-3 py-2 text-sm bg-secondary/50 border border-border rounded-none outline-none mb-2 placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-ring"
      />
      <div className="space-y-0.5 max-h-64 overflow-y-auto">
        {filtered.map((opt) => (
          <button
            key={opt.type}
            onClick={() => {
              onSelect(opt.type)
              onClose()
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-none",
              "text-sm text-foreground",
              "hover:bg-accent/50 transition-colors duration-100",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            )}
          >
            <span className="text-primary/80 flex-shrink-0">{opt.icon}</span>
            <div className="flex-1 min-w-0">
              <span className="block font-medium text-sm">{opt.label}</span>
              <span className="block text-2xs text-muted-foreground">{opt.description}</span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="px-3 py-4 text-sm text-muted-foreground text-center">
            No matching blocks
          </p>
        )}
      </div>
    </div>
  )
}

export { BlockInserter, BLOCK_OPTIONS }
