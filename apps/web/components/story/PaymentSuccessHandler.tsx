"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import successAnimation from "../../../../public/lottie/success_payment.json";
import { BrandLogo } from "@workspace/ui/components/BrandLogo";
import { verifyAndGrantAccess } from "@/actions/paywallActions";

// Dynamically import Lottie to prevent SSR hydration issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export function PaymentSuccessHandler() {
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("payment") === "success";
  const sessionId = searchParams.get("session_id") ?? "";

  const [status, setStatus] = React.useState<"verifying" | "done" | "error">(
    "verifying"
  );

  React.useEffect(() => {
    if (!isSuccess) return;

    let cancelled = false;

    async function grantAndRedirect() {
      if (sessionId) {
        // Directly verify the Stripe session and write to DB — no webhook needed.
        const result = await verifyAndGrantAccess(sessionId);
        if (!result.success) {
          console.error("verifyAndGrantAccess failed:", result.error);
        }
      }

      if (!cancelled) {
        setStatus("done");
      }

      // Hard reload after 4 seconds so Next.js re-runs the server component
      // with the freshly updated has_lifetime_access value.
      setTimeout(() => {
        if (!cancelled) {
          // Navigate to the current path without the query params — clean URL
          // and forces a full server-side re-render.
          window.location.href = window.location.pathname;
        }
      }, 4000);
    }

    grantAndRedirect();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, sessionId]);

  if (!isSuccess) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cinematic-bg overflow-hidden">
      <div className="relative w-64 h-64 mb-8">
        <Lottie
          animationData={successAnimation}
          loop={true}
          autoplay={true}
          className="w-full h-full"
        />
      </div>
      <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-both">
        <BrandLogo variant="icon" size="lg" className="text-brand-ember/60" />
        <h2 className="font-heading text-2xl font-black uppercase tracking-widest text-cinematic-text">
          Purchase Successful
        </h2>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground text-center max-w-sm">
          {status === "verifying"
            ? "Verifying your payment..."
            : "The manuscript has been unlocked. Returning you to the archive..."}
        </p>
      </div>
    </div>
  );
}
