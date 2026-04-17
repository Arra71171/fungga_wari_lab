"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

export function AuthObserver() {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    const prevState = sessionStorage.getItem("fw_auth_state_web");
    const currentStr = isSignedIn ? "true" : "false";

    if (currentStr === "true" && prevState === "false") {
      toast.success("Identity Verified", {
        description: "Welcome to the Archives.",
      });
    } else if (currentStr === "false" && prevState === "true") {
      toast.info("Session Terminated", {
        description: "You have been logged out.",
      });
    }

    sessionStorage.setItem("fw_auth_state_web", currentStr);
  }, [isSignedIn, isLoaded]);

  return null;
}
