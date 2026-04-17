"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { enUS } from "@clerk/localizations";
import * as React from "react";
import { AuthGatewayLayout } from "@workspace/ui/components/AuthGatewayLayout";

export default function LoginPage() {
  return (
    <AuthGatewayLayout
      portalLabel="Creator Studio"
      headingText="Access the Forge."
      portalDescription="Warekeepers Only"
      versionText="FW_LAB · Identity Protocol v2.4"
      backLinkHref={process.env.NEXT_PUBLIC_LANDING_URL ?? "http://localhost:3001"}
      showSignUp={false}
    >
      <SignIn
        fallback={
          <div className="w-full flex-col space-y-4 animate-pulse mt-4">
            <div className="space-y-1.5 mb-1.5">
              <div className="h-3 w-1/4 bg-cinematic-panel rounded-none" />
              <div className="h-10 w-full bg-cinematic-bg/80 border border-border rounded-none" />
            </div>
            <div className="space-y-1.5 mb-1.5">
              <div className="h-3 w-1/4 bg-cinematic-panel rounded-none" />
              <div className="h-10 w-full bg-cinematic-bg/80 border border-border rounded-none" />
            </div>
            <div className="h-11 w-full bg-primary/20 border border-primary/30 mt-5 rounded-none" />
          </div>
        }
        routing="path"
        path="/login"
        signUpUrl="/login"
        forceRedirectUrl="/overview"
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: "var(--primary)",
            colorBackground: "transparent",
            colorText: "var(--foreground)",
            colorInputBackground: "var(--cinematic-bg)",
            colorInputText: "var(--foreground)",
            colorDanger: "var(--destructive)",
            colorSuccess: "var(--brand-ochre)",
            fontSize: "14px",
          },
          elements: {
            // Container wrappers
            rootBox: "!w-full !max-w-none",
            cardBox:
              "!w-full !max-w-none !shadow-none !bg-transparent !rounded-none",
            card: "!p-0 !w-full !max-w-none !shadow-none !border-none !rounded-none !bg-transparent",

            // Clerk's own header — hidden (we use our layout header)
            headerTitle: "!hidden",
            headerSubtitle: "!hidden",
            header: "!hidden",

            // Form spacing
            main: "!gap-3",
            formFields: "!gap-3",
            formFieldRow: "!m-0",
            formFieldLabelRow: "!mb-1.5",

            // Labels — product-grade, de-emphasized
            formFieldLabel:
              "font-mono text-[11px] text-muted-foreground uppercase tracking-[0.1em] !m-0",

            // Inputs — filled bg, subtle border, clean rounded-none
            formFieldInput:
              "!w-full h-10 !rounded-none !border !border-border bg-cinematic-bg/80 px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/35 transition-all duration-200 focus:!border-primary focus:bg-primary/5 !outline-none !shadow-none ring-0 focus:ring-0",

            // Primary CTA button (includes data-loading styles for the internal spinner & persistent text)
            formButtonPrimary:
              "cl-custom-button !w-full !rounded-none bg-primary text-primary-foreground font-mono text-[11px] font-black uppercase tracking-[0.22em] h-11 hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 !mt-5 !mb-0 !border-0 !shadow-none overflow-hidden relative " +
              "[&[data-loading]]:!text-transparent " +
              "[&[data-loading]::after]:content-['ACCESSING...'] [&[data-loading]::after]:absolute [&[data-loading]::after]:inset-0 [&[data-loading]::after]:flex [&[data-loading]::after]:items-center [&[data-loading]::after]:justify-center [&[data-loading]::after]:text-primary-foreground " +
              "[&[data-loading]>svg]:!absolute [&[data-loading]>svg]:!left-4",

            // Footer action — "Forgot password?" re-enabled
            footerAction:
              "!flex !items-center !justify-end !mt-2 !p-0 !bg-transparent",
            footerActionLink:
              "font-mono text-[10px] uppercase tracking-widest text-primary hover:text-primary/70 transition-colors duration-200 !font-bold",
            footerActionText: "!hidden",

            // Clerk branded footer — hidden
            footer: "!hidden",

            // Social / OAuth — hidden (providers not configured in Clerk dashboard)
            socialButtonsBlockButton: "!hidden",
            dividerRow: "!hidden",
            socialButtonsBlockButtonText: "!hidden",

            // Identity preview (when email entered for next step)
            identityPreviewText: "font-mono text-sm font-bold text-foreground",
            identityPreviewEditButton:
              "text-primary font-mono text-[10px] uppercase tracking-widest font-bold hover:text-primary/70 transition-colors duration-200",

            // Resend code (OTP step)
            formResendCodeLink:
              "text-primary font-mono text-[10px] font-bold uppercase tracking-widest hover:text-primary/70 transition-colors duration-200",

            // OTP input fields
            otpCodeFieldInput:
              "!rounded-none !border !border-border bg-cinematic-bg/80 focus:border-primary focus:bg-primary/5 size-11 font-mono text-base transition-all duration-200 !shadow-none",
          },
        }}
      />
    </AuthGatewayLayout>
  );
}
