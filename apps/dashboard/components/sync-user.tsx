"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { syncUserToSupabase } from "@/actions/userActions";

/**
 * SyncUserStore — replaces the Convex-based sync component.
 * On every authenticated session start, upserts the Clerk user
 * into the Supabase `users` table via a Server Action.
 * Idempotent — safe to call on every mount.
 */
export function SyncUserStore() {
  const { isLoaded, isSignedIn, user } = useUser();
  const syncedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id && user.id !== syncedUserId.current) {
      syncedUserId.current = user.id;

      syncUserToSupabase()
        .then(() => {
          toast.success("Identity Verified.", {
            description: "Welcome to the Forge. System sync complete.",
          });
        })
        .catch((error: unknown) => {
          console.error("Failed to sync user with Supabase:", error);
          toast.error("Sync Failure", {
            description: "Database connection failed.",
          });
          // Reset ref so it can retry on next render if needed
          syncedUserId.current = null;
        });
    }
  }, [isLoaded, isSignedIn, user?.id]);

  return null; // Silent component
}
