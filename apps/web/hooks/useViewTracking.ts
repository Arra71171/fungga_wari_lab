"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * useViewTracking — fires a single "view" interaction when a story page mounts.
 * De-duplicates: tracks only once per session per slug via sessionStorage.
 */
export function useViewTracking(storyId: string | undefined) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (!storyId || hasFired.current) return;

    // Session-level dedup
    const sessionKey = `fungga-viewed-${storyId}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(sessionKey)) {
      return;
    }

    hasFired.current = true;

    // Capture as a narrowed local variable so TS knows it's a string
    const resolvedId = storyId;

    async function recordView() {
      const supabase = createClient();
      await supabase.from("interactions").insert({
        story_id: resolvedId,
        type: "view",
      });
    }

    recordView().catch(() => {
      // Silently fail — analytics should never break the reader
    });

    if (typeof window !== "undefined") {
      sessionStorage.setItem(sessionKey, "1");
    }
  }, [storyId]);
}
