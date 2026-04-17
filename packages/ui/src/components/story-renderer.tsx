"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@workspace/ui/lib/utils"
import { BLOCK_MAP, type BlockData, type BlockType } from "@workspace/ui/components/story-blocks"
import { BlockWrapper } from "@workspace/ui/components/editor/block-wrapper"
import { BlockInserter } from "@workspace/ui/components/editor/block-inserter"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// â”€â”€â”€ Animation Variants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const cinematicFadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

// â”€â”€â”€ Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type StoryRendererProps = {
  blocks: BlockData[]
  mode?: "editor" | "viewer"
  className?: string
  // Editor callbacks
  onBlockSelect?: (blockId: string | null) => void
  onBlockUpdate?: (blockId: string, props: Record<string, unknown>) => void
  onBlockDelete?: (blockId: string) => void
  onBlockAdd?: (type: BlockType, afterIndex: number) => void
  onBlockReorder?: (fromIndex: number, toIndex: number) => void
  selectedBlockId?: string | null
}

// â”€â”€â”€ Sortable Item Wrapper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function SortableBlockItem({
  block,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  index: _index,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
  onAddAfter,
  isInserterOpen,
  onCloseInserter,
  onAddBlock,
}: {
  block: BlockData
  index: number
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onUpdate: (newProps: Record<string, unknown>) => void
  onAddAfter: () => void
  isInserterOpen: boolean
  onCloseInserter: () => void
  onAddBlock: (type: BlockType) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const Component = BLOCK_MAP[block.type as BlockType]
  if (!Component) return null

  return (
    <div ref={setNodeRef} style={style} className="relative z-0">
      <BlockWrapper
        isSelected={isSelected}
        blockType={block.type}
        onSelect={onSelect}
        onDelete={onDelete}
        onAddAfter={onAddAfter}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      >
        <Component
          {...(block.props as Record<string, unknown>)}
          editable={isSelected}
          onChange={onUpdate}
        />
      </BlockWrapper>

      {/* Inserter popup */}
      {isInserterOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-50">
          <BlockInserter onSelect={onAddBlock} onClose={onCloseInserter} />
        </div>
      )}
    </div>
  )
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StoryRenderer({
  blocks,
  mode = "viewer",
  className,
  onBlockSelect,
  onBlockUpdate,
  onBlockDelete,
  onBlockAdd,
  onBlockReorder,
  selectedBlockId,
}: StoryRendererProps) {
  const [inserterIndex, setInserterIndex] = React.useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const sortedBlocks = React.useMemo(
    () => [...blocks].sort((a, b) => a.order - b.order),
    [blocks]
  )

  const handleAddBlock = (type: BlockType) => {
    if (inserterIndex !== null) {
      onBlockAdd?.(type, inserterIndex)
      setInserterIndex(null)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !onBlockReorder) return

    const oldIndex = sortedBlocks.findIndex((b) => b._id === active.id)
    const newIndex = sortedBlocks.findIndex((b) => b._id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      onBlockReorder(oldIndex, newIndex)
    }
  }

  // â”€â”€â”€ Viewer Mode â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  if (mode === "viewer") {
    return (
      <motion.div
        data-slot="story-renderer"
        className={cn("w-full max-w-3xl mx-auto px-4 md:px-0 py-12", className)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
      >
        {sortedBlocks.map((block) => {
          const Component = BLOCK_MAP[block.type as BlockType]
          if (!Component) return null

          return (
            <motion.div
              key={block._id}
              variants={cinematicFadeUp}
              className="mb-6"
            >
              <Component {...(block.props as Record<string, unknown>)} />
            </motion.div>
          )
        })}
      </motion.div>
    )
  }

  // â”€â”€â”€ Editor Mode â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <div
      data-slot="story-renderer-editor"
      className={cn("w-full max-w-3xl mx-auto px-4 md:px-0 py-8 space-y-8", className)}
    >
      {sortedBlocks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <p className="text-muted-foreground text-sm font-mono">No blocks yet</p>
          <button
            onClick={() => setInserterIndex(0)}
            className={cn(
              "px-4 py-2 text-sm font-mono border-2 border-border rounded-none",
              "hover:border-primary hover:text-primary transition-colors"
            )}
          >
            + Add first block
          </button>
          {inserterIndex === 0 && (
            <BlockInserter
              onSelect={handleAddBlock}
              onClose={() => setInserterIndex(null)}
            />
          )}
        </div>
      )}

      {sortedBlocks.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedBlocks.map((b) => b._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {sortedBlocks.map((block, index) => (
                <SortableBlockItem
                  key={block._id}
                  block={block}
                  index={index}
                  isSelected={selectedBlockId === block._id}
                  onSelect={() => onBlockSelect?.(selectedBlockId === block._id ? null : block._id)}
                  onDelete={() => onBlockDelete?.(block._id)}
                  onUpdate={(newProps) => onBlockUpdate?.(block._id, newProps)}
                  onAddAfter={() => setInserterIndex(index)}
                  isInserterOpen={inserterIndex === index}
                  onCloseInserter={() => setInserterIndex(null)}
                  onAddBlock={handleAddBlock}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

export { StoryRenderer }
export type { StoryRendererProps }
