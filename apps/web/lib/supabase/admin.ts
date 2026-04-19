import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/ui/types/supabase";

/**
 * createAdminClient — Supabase client that uses the service role key.
 * ONLY for server-side operations that need to bypass RLS
 * (e.g. Stripe webhook granting lifetime access to any user).
 *
 * ❌ NEVER expose this to the browser or client components.
 * ❌ NEVER use NEXT_PUBLIC_ prefix on SUPABASE_SERVICE_ROLE_KEY.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars"
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
