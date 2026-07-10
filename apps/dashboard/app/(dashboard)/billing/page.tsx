"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseAuth } from "@workspace/auth/supabase-provider";
import { DashboardCard } from "@workspace/ui/components/DashboardCard";
import { Button } from "@workspace/ui/components/button";
import { Flame, LockOpen, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { getBillingStatus, toggleLifetimeAccess } from "@/actions/billingActions";
import { PaywallOverlay } from "@workspace/ui/components/PaywallOverlay";

export default function BillingPage() {
  const { user } = useSupabaseAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (user?.id) {
      getBillingStatus(user.id).then(setHasAccess).catch(console.error);
    }
  }, [user?.id]);

  const handleToggleAccess = async () => {
    if (!user?.id || hasAccess === null) return;
    setIsPending(true);
    try {
      await toggleLifetimeAccess(user.id, !hasAccess);
      setHasAccess(!hasAccess);
      toast.success(
        !hasAccess 
          ? "Lifetime access granted. You will bypass the paywall." 
          : "Lifetime access revoked. You will now see the paywall.",
        { id: "billing-toast" }
      );
    } catch (e: unknown) {
      toast.error("Failed to update access", { id: "billing-toast" });
    } finally {
      setIsPending(false);
    }
  };

  const mockCheckoutAction = async () => {
    toast.loading("Initiating test checkout...", { id: "mock-checkout" });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Checkout simulation complete.", { id: "mock-checkout" });
  };

  return (
    <div className="flex flex-col min-h-full p-6 lg:p-10 lg:px-14 max-w-5xl mx-auto w-full space-y-16 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col border-b border-border-subtle pb-8 shrink-0 relative z-10 w-full pt-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-brand-ember font-sans text-xs font-semibold tracking-wide mb-2 border-l-2 border-brand-ember/60 pl-3 bg-brand-ember/5 w-fit py-1 pr-4">
            <Flame className="size-4" />
            <span>Billing & Paywall Test</span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Stripe Integration.
          </h1>
          <p className="text-muted-foreground font-sans text-sm max-w-2xl mt-2">
            Manage your billing status to test the paywall behavior on the public web app.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Status Card */}
        <DashboardCard variant="panel" padding="none" className="overflow-hidden relative border border-border-subtle">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-ember/50 to-transparent" />
          <div className="p-6 border-b border-border-subtle bg-bg-surface">
            <h2 className="font-heading text-xl font-black uppercase tracking-tighter text-foreground/90">
              Access Status
            </h2>
            <p className="text-fine font-mono text-muted-foreground tracking-wide mt-1 border-l-2 border-border/50 pl-2">
              Current account privilege level.
            </p>
          </div>
          <div className="p-6 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className={`size-12 flex items-center justify-center border ${hasAccess ? 'border-primary bg-primary/10 text-primary' : 'border-destructive bg-destructive/10 text-destructive'}`}>
                {hasAccess ? <LockOpen className="size-5" /> : <ShieldAlert className="size-5" />}
              </div>
              <div>
                <p className="font-sans font-bold text-lg tracking-tight">
                  {hasAccess === null ? "Loading..." : hasAccess ? "Lifetime Access Active" : "No Access (Paywall Active)"}
                </p>
                <p className="text-sm font-mono text-muted-foreground tracking-wide mt-1">
                  {hasAccess ? "You bypass all paywalls." : "You will be prompted to pay."}
                </p>
              </div>
            </div>

            <div className="border-t border-border-subtle pt-6">
              <Button
                onClick={handleToggleAccess}
                disabled={isPending || hasAccess === null}
                variant={hasAccess ? "outline" : "default"}
                className={`w-full font-sans text-xs font-semibold tracking-wide h-12 rounded-none transition-all shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  hasAccess 
                    ? "border border-border/50 text-muted-foreground hover:border-destructive hover:text-destructive hover:bg-destructive/10"
                    : "border border-primary bg-primary text-primary-foreground hover:bg-background hover:text-primary"
                }`}
              >
                {isPending ? <Loader2 className="size-4 animate-spin" /> : hasAccess ? "Revoke Access (Test Paywall)" : "Grant Lifetime Access"}
              </Button>
            </div>
          </div>
        </DashboardCard>

        {/* Info Card */}
        <DashboardCard variant="panel" padding="none" className="overflow-hidden relative border border-border-subtle">
           <div className="p-6 border-b border-border-subtle bg-bg-surface">
            <h2 className="font-heading text-xl font-black uppercase tracking-tighter text-foreground/90">
              Enterprise Integration
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="p-4 border border-border/50 bg-bg-surface/50 font-mono text-xs text-muted-foreground tracking-wide leading-relaxed">
              <p className="mb-2"><strong className="text-foreground">Stripe Webhooks:</strong> Fully implemented.</p>
              <p className="mb-2">Webhook endpoint <code>/api/webhooks/stripe</code> listens for <code>checkout.session.completed</code> and updates the database securely.</p>
              <p>Admins can toggle their access here to test the public paywall without making real payments.</p>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Paywall Preview */}
      <div className="space-y-6 pt-8 border-t border-border-subtle">
        <h2 className="font-heading text-2xl font-black uppercase tracking-tighter text-foreground/90">
          Paywall Design Preview
        </h2>
        <div className="relative h-[600px] w-full border border-border-subtle bg-cinematic-bg overflow-hidden flex items-end">
          <div className="absolute inset-0 flex flex-col p-10 font-sans text-cinematic-text opacity-40">
            <h1 className="text-4xl font-bold mb-4 font-heading">The Tale of the Seven Brothers</h1>
            <p className="mb-2 leading-relaxed max-w-2xl">Once upon a time in the ancient kingdom of Kangleipak, there lived seven brothers who were known throughout the land for their incredible strength and unwavering bond. They lived in a small village surrounded by dense, misty forests where spirits were said to roam freely.</p>
            <p className="mb-2 leading-relaxed max-w-2xl">One evening, as the sun dipped below the horizon casting a fiery orange glow over the hills, the youngest brother heard a strange melody drifting through the trees. It was a song of sorrow, echoing with an unnatural resonance that chilled him to the bone.</p>
          </div>
          <PaywallOverlay onUnlock={mockCheckoutAction} />
        </div>
      </div>
    </div>
  );
}
