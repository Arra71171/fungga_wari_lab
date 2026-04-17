"use server"

import { auth, currentUser } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"

/**
 * syncUserToSupabase — call on every authenticated session start.
 * Upserts the Clerk user into the Supabase users table.
 * Safe to call repeatedly — idempotent via ON CONFLICT.
 */
export async function syncUserToSupabase() {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const user = await currentUser()
  if (!user) throw new Error("User not found")

  const supabase = await createClient()

  const { error } = await supabase.from("users").upsert(
    {
      clerk_id: userId,
      email: user.emailAddresses[0]?.emailAddress ?? null,
      name: user.fullName ?? null,
      avatar_url: user.imageUrl ?? null,
    },
    { onConflict: "clerk_id" }
  )

  if (error) throw new Error(`Failed to sync user: ${error.message}`)
}

/**
 * getSupabaseUser — fetch current user's Supabase record.
 */
export async function getSupabaseUser() {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("users")
    .select("id, clerk_id, name, email, avatar_url, role, alias, bio")
    .eq("clerk_id", userId)
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
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

  const { error } = await supabase
    .from("users")
    .update(patch)
    .eq("clerk_id", userId)

  if (error) throw new Error(`Failed to update profile: ${error.message}`)
}

/**
 * getAllUsers — returns all users (admin only).
 */
export async function getAllUsers() {
  const { userId } = await auth()
  if (!userId) return []

  const supabase = await createClient()

  const { data } = await supabase
    .from("users")
    .select("id, clerk_id, name, email, avatar_url, role, alias")
    .order("created_at", { ascending: false })

  return data ?? []
}

/**
 * updateUserRole — change a user's role (admin only).
 */
export async function updateUserRole(targetClerkId: string, role: "admin" | "editor" | "viewer") {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

  // Verify caller is admin
  const { data: caller } = await supabase
    .from("users")
    .select("role")
    .eq("clerk_id", userId)
    .single()

  if (!caller || caller.role !== "admin") {
    throw new Error("Forbidden — only admins can change roles")
  }

  const { error } = await supabase
    .from("users")
    .update({ role })
    .eq("clerk_id", targetClerkId)

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
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthenticated")

  const supabase = await createClient()

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
export async function getOperativeStats(clerkId: string) {
  const supabase = await createClient()

  const [storiesResult, tasksResult] = await Promise.all([
    supabase
      .from("stories")
      .select("id, chapter_count")
      .eq("author_id", clerkId),
    supabase
      .from("tasks")
      .select("id, status")
      .eq("assignee_id", clerkId),
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
