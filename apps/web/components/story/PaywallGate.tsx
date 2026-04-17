import * as React from "react";
import { PaywallOverlay } from "@workspace/ui/components/PaywallOverlay";
import { createCheckoutSession } from "@/actions/paywallActions";
import { StoryReaderProvider } from "./StoryReaderContext";

type PaywallGateProps = {
  slug: string;
  hasAccess: boolean;
  children: React.ReactNode;
};

/**
 * PaywallGate — Server Component wrapper.
 *
 * - hasAccess=true: renders the full reader inside StoryReaderProvider
 * - hasAccess=false: renders the reader in a locked/blurred state with the
 *   PaywallOverlay on top. The overlay calls the createCheckoutSession
 *   server action bound to this story's slug.
 */
export function PaywallGate({ slug, hasAccess, children }: PaywallGateProps) {
  // Bind the slug into the server action so PaywallOverlay doesn't need
  // to know about paywallActions directly.
  const checkoutWithSlug = createCheckoutSession.bind(null, slug);

  if (hasAccess) {
    return (
      <StoryReaderProvider>
        {children}
      </StoryReaderProvider>
    );
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Teaser — blurred, non-interactive reader */}
      <div
        className="pointer-events-none select-none"
        aria-hidden="true"
        style={{ filter: "blur(3px)", opacity: 0.4 }}
      >
        <StoryReaderProvider>
          {children}
        </StoryReaderProvider>
      </div>

      {/* Paywall overlay */}
      <PaywallOverlay
        onUnlock={checkoutWithSlug}
        storySlug={slug}
      />
    </div>
  );
}
