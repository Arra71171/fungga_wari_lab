"use server"

import { createClient } from "@/lib/supabase/server"

// ─── Message Queries ──────────────────────────────────────────────────────────

/**
 * getMessages — paginated list of global team messages (newest first, reversed on display).
 */
export async function getMessages(limit = 50) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

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
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) throw new Error("Unauthenticated")

  // Resolve the internal user id (Supabase users.id, not auth_id)
  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", authUser.id)
    .single()

  if (!dbUser) throw new Error("User record not found — auth trigger may not have run")

  const { data, error } = await supabase
    .from("messages")
    .insert({
      content: content.trim(),
      author_id: dbUser.id,
    })
    .select("id")
    .single()

  if (error) throw new Error(`Failed to send message: ${error.message}`)
  return data.id
}
