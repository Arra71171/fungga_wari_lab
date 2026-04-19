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
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id || user.id === syncedUserId.current) {
      return;
    }

    let cancelled = false;

    const attemptSync = () => {
      syncedUserId.current = user.id;

      syncUserToSupabase()
        .then(() => {
          retryCountRef.current = 0;
          toast.success("Identity Verified.", {
            description: "Welcome to the Forge. System sync complete.",
          });
        })
        .catch((error: unknown) => {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown sync failure";
          const shouldRetry =
            errorMessage.includes("Unauthenticated") && retryCountRef.current < 3;

          syncedUserId.current = null;

          if (shouldRetry) {
            retryCountRef.current += 1;
            retryTimeoutRef.current = window.setTimeout(() => {
              if (!cancelled) {
                attemptSync();
              }
            }, 1500);
            return;
          }

          console.error("Failed to sync user with Supabase:", error);
          toast.error("Sync Failure", {
            description: "Database connection failed.",
          });
        });
    };

    attemptSync();

    return () => {
      cancelled = true;
      if (retryTimeoutRef.current !== null) {
        window.clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [isLoaded, isSignedIn, user?.id]);

  return null; // Silent component
}
