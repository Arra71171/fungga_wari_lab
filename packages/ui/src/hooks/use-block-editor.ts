"use client"

import * as React from "react"
import type { BlockData, BlockType } from "@workspace/ui/components/story-blocks"

type UseBlockEditorReturn = {
  blocks: BlockData[]
  selectedBlockId: string | null
  setSelectedBlockId: (id: string | null) => void
  addBlock: (type: BlockType, afterIndex: number) => void
  updateBlock: (id: string, newProps: Record<string, unknown>) => void
  deleteBlock: (id: string) => void
  reorderBlocks: (fromIndex: number, toIndex: number) => void
}

/**
 * Local optimistic state manager for blocks.
 * Designed to be used alongside Supabase mutations —
 * call the Supabase update inside the callback, then let the
 * Supabase real-time subscription update the source of truth.
 *
 * For now, this manages local state for immediate UI feedback.
 */
function useBlockEditor(
  initialBlocks: BlockData[],
  storyId: string,
  options?: {
    onAdd?: (block: BlockData) => void
    onUpdate?: (id: string, props: Record<string, unknown>) => void
    onDelete?: (id: string) => void
    onReorder?: (blockIds: string[]) => void
  }
): UseBlockEditorReturn {
  const [blocks, setBlocks] = React.useState<BlockData[]>(initialBlocks)
  const [selectedBlockId, setSelectedBlockId] = React.useState<string | null>(null)

  // Sync from external data source (e.g., remote or subscription update)
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBlocks(initialBlocks)
  }, [initialBlocks])

  const addBlock = React.useCallback(
    (type: BlockType, afterIndex: number) => {
      const now = Date.now()
      const newBlock: BlockData = {
        _id: `temp-${now}`,
        type,
        order: afterIndex + 1,
        props: getDefaultPropsForType(type),
        storyId,
        createdAt: now,
        updatedAt: now,
      }

      setBlocks((prev) => {
        const updated = [...prev]
        updated.splice(afterIndex + 1, 0, newBlock)
        // Reassign order indices
        return updated.map((b, i) => ({ ...b, order: i }))
      })

      setSelectedBlockId(newBlock._id)
      options?.onAdd?.(newBlock)
    },
    [storyId, options]
  )

  const updateBlock = React.useCallback(
    (id: string, newProps: Record<string, unknown>) => {
      setBlocks((prev) =>
        prev.map((b) =>
          b._id === id
            ? { ...b, props: { ...b.props, ...newProps }, updatedAt: Date.now() }
            : b
        )
      )
      options?.onUpdate?.(id, newProps)
    },
    [options]
  )

  const deleteBlock = React.useCallback(
    (id: string) => {
      setBlocks((prev) => {
        const filtered = prev.filter((b) => b._id !== id)
        return filtered.map((b, i) => ({ ...b, order: i }))
      })
      if (selectedBlockId === id) {
        setSelectedBlockId(null)
      }
      options?.onDelete?.(id)
    },
    [selectedBlockId, options]
  )

  const reorderBlocks = React.useCallback(
    (fromIndex: number, toIndex: number) => {
      setBlocks((prev) => {
        const updated = [...prev].sort((a, b) => a.order - b.order)
        const [moved] = updated.splice(fromIndex, 1)
        if (moved) {
          updated.splice(toIndex, 0, moved)
        }
        const reordered = updated.map((b, i) => ({ ...b, order: i }))
        options?.onReorder?.(reordered.map((b) => b._id))
        return reordered
      })
    },
    [options]
  )

  return {
    blocks,
    selectedBlockId,
    setSelectedBlockId,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
  }
}

// ─── Default Props ─────────────────────────────────────────

function getDefaultPropsForType(type: BlockType): Record<string, unknown> {
  switch (type) {
    case "text":
      return { content: "", alignment: "left", dropCap: false }
    case "heading":
      return { text: "", level: 2 }
    case "image":
      return { src: "", caption: "", style: "inline" }
    case "dialogue":
      return { character: "", avatar: "", text: "" }
    case "choice":
      return { options: [] }
    case "divider":
      return { style: "line" }
    case "quote":
      return { content: "", attribution: "" }
    case "scene_break":
      return {}
    default:
      return {}
  }
}

export { useBlockEditor, getDefaultPropsForType }
export type { UseBlockEditorReturn }
