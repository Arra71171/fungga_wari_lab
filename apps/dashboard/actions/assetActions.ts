"use server"

import { createClient } from "@/lib/supabase/server"
import type { Database, Json } from "@workspace/ui/types/supabase"
import { requireUser } from "./authHelpers"

type AssetType = Database["public"]["Enums"]["asset_type"]

// ─── Asset Queries ────────────────────────────────────────────────────────────

/**
 * getAllAssets — all assets for the asset library.
 */
export async function getAllAssets(type?: AssetType) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from("assets")
    .select("id, title, url, public_id, type, tags, uploaded_by, story_id, created_at")
    .order("created_at", { ascending: false })

  if (type) {
    query = query.eq("type", type)
  }

  const { data } = await query

  return data ?? []
}

/**
 * getAssetsByStory — assets linked to a specific story.
 */
export async function getAssetsByStory(storyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("assets")
    .select("id, title, url, public_id, type, tags, uploaded_by, created_at")
    .eq("story_id", storyId)
    .order("created_at", { ascending: false })

  return data ?? []
}

/**
 * getAssetStats — count by type for the asset library overview.
 */
export async function getAssetStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase.from("assets").select("type")

  if (!data) return null

  const counts: Record<AssetType, number> = {
    illustration: 0,
    sketch: 0,
    reference_photo: 0,
    audio_lore: 0,
    cover: 0,
  }

  for (const asset of data) {
    counts[asset.type]++
  }

  return counts
}

// ─── Asset Mutations ──────────────────────────────────────────────────────────

/**
 * createAsset — register a Cloudinary-uploaded asset in Supabase.
 * Call AFTER completing the Cloudinary upload.
 */
export async function createAsset(args: {
  title: string
  url: string
  publicId: string
  type: AssetType
  tags?: string[]
  storyId?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthenticated")
  const userId = user.id

  const { data, error } = await supabase
    .from("assets")
    .insert({
      title: args.title,
      url: args.url,
      public_id: args.publicId,
      type: args.type,
      tags: args.tags ?? [],
      uploaded_by: userId,
      story_id: args.storyId ?? null,
    })
    .select("id")
    .single()

  if (error) throw new Error(`Failed to create asset: ${error.message}`)
  return data.id
}

/**
 * updateAsset — patch asset metadata (title, tags, type, story linkage).
 */
export async function updateAsset(
  id: string,
  patch: {
    title?: string
    tags?: string[]
    type?: AssetType
    story_id?: string | null
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthenticated")
  const userId = user.id

  const { error } = await supabase
    .from("assets")
    .update(patch)
    .eq("id", id)
    .eq("uploaded_by", userId)

  if (error) throw new Error(`Failed to update asset: ${error.message}`)
  return id
}

/**
 * deleteAsset — remove asset record from Supabase.
 * NOTE: caller is responsible for also deleting from Cloudinary via the
 * mcp_cloudinary_delete-asset tool or Cloudinary SDK before calling this.
 */
export async function deleteAsset(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthenticated")
  const userId = user.id

  const { error } = await supabase
    .from("assets")
    .delete()
    .eq("id", id)
    .eq("uploaded_by", userId)

  if (error) throw new Error(`Failed to delete asset: ${error.message}`)
  return { success: true }
}

// ─── Global Content (CMS) ─────────────────────────────────────────────────────

/**
 * getGlobalContent — fetch a CMS content block by slug.
 */
export async function getGlobalContent(slug: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from("global_content")
    .select("id, slug, title, tiptap_content, updated_at")
    .eq("slug", slug)
    .single()

  return data
}

/**
 * upsertGlobalContent — create or update a CMS content block (admin only).
 */
export async function upsertGlobalContent(args: {
  slug: string
  title: string
  tiptap_content?: Json
}) {
  const { supabase, profile } = await requireUser()
  
  if (profile.role !== "superadmin" && profile.role !== "admin") {
    throw new Error("Forbidden — only admins and superadmins can update global content")
  }

  const { data, error } = await supabase
    .from("global_content")
    .upsert({
      slug: args.slug,
      title: args.title,
      tiptap_content: args.tiptap_content ?? null,
    }, { onConflict: "slug" })
    .select("id")
    .single()

  if (error) throw new Error(`Failed to upsert global content: ${error.message}`)
  return data.id
}

// ─── Interactions (Analytics) ─────────────────────────────────────────────────

/**
 * trackInteraction — fire-and-forget analytics recording.
 */
export async function trackInteraction(args: {
  storyId: string
  type: Database["public"]["Enums"]["interaction_type"]
  chapterId?: string
  sceneId?: string
  duration?: number
  metadata?: Record<string, unknown>
}) {
  const supabase = await createClient()

  // Get current user if available (optional)
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? null

  await supabase.from("interactions").insert({
    story_id: args.storyId,
    type: args.type,
    chapter_id: args.chapterId ?? null,
    scene_id: args.sceneId ?? null,
    duration: args.duration ?? null,
    metadata: (args.metadata ?? null) as never,
    user_id: userId ?? null,
  })
}

/**
 * getStoryAnalytics — analytics summary for a story (admin only).
 */
export async function getStoryAnalytics(storyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("interactions")
    .select("type, duration")
    .eq("story_id", storyId)

  if (!data) return null

  const views = data.filter((i) => i.type === "view").length
  const reads = data.filter((i) => i.type === "read").length
  const completes = data.filter((i) => i.type === "complete").length
  const dropOffs = data.filter((i) => i.type === "drop_off").length
  const avgDuration =
    data.filter((i) => i.duration).reduce((acc, i) => acc + (i.duration ?? 0), 0) /
    Math.max(data.filter((i) => i.duration).length, 1)

  return { views, reads, completes, dropOffs, avgDuration: Math.round(avgDuration) }
}
