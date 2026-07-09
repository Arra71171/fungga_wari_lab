"use server"

import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import type { Database } from "@workspace/ui/types/supabase"

type ChapterRow = Database["public"]["Tables"]["chapters"]["Row"]
type SceneRow = Database["public"]["Tables"]["scenes"]["Row"]


// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const createChapterSchema = z.object({
  storyId: z.string().uuid(),
  title: z.string().min(1).max(255),
  order: z.number().int().min(1)
})

const updateChapterPatchSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  order: z.number().int().min(1).optional(),
  illustration_url: z.string().url().optional().nullable().or(z.literal("")),
  audio_url: z.string().url().optional().nullable().or(z.literal("")),
  content: z.string().optional().nullable(),
  tiptap_content: z.any().optional().nullable()
})

const createSceneSchema = z.object({
  chapterId: z.string().uuid(),
  title: z.string().max(255).optional(),
  order: z.number().int().min(1)
})

const updateSceneContentSchema = z.object({
  content: z.string().optional(),
  tiptap_content: z.any().optional(),
  reading_time: z.number().int().min(0).optional(),
  excerpt: z.string().max(1000).optional(),
  title: z.string().max(255).optional()
})

const updateScenePatchSchema = z.object({
  title: z.string().min(1).max(255).optional().nullable(),
  order: z.number().int().min(1).optional(),
  illustration_url: z.string().url().optional().nullable().or(z.literal("")),
  is_draft: z.boolean().optional()
})

const addChoiceSchema = z.object({
  sceneId: z.string().uuid(),
  label: z.string().min(1).max(255),
  nextSceneId: z.string().uuid()
})

// ─── Chapters ─────────────────────────────────────────────────────────────────

/**
 * getChaptersByStory — ordered list of chapters for a story.
 */
export async function getChaptersByStory(rawStoryId: string) {
  const storyId = z.string().uuid().parse(rawStoryId)
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return []

  const { data } = await supabase
    .from("chapters")
    .select("id, story_id, title, \"order\", illustration_url, audio_url, created_at, updated_at")
    .eq("story_id", storyId)
    .order("order", { ascending: true })

  return data ?? []
}

/**
 * createChapter — add a chapter to a story.
 */
export async function createChapter(rawArgs: z.infer<typeof createChapterSchema>) {
  const args = createChapterSchema.parse(rawArgs)
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Unauthenticated")

  const { data, error } = await supabase
    .from("chapters")
    .insert({
      story_id: args.storyId,
      title: args.title,
      order: args.order,
    })
    .select("id")
    .single()

  if (error) throw new Error(`Failed to create chapter: ${error.message}`)

  const { data: scene, error: sceneError } = await supabase
    .from("scenes")
    .insert({
      chapter_id: data.id,
      title: args.title,
      order: 1,
      is_draft: true,
      version: 1,
    })
    .select("id")
    .single()

  if (sceneError) {
    await supabase.from("chapters").delete().eq("id", data.id)
    throw new Error(`Failed to create initial scene: ${sceneError.message}`)
  }

  // Increment chapter_count on story
  await supabase.rpc("increment_chapter_count", { story_id: args.storyId })

  return { chapterId: data.id, sceneId: scene.id }
}

/**
 * updateChapter — patch chapter fields.
 */
export async function updateChapter(
  rawId: string,
  rawPatch: z.infer<typeof updateChapterPatchSchema>
) {
  const id = z.string().uuid().parse(rawId)
  const patch = updateChapterPatchSchema.parse(rawPatch)
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Unauthenticated")

  const { error } = await supabase
    .from("chapters")
    .update(patch)
    .eq("id", id)

  if (error) throw new Error(`Failed to update chapter: ${error.message}`)
  return id
}

/**
 * deleteChapter — deletes chapter + cascades scenes/choices via FK.
 */
export async function deleteChapter(rawId: string) {
  const id = z.string().uuid().parse(rawId)
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Unauthenticated")

  // Get story_id before deletion for count decrement
  const { data: chapter } = await supabase
    .from("chapters")
    .select("story_id")
    .eq("id", id)
    .single()

  const { error } = await supabase.from("chapters").delete().eq("id", id)
  if (error) throw new Error(`Failed to delete chapter: ${error.message}`)

  if (chapter?.story_id) {
    await supabase.rpc("decrement_chapter_count", { story_id: chapter.story_id })
  }

  return { success: true }
}

// ─── Scenes ──────────────────────────────────────────────────────────────────

/**
 * getScenesByChapter — ordered list of scenes for a chapter.
 */
