"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function SyncUserStore() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  
  const syncUser = useMutation(api.users.syncUser);
  const syncedUserId = useRef<string | null>(null);

  useEffect(() => {
    // Only attempt sync if we are authenticated on both Clerk and Convex,
    // and if we haven't already synced this specific user in this session.
    if (isLoaded && isSignedIn && isAuthenticated && user?.id !== syncedUserId.current) {
      syncedUserId.current = user.id;

      syncUser().catch((error) => {
        console.error("Failed to sync user with Convex:", error);
        // Reset ref so it can retry if needed
        syncedUserId.current = null;
      });
    }
  }, [isLoaded, isSignedIn, isAuthenticated, user?.id, syncUser]);

  return null; // Silent component
}
