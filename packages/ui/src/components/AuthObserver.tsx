"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

export interface AuthObserverProps {
  appName?: string;
  user: User | null;
  isLoaded: boolean;
}

export function AuthObserver({ appName = "app", user, isLoaded }: AuthObserverProps) {

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
