"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Flame, Lock, Sparkles, BookOpen } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

type PaywallOverlayProps = {
  /** Bound server action — call with createCheckoutSession.bind(null, slug) */
  onUnlock: (formData: FormData) => void | Promise<void>;
  /** Story slug, passed as hidden input for reference */
  storySlug?: string;
  className?: string;
};

const FEATURES = [
  { icon: BookOpen, label: "Full archive access", detail: "Every story, every chapter — unlocked forever" },
  { icon: Sparkles, label: "All future stories", detail: "New manuscripts added at no extra cost" },
  { icon: Flame, label: "Immersive cinematic reader", detail: "Ambient audio, focus modes & scene search" },
];

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="Unlock lifetime access for ₹899"
      className={cn(
        "w-full h-14 flex items-center justify-center gap-3",
        "border border-primary bg-primary text-primary-foreground",
        "font-mono text-sm uppercase tracking-widest font-bold",
        "transition-all duration-200",
        "hover:bg-primary/90 hover:shadow-brutal",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:opacity-60 disabled:cursor-not-allowed shadow-xl"
      )}
    >
      {pending ? (
        <>
          <span
            className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"
            aria-hidden="true"
          />
          Redirecting to checkout…
        </>
      ) : (
        <>
          <Flame className="size-4 drop-shadow-sm" aria-hidden="true" />
          Unlock Lifetime Access — ₹899
        </>
      )}
    </button>
  );
}

/**
 * PaywallOverlay — Zen Brutalist paywall gate.
 * Renders a gradient overlay over teaser content with a Stripe checkout CTA.
 *
 * Usage: pass a bound server action as `onUnlock`.
 * @example
 * const action = createCheckoutSession.bind(null, 'my-story-slug')
 * <PaywallOverlay onUnlock={action} storySlug="my-story-slug" />
 */
function PaywallOverlay({ onUnlock, storySlug, className }: PaywallOverlayProps) {
  return (
    <div
      data-slot="paywall-overlay"
      className={cn(
        "absolute inset-0 z-30 flex flex-col items-center justify-end",
        "bg-gradient-to-t from-cinematic-bg via-cinematic-bg/80 to-transparent",
        className
      )}
    >
      {/* Card */}
      <div className="w-full max-w-xl mx-auto mb-12 px-4 flex flex-col items-center gap-6">
        {/* Lock icon with ember glow */}
        <div className="relative flex items-center justify-center size-16">
          <div className="absolute inset-0 bg-primary/20 blur-xl" />
          <div className="relative border border-primary/40 bg-cinematic-panel/80 flex items-center justify-center size-16">
            <Lock className="size-6 text-primary" aria-hidden="true" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-brand-ember drop-shadow-md">
            Archive Access Required
          </p>
          <h2 className="font-heading text-2xl text-cinematic-text leading-tight drop-shadow-md">
            Unlock the Full Archive
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed drop-shadow-sm">
            {"You're reading a preview. Purchase lifetime access to read every folk story in the Kangleipak archive — once, forever."}
          </p>
        </div>

        {/* Feature list */}
        <ul className="w-full space-y-2" aria-label="What you get">
          {FEATURES.map(({ icon: Icon, label, detail }) => (
            <li
              key={label}
              className="flex items-start gap-3 border border-cinematic-border bg-cinematic-panel/60 backdrop-blur-md px-4 py-3 shadow-lg"
            >
              <Icon className="size-4 text-brand-ember shrink-0 mt-0.5 drop-shadow-sm" aria-hidden="true" />
              <div>
                <span className="text-xs font-mono text-cinematic-text font-semibold drop-shadow-sm">{label}</span>
                <p className="text-[11px] text-muted-foreground mt-0.5 drop-shadow-sm">{detail}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* CTA form — invokes bound server action */}
        <form action={onUnlock} className="w-full mt-2">
          {storySlug && <input type="hidden" name="slug" value={storySlug} />}
          <SubmitButton />
        </form>

        <p className="text-[10px] font-mono text-muted-foreground/80 text-center tracking-wide drop-shadow-sm">
          One-time payment · No subscription · Secure checkout via Stripe
        </p>
      </div>
    </div>
  );
}

export { PaywallOverlay };
export type { PaywallOverlayProps };
