import { createClient } from "@/lib/supabase/server"

export async function requireUser() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error("Unauthenticated")
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, auth_id, clerk_id, role")
    .eq("auth_id", user.id)
    .single()

  if (profileError || !profile) {
    throw new Error(`Failed to load user profile: ${profileError?.message || 'Profile not found'}`)
  }

  return { supabase, user, profile }
}
