"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * syncUserToSupabase — DEPRECATED.
 * User creation is now handled by the `on_auth_user_created` database trigger.
 * Kept for backward compatibility — no-op.
 */
export async function syncUserToSupabase() {
  // No-op: trigger handles user creation
}

/**
 * getSupabaseUser — fetch current user's Supabase profile record.
 */
export async function getSupabaseUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("users")
    .select("id, auth_id, clerk_id, name, email, avatar_url, role, alias, bio")
    .eq("auth_id", user.id)
    .single()

  if (error) return null
  return data
}

/**
 * getMyProfile — alias for getSupabaseUser (used by OperativeDossier).
 */
export const getMyProfile = getSupabaseUser

/**
 * updateUserProfile — update the operative dossier fields.
 */
export async function updateUserProfile(patch: {
  alias?: string
  bio?: string
  avatar_url?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthenticated")

  const { error } = await supabase
    .from("users")
    .update(patch)
    .eq("auth_id", user.id)

  if (error) throw new Error(`Failed to update profile: ${error.message}`)
}

/**
 * getAllUsers — returns all users (admin only).
 */
export async function getAllUsers() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("users")
    .select("id, auth_id, clerk_id, name, email, avatar_url, role, alias")
    .order("created_at", { ascending: false })

  return data ?? []
}

/**
 * updateUserRole — change a user's role (superadmin only).
 * Uses auth_id to identify target user.
 */
export async function updateUserRole(targetAuthId: string, role: "superadmin" | "editor" | "viewer") {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthenticated")

  // Verify caller is superadmin
  const { data: caller } = await supabase
    .from("users")
    .select("role")
    .eq("auth_id", user.id)
    .single()

  if (!caller || caller.role !== "superadmin") {
    throw new Error("Forbidden — only superadmins can change roles")
  }

  const { error } = await supabase
    .from("users")
    .update({ role })
    .eq("auth_id", targetAuthId)

  if (error) throw new Error(`Failed to update role: ${error.message}`)
}

/**
 * createTeamMember — manually create an unauthenticated team member.
 */
export async function createTeamMember(data: {
  name: string
  email?: string
  phone?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthenticated")

  const { data: member, error } = await supabase
    .from("users")
    .insert({
      name: data.name,
      email: data.email ?? null,
      phone: data.phone ?? null,
      role: "editor",
    })
    .select("id")
    .single()

  if (error) throw new Error(`Failed to create team member: ${error.message}`)
  return member
}

/**
 * getOperativeStats — aggregate task completion and lore authored counts.
 */
export async function getOperativeStats(authId: string) {
  const supabase = await createClient()

  const [storiesResult, tasksResult] = await Promise.all([
    supabase
      .from("stories")
      .select("id, chapter_count")
      .eq("author_id", authId),
    supabase
      .from("tasks")
      .select("id, status")
      .eq("assignee_id", authId),
  ])

  const stories = storiesResult.data ?? []
  const tasks = tasksResult.data ?? []

  const missionsCompleted = tasks.filter((t) => t.status === "done").length
  const chaptersAuthored = stories.reduce((acc, s) => acc + (s.chapter_count ?? 0), 0)

  return {
    missionsCompleted,
    loreAuthored: chaptersAuthored || stories.length,
  }
}
