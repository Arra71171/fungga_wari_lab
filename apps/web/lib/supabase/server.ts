import { createServerClient } from "@supabase/ssr"
import { auth } from "@clerk/nextjs/server"
import { cookies } from "next/headers"
import type { Database } from "@workspace/ui/types/supabase"

export async function createClient() {
  const cookieStore = await cookies()
  // Forward the Clerk session JWT to Supabase so auth.jwt() returns the Clerk token.
  // This allows RLS policies keyed on auth.jwt() ->> 'sub' (which is the Clerk userId).
  const { getToken } = await auth()
  // Gracefully handle missing Clerk JWT template — falls back to anon context
  let clerkToken: string | null = null
  try {
    clerkToken = await getToken({ template: "supabase" })
  } catch {
    // Clerk JWT template "supabase" not configured yet — see README for setup
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: clerkToken
        ? { headers: { Authorization: `Bearer ${clerkToken}` } }
        : undefined,
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — safe to ignore
          }
        },
      },
    }
  )
}
