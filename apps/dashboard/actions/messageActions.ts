"use server"

import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"

// ─── Message Queries ──────────────────────────────────────────────────────────

/**
 * getMessages — paginated list of global team messages (newest first, reversed on display).
 */
export async function getMessages(limit = 50) {
  const { userId } = await auth()
  if (!userId) return []

  const supabase = await createClient()

  const { data } = await supabase
    .from("messages")
    .select(`
      id, content, created_at, author_id,
      users ( id, name, avatar_url, custom_avatar_url )
    `)
    .is("story_id", null)
    .is("task_id", null)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (!data) return []

  // Reverse so oldest renders at top
  return [...data].reverse()
}

// ─── Message Mutations ────────────────────────────────────────────────────────

/**
 * sendMessage — insert a new chat message for the current user.
 */
export async function sendMessage(content: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

  // Resolve the internal user id (Supabase users.id, not Clerk userId)
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single()

  if (!user) throw new Error("User record not found — sync-user may not have run")

  const { data, error } = await supabase
    .from("messages")
    .insert({
      content: content.trim(),
      author_id: user.id,
    })
    .select("id")
    .single()

  if (error) throw new Error(`Failed to send message: ${error.message}`)
  return data.id
}
