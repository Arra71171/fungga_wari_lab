"use server"

import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@workspace/ui/types/supabase"

type BlockType = Database["public"]["Enums"]["block_type"]
type BlockRow = Database["public"]["Tables"]["blocks"]["Row"]

// ─── Block Queries ────────────────────────────────────────────────────────────

/**
 * getBlocksByStoryId — ordered list of blocks for a story.
 */
export async function getBlocksByStoryId(storyId: string) {
  const { userId } = await auth()
  if (!userId) return []

  const supabase = await createClient()

  const { data } = await supabase
    .from("blocks")
    .select("id, story_id, chapter_id, scene_id, type, order, props, created_at, updated_at")
    .eq("story_id", storyId)
    .order("order", { ascending: true })

  return data ?? []
}

// ─── Block Mutations ──────────────────────────────────────────────────────────

/**
 * createBlock — insert a new block into a story.
 */
export async function createBlock(args: {
  storyId: string
  type: BlockType
  order: number
  props?: Record<string, unknown>
  chapterId?: string
  sceneId?: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("blocks")
    .insert({
      story_id: args.storyId,
      chapter_id: args.chapterId ?? null,
      scene_id: args.sceneId ?? null,
      type: args.type,
      order: args.order,
      props: (args.props ?? null) as never,
    })
    .select("id")
    .single()

  if (error) throw new Error(`Failed to create block: ${error.message}`)
  return data.id
}

/**
 * updateBlock — patch block props.
 */
export async function updateBlock(
  id: string,
  props: Record<string, unknown>
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

  const { error } = await supabase
    .from("blocks")
    .update({
      props: props as never,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) throw new Error(`Failed to update block: ${error.message}`)
  return id
}

/**
 * updateBlockOrder — update the order of a single block.
 */
export async function updateBlockOrder(id: string, order: number) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

  const { error } = await supabase
    .from("blocks")
    .update({ order, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw new Error(`Failed to update block order: ${error.message}`)
  return id
}

export async function reorderBlocks(blockIds: string[]) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

  const updates = blockIds.map((id, index) =>
    supabase
      .from("blocks")
      .update({ order: index + 1, updated_at: new Date().toISOString() })
      .eq("id", id)
  )

  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed) throw new Error(`Failed to reorder blocks: ${failed.error?.message}`)

  return { success: true }
}

/**
 * removeBlock — delete a block by ID.
 */
export async function removeBlock(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

  const { error } = await supabase.from("blocks").delete().eq("id", id)
  if (error) throw new Error(`Failed to delete block: ${error.message}`)
  return { success: true }
}