export async function getScenesByChapter(rawChapterId: string) {
  const chapterId = z.string().uuid().parse(rawChapterId)
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return []

  const { data } = await supabase
    .from("scenes")
    .select("id, chapter_id, title, \"order\", is_draft, version, reading_time, excerpt, illustration_url, created_at, updated_at")
    .eq("chapter_id", chapterId)
    .order("order", { ascending: true })

  return data ?? []
}

/**
 * getSceneById — single scene with content + choices.
 */
export async function getSceneById(rawId: string) {
  const id = z.string().uuid().parse(rawId)
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return null

  const { data } = await supabase
    .from("scenes")
    .select(`
      id, chapter_id, title, "order", content, tiptap_content,
      is_draft, version, reading_time, excerpt, illustration_url,
      created_at, updated_at,
      choices ( id, label, next_scene_id )
    `)
    .eq("id", id)
    .single()

  return data
}

/**
 * createScene — add a scene to a chapter.
 */
export async function createScene(rawArgs: z.infer<typeof createSceneSchema>) {
  const args = createSceneSchema.parse(rawArgs)
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Unauthenticated")

  const { data, error } = await supabase
    .from("scenes")
    .insert({
      chapter_id: args.chapterId,
      title: args.title ?? null,
      order: args.order,
      is_draft: true,
      version: 1,
    })
    .select("id")
    .single()

  if (error) throw new Error(`Failed to create scene: ${error.message}`)
  return data.id
}

/**
 * updateSceneContent — save TipTap editor content + auto-extract excerpt.
 */
export async function updateSceneContent(
  rawId: string,
  rawArgs: z.infer<typeof updateSceneContentSchema>
) {
  const id = z.string().uuid().parse(rawId)
  const args = updateSceneContentSchema.parse(rawArgs)
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Unauthenticated")

  const patch: Partial<SceneRow> = {}
  if (args.content !== undefined) patch.content = args.content
  if (args.tiptap_content !== undefined) patch.tiptap_content = args.tiptap_content as never
  if (args.reading_time !== undefined) patch.reading_time = args.reading_time
  if (args.excerpt !== undefined) patch.excerpt = args.excerpt
  if (args.title !== undefined) patch.title = args.title

  const { error } = await supabase.from("scenes").update(patch).eq("id", id)
  if (error) throw new Error(`Failed to update scene content: ${error.message}`)
  return id
}

/**
 * updateScene — patch scene metadata.
 */
export async function updateScene(
  rawId: string,
  rawPatch: z.infer<typeof updateScenePatchSchema>
) {
  const id = z.string().uuid().parse(rawId)
  const patch = updateScenePatchSchema.parse(rawPatch)
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Unauthenticated")

  const { error } = await supabase.from("scenes").update(patch).eq("id", id)
  if (error) throw new Error(`Failed to update scene: ${error.message}`)
  return id
}

/**
 * publishScene — mark scene as non-draft + increment version.
 */
export async function publishScene(rawId: string) {
  const id = z.string().uuid().parse(rawId)
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Unauthenticated")

  // Get current version
  const { data: scene } = await supabase
    .from("scenes")
    .select("version")
    .eq("id", id)
    .single()

  const { error } = await supabase
    .from("scenes")
    .update({ is_draft: false, version: (scene?.version ?? 1) + 1 })
    .eq("id", id)

  if (error) throw new Error(`Failed to publish scene: ${error.message}`)
  return id
}

/**
 * deleteScene — cascades choices via FK ON DELETE CASCADE.
 */
export async function deleteScene(rawId: string) {
  const id = z.string().uuid().parse(rawId)
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Unauthenticated")

  const { error } = await supabase.from("scenes").delete().eq("id", id)
  if (error) throw new Error(`Failed to delete scene: ${error.message}`)
  return { success: true }
}

// ─── Choices ─────────────────────────────────────────────────────────────────

/**
 * addChoice — add interactive choice to a scene.
 */
export async function addChoice(rawArgs: z.infer<typeof addChoiceSchema>) {
  const args = addChoiceSchema.parse(rawArgs)
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Unauthenticated")

  const { data, error } = await supabase
    .from("choices")
    .insert({
      scene_id: args.sceneId,
      label: args.label,
      next_scene_id: args.nextSceneId,
    })
    .select("id")
    .single()

  if (error) throw new Error(`Failed to add choice: ${error.message}`)
  return data.id
}

/**
 * deleteChoice — remove a branching choice.
 */
export async function deleteChoice(rawId: string) {
  const id = z.string().uuid().parse(rawId)
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Unauthenticated")

  const { error } = await supabase.from("choices").delete().eq("id", id)
  if (error) throw new Error(`Failed to delete choice: ${error.message}`)
  return { success: true }
}
