"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Lottie from "lottie-react";
import successAnimation from "../../../../public/lottie/success_payment.json";
import { BrandLogo } from "@workspace/ui/components/BrandLogo";

export function PaymentSuccessHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // We only show the success animation if ?payment=success is in the URL
  const isSuccess = searchParams.get("payment") === "success";

  React.useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push("/stories");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  if (!isSuccess) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cinematic-bg overflow-hidden">
      <div className="relative w-64 h-64 mb-8">
        <Lottie
          animationData={successAnimation}
          loop={false}
          className="w-full h-full"
        />
      </div>
      <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-both">
        <BrandLogo variant="icon" size="lg" className="text-brand-ember/60" />
        <h2 className="font-heading text-2xl font-black uppercase tracking-widest text-foreground">
          Purchase Successful
        </h2>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground text-center max-w-sm">
          The manuscript has been unlocked. Returning you to the archive...
        </p>
      </div>
    </div>
  );
}
