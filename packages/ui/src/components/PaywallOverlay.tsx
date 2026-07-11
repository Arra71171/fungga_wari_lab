
import * as React from "react";
import { Flame, Lock, Sparkles, BookOpen, Loader2 } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

type PaywallOverlayProps = {
  className?: string;
};

const FEATURES = [
  { icon: BookOpen, label: "Unlimited archive access", detail: "Every story, every chapter — unlocked" },
  { icon: Sparkles, label: "All future stories", detail: "New manuscripts added automatically" },
  { icon: Flame, label: "Immersive cinematic reader", detail: "Ambient audio, focus modes & scene search" },
];


import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

function SubmitButton() {
  return (
    <Button
      asChild
      className={cn(
        "w-full h-12 flex items-center justify-center gap-3 rounded-none",
        "border border-primary bg-primary text-primary-foreground",
        "font-sans text-sm tracking-wide font-bold",
        "transition-all duration-200",
        "hover:bg-primary/90 hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "shadow-nordic"
      )}
    >
      <Link href="/pricing" aria-label="View archive subscription plans">
        <Flame className="size-4" aria-hidden="true" />
        View Archive Plans
      </Link>
    </Button>
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
function PaywallOverlay({ className }: PaywallOverlayProps) {
  // The component no longer auto-checkouts or submits a form.
  // It simply provides a link to the /pricing page.

  return (
    <div
      data-slot="paywall-overlay"
      className={cn(
        "absolute inset-0 z-30 flex flex-col items-center overflow-y-auto",
        "bg-gradient-to-t from-cinematic-bg via-cinematic-bg via-60% to-transparent backdrop-blur-[2px]",
        className
      )}
    >
      {/* Card */}
      <div className="w-full max-w-lg mx-auto mt-auto mb-8 pt-8 px-4 flex flex-col items-center gap-4 shrink-0">
        {/* Lock icon with ember glow */}
        <div className="relative flex items-center justify-center size-12">
          <div className="absolute inset-0 bg-primary blur-xl opacity-10 dark:opacity-20" />
          <div className="relative border border-primary/40 bg-cinematic-panel/80 flex items-center justify-center size-12">
            <Lock className="size-5 text-primary" aria-hidden="true" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center space-y-1.5">
          <p className="text-fine font-mono tracking-caps uppercase text-brand-ember">
            Archive Access Required
          </p>
          <h2 className="font-heading text-xl md:text-2xl text-cinematic-text leading-tight">
            Unlock the Full Archive
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {"You're reading a preview. Subscribe to read every folk story in the Kangleipak archive and get new stories every week."}
          </p>
        </div>

        {/* Feature list */}
        <ul className="w-full space-y-2" aria-label="What you get">
          {FEATURES.map(({ icon: Icon, label, detail }) => (
            <li
              key={label}
              className="flex items-start gap-3 border border-cinematic-border bg-cinematic-panel/60 backdrop-blur-md px-3 py-2 shadow-nordic-sm"
            >
              <Icon className="size-4 text-brand-ember shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="text-xs font-mono text-cinematic-text font-semibold">{label}</span>
                <p className="text-tight-label text-muted-foreground mt-0.5">{detail}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* CTA link to pricing page */}
        <div className="w-full mt-2">
          <SubmitButton />
        </div>

        <p className="text-fine font-mono text-muted-foreground/80 text-center tracking-wide">
          Cancel anytime · Secure checkout via Stripe
        </p>
      </div>
    </div>
  );
}

export { PaywallOverlay };
export type { PaywallOverlayProps };
