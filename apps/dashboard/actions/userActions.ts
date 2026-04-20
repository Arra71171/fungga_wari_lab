"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"

const updateUserProfileSchema = z.object({
  alias: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
  avatar_url: z.string().url().max(1000).optional(),
})

const updateUserRoleSchema = z.object({
  targetAuthId: z.string().uuid(),
  role: z.enum(["superadmin", "admin", "editor", "viewer"]),
})

const deleteUserAccountSchema = z.object({
  targetUserId: z.string().min(1),
})

const createTeamMemberSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
})

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
  const parsed = updateUserProfileSchema.safeParse(patch)
  if (!parsed.success) {
    throw new Error(`Validation error: ${parsed.error.message}`)
  }
  const validatedPatch = parsed.data

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthenticated")

  const { error } = await supabase
    .from("users")
    .update(validatedPatch)
    .eq("auth_id", user.id)

  if (error) throw new Error(`Failed to update profile: ${error.message}`)
}

/**
 * getAllUsers — returns all users (admin only).
 */
export async function getAllUsers() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw new Error(`Failed to verify user: ${userError.message}`)
  if (!user) return []

  // Enforce admin-only access
  const { data: caller, error: callerError } = await supabase
    .from("users")
    .select("role")
    .eq("auth_id", user.id)
    .single()

  if (callerError) throw new Error(`Failed to verify permissions: ${callerError.message}`)
  if (caller?.role !== "superadmin" && caller?.role !== "admin") {
    throw new Error("Forbidden — only admins and superadmins can view users")
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, auth_id, clerk_id, name, email, avatar_url, role, alias")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) throw new Error(`Failed to fetch users: ${error.message}`)
  return data ?? []
}

/**
 * updateUserRole — change a user's role (superadmin only).
 * Uses auth_id to identify target user.
 */
export async function updateUserRole(targetAuthId: string, role: "superadmin" | "admin" | "editor" | "viewer") {
  const parsed = updateUserRoleSchema.safeParse({ targetAuthId, role })
  if (!parsed.success) {
    throw new Error(`Validation error: ${parsed.error.message}`)
  }
  const { targetAuthId: validAuthId, role: validRole } = parsed.data

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthenticated")

  // Verify caller is superadmin
  const { data: caller } = await supabase
    .from("users")
    .select("role")
    .eq("auth_id", user.id)
    .single()

  if (!caller || !caller.role || !["superadmin", "admin"].includes(caller.role)) {
    throw new Error("Forbidden — only admins and superadmins can change roles")
  }

  // Fetch target user's current role
  const { data: target } = await supabase
    .from("users")
    .select("role")
    .eq("auth_id", validAuthId)
    .single()

  if (!target) throw new Error("Target user not found")

  // Admins cannot modify superadmins
  if (caller.role === "admin" && target.role === "superadmin") {
    throw new Error("Admins cannot modify superadmin roles")
  }

  // Admins cannot grant superadmin privileges
  if (caller.role === "admin" && validRole === "superadmin") {
    throw new Error("Admins cannot grant superadmin privileges")
  }

  const { error } = await supabase
    .from("users")
    .update({ role: validRole })
    .eq("auth_id", validAuthId)

  if (error) throw new Error(`Failed to update role: ${error.message}`)
}

/**
 * deleteUserAccount — delete a user account (superadmin only).
 * Target user must be specified by their public.users.id.
 */
export async function deleteUserAccount(targetUserId: string) {
  const parsed = deleteUserAccountSchema.safeParse({ targetUserId })
  if (!parsed.success) {
    throw new Error(`Validation error: ${parsed.error.message}`)
  }
  const validTargetUserId = parsed.data.targetUserId

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthenticated")

  // Verify caller is superadmin
  const { data: caller } = await supabase
    .from("users")
    .select("role")
    .eq("auth_id", user.id)
    .single()

  if (!caller || !caller.role || !["superadmin", "admin"].includes(caller.role)) {
    throw new Error("Forbidden — only admins and superadmins can delete users")
  }

  const { data: target } = await supabase
    .from("users")
    .select("auth_id, role")
    .eq("id", validTargetUserId)
    .single()

  if (!target) {
    throw new Error("Target user not found")
  }

  if (target.role === "superadmin") {
    throw new Error("Cannot delete a superadmin")
  }



  if (target.auth_id === user.id) {
    throw new Error("Self-deletion is not permitted here")
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    console.error("[deleteUserAccount] SUPABASE_SERVICE_ROLE_KEY is not configured")
    throw new Error("Server configuration error: missing service role key")
  }

  // Use service role client to bypass RLS and use Admin API
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  )

  if (target.auth_id) {
    // Delete from auth.users, which cascades to public.users
    const { error } = await supabaseAdmin.auth.admin.deleteUser(target.auth_id)
    if (error) throw new Error(`Failed to delete user auth: ${error.message}`)
  } else {
    // Legacy user with no auth_id, delete directly from public.users
    const { error } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", validTargetUserId)
    if (error) throw new Error(`Failed to delete legacy user: ${error.message}`)
  }

  return { success: true }
}

/**
 * createTeamMember — manually create an unauthenticated team member.
 */
export async function createTeamMember(data: {
  name: string
  email?: string
  phone?: string
}) {
  const parsed = createTeamMemberSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(`Validation error: ${parsed.error.message}`)
  }
  const validData = parsed.data

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthenticated")

  // Only superadmins can create team members
  const { data: caller, error: callerError } = await supabase
    .from("users")
    .select("role")
    .eq("auth_id", user.id)
    .single()

  if (callerError) throw new Error(`Failed to verify permissions: ${callerError.message}`)
  if (caller?.role !== "superadmin") {
    throw new Error("Forbidden — only superadmins can create team members")
  }

  const { data: member, error } = await supabase
    .from("users")
    .insert({
      name: validData.name,
      email: validData.email ?? null,
      phone: validData.phone ?? null,
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

  // Resolve internal users.id and legacy clerk_id for identity migration bridging
  // stories.author_id and tasks.assignee_id may hold either format during transition
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, clerk_id")
    .eq("auth_id", authId)
    .single()

  if (profileError) throw new Error(`Failed to load operative identity: ${profileError.message}`)

  // Use both the internal numeric id and the legacy clerk_id to catch migrated rows
  const identityIds = [String(profile.id), profile.clerk_id].filter((id): id is string => Boolean(id))

  const [storiesResult, tasksResult] = await Promise.all([
    supabase
      .from("stories")
      .select("id, chapter_count")
      .in("author_id", identityIds),
    supabase
      .from("tasks")
      .select("id, status")
      .in("assignee_id", identityIds),
  ])

  if (storiesResult.error) throw new Error(`Failed to load stories: ${storiesResult.error.message}`)
  if (tasksResult.error) throw new Error(`Failed to load tasks: ${tasksResult.error.message}`)

  const stories = storiesResult.data ?? []
  const tasks = tasksResult.data ?? []

  const missionsCompleted = tasks.filter((t) => t.status === "done").length
  const chaptersAuthored = stories.reduce((acc, s) => acc + (s.chapter_count ?? 0), 0)

  return {
    missionsCompleted,
    loreAuthored: chaptersAuthored || stories.length,
  }
}
