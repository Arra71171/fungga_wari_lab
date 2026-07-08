"use client";

import { useEffect } from "react";
import { useSupabaseAuth } from "@workspace/auth/supabase-provider";
import { toast } from "sonner";

export function AuthObserver({ appName = "app" }: { appName?: string }) {
  const { user, isLoaded } = useSupabaseAuth();

  useEffect(() => {
    if (!isLoaded) return;

    const storageKey = `fw_auth_state_${appName}`;
    const prevState = sessionStorage.getItem(storageKey);
    const currentStr = user ? "true" : "false";

    if (currentStr === "true" && prevState === "false") {
      toast.success("Identity Verified", {
        description: "Welcome back.",
      });
    } else if (currentStr === "false" && prevState === "true") {
      toast.info("Session Terminated", {
        description: "You have been logged out.",
      });
    }

    sessionStorage.setItem(storageKey, currentStr);
  }, [user, isLoaded, appName]);

  return null;
}
