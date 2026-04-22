"use client";

import { WiseEpu } from "@workspace/ui/components/WiseEpu";

/**
 * WiseEpuReader — lazy-loads the chatbot in the cinematic reader context.
 * Kept as a separate client component so the parent reader page can remain
 * a Server Component while still rendering this interactive island.
 */
function WiseEpuReader() {
  return <WiseEpu apiRoute="/api/wise-epu" />;
}

export { WiseEpuReader };
