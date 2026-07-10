"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Flame, Lock, Sparkles, BookOpen, Loader2 } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useSearchParams } from "next/navigation";

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

import { toast } from "sonner";

function SubmitButton() {
  const { pending } = useFormStatus();

  React.useEffect(() => {
    if (pending) {
      toast.loading("Initiating secure checkout...", { id: "checkout-toast" });
    } else {
      toast.dismiss("checkout-toast");
    }
  }, [pending]);

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="Unlock lifetime access for ₹899"
      className={cn(
        "w-full h-14 flex items-center justify-center gap-3",
        "border border-primary bg-primary text-primary-foreground",
        "font-sans text-sm tracking-wide font-bold",
        "transition-all duration-200",
        "hover:bg-primary/90 hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:opacity-60 disabled:cursor-not-allowed shadow-nordic"
      )}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin text-primary-foreground" aria-hidden="true" />
          Redirecting to checkout…
        </>
      ) : (
        <>
          <Flame className="size-4" aria-hidden="true" />
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
  const searchParams = useSearchParams();
  const shouldAutoCheckout = searchParams.get("checkout") === "true";
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    // If the user just logged in with the intent to checkout, automatically submit the form
    // Add a small delay to allow the page to settle and prevent aggressive flashes
    if (shouldAutoCheckout && formRef.current) {
      const timer = setTimeout(() => {
        formRef.current?.requestSubmit();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoCheckout]);

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
      <div className="w-full max-w-xl mx-auto mt-auto mb-12 pt-12 px-4 flex flex-col items-center gap-6 shrink-0">
        {/* Lock icon with ember glow */}
        <div className="relative flex items-center justify-center size-16">
          <div className="absolute inset-0 bg-primary blur-xl opacity-10 dark:opacity-20" />
          <div className="relative border border-primary/40 bg-cinematic-panel/80 flex items-center justify-center size-16">
            <Lock className="size-6 text-primary" aria-hidden="true" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <p className="text-fine font-mono tracking-caps uppercase text-brand-ember">
            Archive Access Required
          </p>
          <h2 className="font-heading text-2xl text-cinematic-text leading-tight">
            Unlock the Full Archive
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            {"You're reading a preview. Purchase lifetime access to read every folk story in the Kangleipak archive — once, forever."}
          </p>
        </div>

        {/* Feature list */}
        <ul className="w-full space-y-2" aria-label="What you get">
          {FEATURES.map(({ icon: Icon, label, detail }) => (
            <li
              key={label}
              className="flex items-start gap-3 border border-cinematic-border bg-cinematic-panel/60 backdrop-blur-md px-4 py-3 shadow-nordic-sm"
            >
              <Icon className="size-4 text-brand-ember shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="text-xs font-mono text-cinematic-text font-semibold">{label}</span>
                <p className="text-tight-label text-muted-foreground mt-0.5">{detail}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* CTA form — invokes bound server action */}
        <form ref={formRef} action={onUnlock} className="w-full mt-2">
          {storySlug && <input type="hidden" name="slug" value={storySlug} />}
          <SubmitButton />
        </form>

        <p className="text-fine font-mono text-muted-foreground/80 text-center tracking-wide">
          One-time payment · No subscription · Secure checkout via Stripe
        </p>
      </div>
    </div>
  );
}

export { PaywallOverlay };
export type { PaywallOverlayProps };
