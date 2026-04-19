"use client";

import * as React from "react";
import {
  SignIn,
  TaskChooseOrganization,
  useOrganizationList,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { usePathname, useSearchParams } from "next/navigation";
import { AuthGatewayLayout } from "@workspace/ui/components/AuthGatewayLayout";

const authAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "var(--primary)",
    colorBackground: "transparent",
    colorDanger: "var(--destructive)",
    colorInputBackground: "var(--cinematic-bg)",
    colorInputText: "var(--foreground)",
    colorSuccess: "var(--brand-ochre)",
    colorText: "var(--foreground)",
    fontSize: "14px",
  },
  elements: {
    rootBox: "!w-full !max-w-none",
    cardBox:
      "!w-full !max-w-none !shadow-none !bg-transparent !rounded-none",
    card: "!p-0 !w-full !max-w-none !shadow-none !border-none !rounded-none !bg-transparent",
    headerTitle: "!hidden",
    headerSubtitle: "!hidden",
    header: "!hidden",
    main: "!gap-3",
    formFields: "!gap-3",
    formFieldRow: "!m-0",
    formFieldLabelRow: "!mb-1.5",
    formFieldLabel:
      "font-mono text-[11px] text-muted-foreground uppercase tracking-[0.1em] !m-0",
    formFieldInput:
      "!w-full h-10 !rounded-none !border !border-border bg-cinematic-bg/80 px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/35 transition-all duration-200 focus:!border-primary focus:bg-primary/5 !outline-none !shadow-none ring-0 focus:ring-0",
    formButtonPrimary:
      "cl-custom-button !w-full !rounded-none bg-primary text-primary-foreground font-mono text-[11px] font-black uppercase tracking-[0.22em] h-11 hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 !mt-5 !mb-0 !border-0 !shadow-none overflow-hidden relative " +
      "[&[data-loading]]:!text-transparent " +
      "[&[data-loading]::after]:content-['ACCESSING...'] [&[data-loading]::after]:absolute [&[data-loading]::after]:inset-0 [&[data-loading]::after]:flex [&[data-loading]::after]:items-center [&[data-loading]::after]:justify-center [&[data-loading]::after]:text-primary-foreground " +
      "[&[data-loading]>svg]:!absolute [&[data-loading]>svg]:!left-4",
    footerAction:
      "!flex !items-center !justify-end !mt-2 !p-0 !bg-transparent",
    footerActionLink:
      "font-mono text-[10px] uppercase tracking-widest text-primary hover:text-primary/70 transition-colors duration-200 !font-bold",
    footerActionText: "!hidden",
    footer: "!hidden",
    socialButtonsBlockButton: "!hidden",
    dividerRow: "!hidden",
    socialButtonsBlockButtonText: "!hidden",
    identityPreviewText: "font-mono text-sm font-bold text-foreground",
    identityPreviewEditButton:
      "text-primary font-mono text-[10px] uppercase tracking-widest font-bold hover:text-primary/70 transition-colors duration-200",
    formResendCodeLink:
      "text-primary font-mono text-[10px] font-bold uppercase tracking-widest hover:text-primary/70 transition-colors duration-200",
    otpCodeFieldInput:
      "!rounded-none !border !border-border bg-cinematic-bg/80 focus:border-primary focus:bg-primary/5 size-11 font-mono text-base transition-all duration-200 !shadow-none",
  },
};

function AuthFallback() {
  return (
    <div className="mt-4 w-full flex-col space-y-4 animate-pulse">
      <div className="mb-1.5 space-y-1.5">
        <div className="h-3 w-1/4 rounded-none bg-cinematic-panel" />
        <div className="h-10 w-full rounded-none border border-border bg-cinematic-bg/80" />
      </div>
      <div className="mb-1.5 space-y-1.5">
        <div className="h-3 w-1/4 rounded-none bg-cinematic-panel" />
        <div className="h-10 w-full rounded-none border border-border bg-cinematic-bg/80" />
      </div>
      <div className="mt-5 h-11 w-full rounded-none border border-primary/30 bg-primary/20" />
    </div>
  );
}

function ChooseOrganizationTask({ redirectUrl }: { redirectUrl: string }) {
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: true,
  });

  React.useEffect(() => {
    if (!isLoaded || !setActive) {
      return;
    }

    const memberships = userMemberships.data ?? [];
    if (memberships.length !== 1) {
      return;
    }

    const organizationId = memberships[0]?.organization.id;
    if (!organizationId) {
      return;
    }

    void setActive({
      organization: organizationId,
      redirectUrl,
    }).catch((error: unknown) => {
      console.error(
        "Failed to activate organization during reader login task:",
        error,
      );
    });
  }, [isLoaded, redirectUrl, setActive, userMemberships.data]);

  return (
    <TaskChooseOrganization
      appearance={authAppearance}
      redirectUrlComplete={redirectUrl}
    />
  );
}

export default function LoginPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") ?? "/";
  const isChooseOrganizationTask = pathname.includes("/tasks/choose-organization");

  return (
    <AuthGatewayLayout
      portalLabel="Reader Archive"
      headingText="Enter the Archive."
      portalDescription="The hearth awaits."
      versionText="SYS.AUTH.V2"
      backLinkHref="/"
      showSignUp={true}
    >
      {isChooseOrganizationTask ? (
        <ChooseOrganizationTask redirectUrl={redirectUrl} />
      ) : (
        <SignIn
          appearance={authAppearance}
          fallback={<AuthFallback />}
          forceRedirectUrl="/"
          path="/login"
          routing="path"
          signUpUrl="/register"
        />
      )}
    </AuthGatewayLayout>
  );
}
