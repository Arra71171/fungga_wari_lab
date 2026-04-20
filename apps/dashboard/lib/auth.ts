import { createClient } from "@/lib/supabase/server"

/**
 * getAuthUser — returns the authenticated Supabase user or throws.
 * Replaces the old `const { userId } = await auth()` pattern from Clerk.
 */
export async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Unauthenticated")
  }

  return { user, userId: user.id, supabase }
}

/**
 * getAuthUserOrNull — returns the authenticated user or null (no throw).
 * For queries that should return empty results instead of erroring.
 */
export async function getAuthUserOrNull() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, userId: null, supabase }
  }

  return { user, userId: user.id, supabase }
}
