"use client";

/**
 * SyncUserStore — DEPRECATED.
 * 
 * This component was used with Clerk to upsert user data into Supabase
 * on each session start. With Supabase Auth, user syncing is handled
 * automatically by the `on_auth_user_created` database trigger.
 * 
 * Kept as a no-op export to avoid import errors in other files during
 * the migration. Safe to delete once all references are removed.
 */
export function SyncUserStore() {
  return null;
}
