import * as React from "react";

/**
 * Story reader layout — StoryReaderProvider is NOT here.
 * It is provided by PaywallGate in page.tsx to ensure the slug
 * context is set up correctly in all access states.
 */
export default function StoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden bg-cinematic-bg text-cinematic-text font-sans">
      {children}
    </div>
  );
}
