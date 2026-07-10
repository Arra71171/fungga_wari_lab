import * as React from "react";
import { PaywallOverlay } from "@workspace/ui/components/PaywallOverlay";
import { StoryReaderProvider, type StoryShape } from "./StoryReaderContext";

type PaywallGateProps = {
  slug: string;
  hasAccess: boolean;
  initialStory?: StoryShape;
  children: React.ReactNode;
};


/**
 * PaywallGate — Server Component wrapper.
 *
 * - hasAccess=true: renders the full reader inside StoryReaderProvider
 * - hasAccess=false: renders the reader in a locked/blurred state with the
 *   PaywallOverlay on top.
 */
export function PaywallGate({ slug, hasAccess, initialStory, children }: PaywallGateProps) {
  if (hasAccess) {
    return (
      <StoryReaderProvider initialStory={initialStory}>
        {children}
      </StoryReaderProvider>
    );
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Teaser — blurred, non-interactive reader */}
      <div
        className="pointer-events-none select-none blur-sm opacity-40"
        aria-hidden="true"
      >
        <StoryReaderProvider initialStory={initialStory}>
          {children}
        </StoryReaderProvider>
      </div>

      {/* Paywall overlay */}
      <React.Suspense fallback={
        <div className="absolute inset-0 z-30 bg-cinematic-bg/80 backdrop-blur-sm flex flex-col items-center justify-center">
           <div className="size-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
           <p className="text-sm font-mono text-muted-foreground mt-4 animate-pulse">Loading archive protocol...</p>
        </div>
      }>
        <PaywallOverlay />
      </React.Suspense>
    </div>
  );
}
