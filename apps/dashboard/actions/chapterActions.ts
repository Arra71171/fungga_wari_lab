"use server"

import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@workspace/ui/types/supabase"

type ChapterRow = Database["public"]["Tables"]["chapters"]["Row"]
type SceneRow = Database["public"]["Tables"]["scenes"]["Row"]

// ─── Chapters ─────────────────────────────────────────────────────────────────

/**
 * getChaptersByStory — ordered list of chapters for a story.
 */
export async function getChaptersByStory(storyId: string) {
  const { userId } = await auth()
  if (!userId) return []

  const supabase = await createClient()

  const { data } = await supabase
    .from("chapters")
    .select("id, story_id, title, \"order\", illustration_url, created_at, updated_at")
    .eq("story_id", storyId)
    .order("order", { ascending: true })

  return data ?? []
}

/**
 * createChapter — add a chapter to a story.
 */
export async function createChapter(args: {
  storyId: string
  title: string
  order: number
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

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

  // Increment chapter_count on story
  await supabase.rpc("increment_chapter_count" as never, { story_id: args.storyId } as never)

  return data.id
}

/**
 * updateChapter — patch chapter fields.
 */
export async function updateChapter(
  id: string,
  patch: Partial<Pick<ChapterRow, "title" | "order" | "illustration_url" | "content" | "tiptap_content">>
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

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
export async function deleteChapter(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

  // Get story_id before deletion for count decrement
  const { data: chapter } = await supabase
    .from("chapters")
    .select("story_id")
    .eq("id", id)
    .single()

  const { error } = await supabase.from("chapters").delete().eq("id", id)
  if (error) throw new Error(`Failed to delete chapter: ${error.message}`)

  if (chapter?.story_id) {
    await supabase.rpc("decrement_chapter_count" as never, { story_id: chapter.story_id } as never)
  }

  return { success: true }
}

// ─── Scenes ──────────────────────────────────────────────────────────────────

/**
 * getScenesByChapter — ordered list of scenes for a chapter.
 */
export async function getScenesByChapter(chapterId: string) {
  const { userId } = await auth()
  if (!userId) return []

  const supabase = await createClient()

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
export async function getSceneById(id: string) {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = await createClient()

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
export async function createScene(args: {
  chapterId: string
  title?: string
  order: number
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

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
  id: string,
  args: {
    content?: string
    tiptap_content?: Record<string, unknown>
    reading_time?: number
    excerpt?: string
    title?: string
  }
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

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
  id: string,
  patch: Partial<Pick<SceneRow, "title" | "order" | "illustration_url" | "is_draft">>
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

  const { error } = await supabase.from("scenes").update(patch).eq("id", id)
  if (error) throw new Error(`Failed to update scene: ${error.message}`)
  return id
}

/**
 * publishScene — mark scene as non-draft + increment version.
 */
export async function publishScene(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

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
export async function deleteScene(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

  const { error } = await supabase.from("scenes").delete().eq("id", id)
  if (error) throw new Error(`Failed to delete scene: ${error.message}`)
  return { success: true }
}

// ─── Choices ─────────────────────────────────────────────────────────────────

/**
 * addChoice — add interactive choice to a scene.
 */
export async function addChoice(args: {
  sceneId: string
  label: string
  nextSceneId: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

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
export async function deleteChoice(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

  const { error } = await supabase.from("choices").delete().eq("id", id)
  if (error) throw new Error(`Failed to delete choice: ${error.message}`)
  return { success: true }
}
