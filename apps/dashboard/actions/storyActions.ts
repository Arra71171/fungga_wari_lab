"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@workspace/ui/types/supabase"
import { requireUser } from "./authHelpers"
import { revalidatePath } from "next/cache"

type StoryCategory = Database["public"]["Enums"]["story_category"]

// ─── Slug Helpers ─────────────────────────────────────────────────────────────

/** Generate a draft slug with a random suffix (used at creation time). */
function generateDraftSlug(): string {
  return `draft-${Date.now().toString(36)}`
}

/**
 * generatePublishSlug — produce a clean, URL-safe slug from a story title.
 * Appends a short random suffix only if the base slug is already taken.
 */
async function generatePublishSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  title: string,
  currentId: string
): Promise<string> {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

  const { data: conflict } = await supabase
    .from("stories")
    .select("id")
    .eq("slug", base)
    .neq("id", currentId)
    .maybeSingle()

  return conflict ? `${base}-${Date.now().toString(36)}` : base
}

/** Legacy helper kept for createStory (explicit slug arg). */
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
 * getAllStoriesAdmin — all stories for dashboard overview (auth required).
 * RLS: stories_select_public policy allows author to see their own drafts.
 */
export async function getAllStoriesAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id
  if (!userId) return []

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id
  if (!userId) return null

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
  console.log(`[getFullStoryById] Called with id: ${id}`)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id
  
  if (!userId) return null

  const { data: story, error } = await supabase
    .from("stories")
    .select(`
      id, title, slug, description, category, language, status,
      cover_image_url, tags, moral, attributed_author, author_id,
      chapter_count, view_count, read_count, published_at, created_at, updated_at,
      chapters (
        id, title, "order", content, illustration_url, audio_url, tiptap_content,
        scenes (
          id, title, "order", content, tiptap_content, illustration_url,
          is_draft, version, reading_time, excerpt,
          choices:choices!choices_scene_id_fkey ( id, label, next_scene_id )
        )
      )
    `)
    .eq("id", id)
    .single()

  if (error || !story) return null

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
  const { supabase, user } = await requireUser()
  const authorId = user.id
  if (!authorId) throw new Error("Cannot resolve author identity")

  // stories.author_id stores the auth userId directly.
  const slug = generateDraftSlug()

  const { data, error } = await supabase
    .from("stories")
    .insert({
      title: "Untitled Manuscript",
      slug,
      category: "other",
      language: "Meiteilon",
      status: "draft",
      author_id: authorId,
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
  const { supabase, user } = await requireUser()
  const authorId = user.id
  if (!authorId) throw new Error("Cannot resolve author identity")

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
      author_id: authorId,
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
  const { supabase, user } = await requireUser()

  const { error } = await supabase
    .from("stories")
    .update(patch)
    .eq("id", id)
    .eq("author_id", user.id)

  if (error) throw new Error(`Failed to update story: ${error.message}`)

  revalidatePath("/")
  revalidatePath("/stories")
  revalidatePath(`/stories/draft/${id}`)
  
  return id
}

/**
 * publishStory — set status to published + update searchable_text.
 */
export async function publishStory(id: string) {
  const { supabase, user } = await requireUser()

  // Fetch story to build searchable text + get current slug for update
  const { data: story } = await supabase
    .from("stories")
    .select("title, slug, description, tags, chapters(title, content, scenes(title, content))")
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

  // Generate a clean slug from the title if still has draft- prefix
  const needsCleanSlug = story.slug?.startsWith("draft-")
  const cleanSlug = needsCleanSlug
    ? await generatePublishSlug(supabase, story.title, id)
    : story.slug

  const { error } = await supabase
    .from("stories")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      searchable_text: searchableText,
      ...(needsCleanSlug ? { slug: cleanSlug } : {}),
    })
    .eq("id", id)
    .eq("author_id", user.id)

  if (error) throw new Error(`Failed to publish story: ${error.message}`)
  return { id, slug: cleanSlug }
}

/**
 * unpublishStory — revert to draft.
 */
export async function unpublishStory(id: string) {
  const { supabase, user } = await requireUser()

  const { error } = await supabase
    .from("stories")
    .update({ status: "draft" })
    .eq("id", id)
    .eq("author_id", user.id)

  if (error) throw new Error(`Failed to unpublish story: ${error.message}`)
  return id
}

/**
 * submitForReview — move story to in_review status.
 */
export async function submitForReview(id: string) {
  const { supabase, user } = await requireUser()

  const { error } = await supabase
    .from("stories")
    .update({ status: "in_review" })
    .eq("id", id)
    .eq("author_id", user.id)

  if (error) throw new Error(`Failed to submit for review: ${error.message}`)
  return id
}

/**
 * deleteStory — cascade deletes chapters → scenes → choices via FK ON DELETE CASCADE.
 * Uses service role to bypass RLS for administrative delete.
 */
export async function deleteStory(id: string) {
  try {
    const { supabase, user, profile } = await requireUser()

    // Admins/superadmins can delete any story.
    // Authors can only delete their own stories.
    const isAdmin = profile.role === "superadmin" || profile.role === "admin"

    if (!isAdmin) {
      const { data: story, error: authError } = await supabase
        .from("stories")
        .select("id, author_id")
        .eq("id", id)
        .single()

      if (authError || !story) {
        return { success: false, error: `Story not found or unauthorized: ${authError?.message}` }
      }

      if (story.author_id !== user.id) {
        return { success: false, error: "Unauthorized: You do not have permission to delete this story" }
      }
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      console.error("[deleteStory] SUPABASE_SERVICE_ROLE_KEY is not configured")
      return { success: false, error: "Server configuration error: missing service role key" }
    }

    // Use service role client to bypass RLS for the cascade delete.
    // FK ON DELETE CASCADE handles chapters → scenes → choices automatically.
    const supabaseAdmin = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )

    const { error } = await supabaseAdmin
      .from("stories")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(`[deleteStory] Delete failed: ${error.message}`)
      return { success: false, error: `Delete failed: ${error.message}` }
    }

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[deleteStory] Unexpected error:", message)
    return { success: false, error: `Delete failed: ${message}` }
  }
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
  const { supabase, user } = await requireUser()
  const authorId = user.id
  if (!authorId) throw new Error("Cannot resolve author identity")

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
      author_id: authorId,
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
  await supabase.rpc("increment_view_count", { story_id: id })
}
