"use server"

import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import type { Database } from "@workspace/ui/types/supabase"

type BlockType = Database["public"]["Enums"]["block_type"]


// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const blockTypeSchema = z.enum(["text", "heading", "image", "dialogue", "audio", "choice", "divider", "quote", "scene_break"])

const createBlockSchema = z.object({
  storyId: z.string().uuid(),
  type: blockTypeSchema,
  order: z.number().int().min(1),
  props: z.any().optional(),
  chapterId: z.string().uuid().optional(),
  sceneId: z.string().uuid().optional()
})

// ─── Block Queries ────────────────────────────────────────────────────────────

/**
 * getBlocksByStoryId — ordered list of blocks for a story.
 */
export async function getBlocksByStoryId(rawStoryId: string) {
  const storyId = z.string().uuid().parse(rawStoryId)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

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
export async function createBlock(rawArgs: z.infer<typeof createBlockSchema>) {
  const args = createBlockSchema.parse(rawArgs)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthenticated")

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
  rawId: string,
  rawProps: Record<string, unknown>
) {
  const id = z.string().uuid().parse(rawId)
  const props = z.record(z.any()).parse(rawProps)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthenticated")

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
export async function updateBlockOrder(rawId: string, rawOrder: number) {
  const id = z.string().uuid().parse(rawId)
  const order = z.number().int().min(1).parse(rawOrder)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthenticated")

  const { error } = await supabase
    .from("blocks")
    .update({ order, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw new Error(`Failed to update block order: ${error.message}`)
  return id
}

export async function reorderBlocks(rawBlockIds: string[]) {
  const blockIds = z.array(z.string().uuid()).parse(rawBlockIds)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthenticated")

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
export async function removeBlock(rawId: string) {
  const id = z.string().uuid().parse(rawId)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthenticated")

  const { error } = await supabase.from("blocks").delete().eq("id", id)
  if (error) throw new Error(`Failed to delete block: ${error.message}`)
  return { success: true }
}
