"use client";

import { useEffect } from "react";
import { useSupabaseAuth } from "@workspace/auth/supabase-provider";
import { toast } from "sonner";

export function AuthObserver() {
  const { user, isLoaded } = useSupabaseAuth();

  useEffect(() => {
    if (!isLoaded) return;

    const prevState = sessionStorage.getItem("fw_auth_state");
    const currentStr = user?.id ? "true" : "false";

    if (currentStr === "true" && prevState === "false") {
      toast.success("Identity Verified", {
        description: "Access granted to the Creator Studio.",
      });
    } else if (currentStr === "false" && prevState === "true") {
      toast.info("Session Terminated", {
        description: "You have been logged out.",
      });
    }

    sessionStorage.setItem("fw_auth_state", currentStr);
  }, [user?.id, isLoaded]);

  return null;
}
