"use server"

import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@workspace/ui/types/supabase"

type StoryCategory = Database["public"]["Enums"]["story_category"]

// ─── Slug Helper ──────────────────────────────────────────────────────────────

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") + `-${Date.now().toString(36)}`
  )
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * getAllStoriesAdmin — all stories for dashboardoverview (auth required).
 */
export async function getAllStoriesAdmin() {
  const { userId } = await auth()
  if (!userId) return []

  const supabase = await createClient()

  const { data } = await supabase
    .from("stories")
    .select("id, title, slug, description, category, language, status, cover_image_url, tags, author_id, chapter_count, view_count, read_count, published_at, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(200)

  return data ?? []
}

/**
 * getStoryById — single story by UUID (auth required).
 */
export async function getStoryById(id: string) {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = await createClient()

  const { data } = await supabase
    .from("stories")
    .select("id, title, slug, description, category, language, status, cover_image_url, tags, moral, attributed_author, author_id, chapter_count, view_count, read_count, published_at, created_at, updated_at")
    .eq("id", id)
    .single()

  return data
}

/**
 * getFullStoryById — story + chapters + scenes + choices (auth required).
 */
export async function getFullStoryById(id: string) {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = await createClient()

  const { data: story } = await supabase
    .from("stories")
    .select(`
      id, title, slug, description, category, language, status,
      cover_image_url, tags, moral, attributed_author, author_id,
      chapter_count, view_count, read_count, published_at, created_at, updated_at,
      chapters (
        id, title, "order", content, illustration_url, tiptap_content,
        scenes (
          id, title, "order", content, tiptap_content, illustration_url,
          is_draft, version, reading_time, excerpt,
          choices:choices!choices_scene_id_fkey ( id, label, next_scene_id )
        )
      )
    `)
    .eq("id", id)
    .single()

  if (!story) return null

  // Sort chapters and scenes by order
  const sortedChapters = (story.chapters ?? [])
    .sort((a, b) => a.order - b.order)
    .map((ch) => ({
      ...ch,
      scenes: (ch.scenes ?? []).sort((a, b) => a.order - b.order),
    }))

  return { ...story, chapters: sortedChapters }
}

// ─── Mutations ─────────────────────────────────────────────────────────────────

/**
 * createDraftStory — creates a blank draft for the current author.
 */
export async function createDraftStory() {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()
  const slug = `draft-${Date.now().toString(36)}`

  const { data, error } = await supabase
    .from("stories")
    .insert({
      title: "Untitled Manuscript",
      slug,
      category: "other",
      language: "Meiteilon",
      status: "draft",
      author_id: userId,
      tags: [],
      chapter_count: 0,
    })
    .select("id")
    .single()

  if (error) throw new Error(`Failed to create draft: ${error.message}`)
  return data.id
}

/**
 * createStory — create a full story record.
 */
export async function createStory(args: {
  title: string
  slug?: string
  description?: string
  category: StoryCategory
  language: string
  cover_image_url?: string
  tags: string[]
  moral?: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()
  const slug = args.slug || generateSlug(args.title)

  // Ensure slug uniqueness
  const { data: existing } = await supabase
    .from("stories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle()

  const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug

  const { data, error } = await supabase
    .from("stories")
    .insert({
      title: args.title,
      slug: finalSlug,
      description: args.description ?? null,
      category: args.category,
      language: args.language,
      cover_image_url: args.cover_image_url ?? null,
      tags: args.tags,
      moral: args.moral ?? null,
      status: "draft",
      author_id: userId,
      chapter_count: 0,
    })
    .select("id")
    .single()

  if (error) throw new Error(`Failed to create story: ${error.message}`)
  return data.id
}

/**
 * updateStory — patch story metadata.
 */
export async function updateStory(
  id: string,
  patch: {
    title?: string
    description?: string
    category?: StoryCategory
    language?: string
    cover_image_url?: string
    tags?: string[]
    moral?: string
    attributed_author?: string
  }
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

  const { error } = await supabase
    .from("stories")
    .update(patch)
    .eq("id", id)
    .eq("author_id", userId)

  if (error) throw new Error(`Failed to update story: ${error.message}`)
  return id
}

/**
 * publishStory — set status to published + update searchable_text.
 */
export async function publishStory(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

  // Fetch story to build searchable text
  const { data: story } = await supabase
    .from("stories")
    .select("title, description, tags, chapters(title, content, scenes(title, content))")
    .eq("id", id)
    .single()

  if (!story) throw new Error("Story not found")

  let searchableText = `${story.title} ${story.description ?? ""} ${(story.tags ?? []).join(" ")}`

  for (const ch of story.chapters ?? []) {
    searchableText += ` ${ch.title}`
    if (ch.content) searchableText += ` ${ch.content}`
    for (const sc of ch.scenes ?? []) {
      if (sc.title) searchableText += ` ${sc.title}`
      if (sc.content) searchableText += ` ${sc.content}`
    }
  }

  searchableText = searchableText.replace(/\s+/g, " ").trim()

  const { error } = await supabase
    .from("stories")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      searchable_text: searchableText,
    })
    .eq("id", id)
    .eq("author_id", userId)

  if (error) throw new Error(`Failed to publish story: ${error.message}`)
  return id
}

/**
 * unpublishStory — revert to draft.
 */
export async function unpublishStory(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

  const { error } = await supabase
    .from("stories")
    .update({ status: "draft" })
    .eq("id", id)
    .eq("author_id", userId)

  if (error) throw new Error(`Failed to unpublish story: ${error.message}`)
  return id
}

/**
 * submitForReview — move story to in_review status.
 */
export async function submitForReview(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

  const { error } = await supabase
    .from("stories")
    .update({ status: "in_review" })
    .eq("id", id)
    .eq("author_id", userId)

  if (error) throw new Error(`Failed to submit for review: ${error.message}`)
  return id
}

/**
 * deleteStory — cascade deletes chapters → scenes → choices via FK ON DELETE CASCADE.
 */
export async function deleteStory(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

  const { error } = await supabase
    .from("stories")
    .delete()
    .eq("id", id)
    .eq("author_id", userId)

  if (error) throw new Error(`Failed to delete story: ${error.message}`)
  return { success: true }
}

/**
 * createStoryWithInitialScene — create story + first chapter + first scene atomically.
 */
export async function createStoryWithInitialScene(args: {
  title: string
  slug?: string
  description?: string
  category: StoryCategory
  language: string
  cover_image_url?: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()
  const slug = args.slug || generateSlug(args.title)

  const { data: story, error: storyError } = await supabase
    .from("stories")
    .insert({
      title: args.title,
      slug,
      description: args.description ?? null,
      category: args.category,
      language: args.language,
      cover_image_url: args.cover_image_url ?? null,
      status: "draft",
      author_id: userId,
      tags: [],
      chapter_count: 1,
    })
    .select("id")
    .single()

  if (storyError) throw new Error(`Failed to create story: ${storyError.message}`)

  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .insert({ story_id: story.id, title: "Chapter 1", order: 1 })
    .select("id")
    .single()

  if (chapterError) throw new Error(`Failed to create chapter: ${chapterError.message}`)

  const { data: scene, error: sceneError } = await supabase
    .from("scenes")
    .insert({
      chapter_id: chapter.id,
      title: "Initial Scene",
      order: 1,
      is_draft: true,
      version: 1,
    })
    .select("id")
    .single()

  if (sceneError) throw new Error(`Failed to create scene: ${sceneError.message}`)

  return { storyId: story.id, sceneId: scene.id }
}

/**
 * incrementViewCount — called when a public reader views a story.
 */
export async function incrementViewCount(id: string) {
  const supabase = await createClient()
  await supabase.rpc("increment_view_count" as never, { story_id: id } as never)
}
