"use client";

import React from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type Props = { children: React.ReactNode };

export function ConvexClerkProvider({ children }: Props) {
  return (
    <ClerkProvider
      localization={{
        signIn: {
          start: {
            title: "Sign in to Fungga-Wari-Lab",
            subtitle: "Welcome back! Please sign in to continue",
          },
        },
      }}
      appearance={{
        variables: {
          colorPrimary: "var(--primary)",
          colorBackground: "var(--background)",
          colorInputBackground: "var(--secondary)",
          colorInputText: "var(--foreground)",
          colorText: "var(--foreground)",
          colorTextSecondary: "var(--muted-foreground)",
          borderRadius: "0rem",
          fontFamily: "var(--font-sans, system-ui)",
        },
        elements: {
          // Hide social login buttons (Google etc.)
          socialButtonsBlockButton: { display: "none" },
          // Hide the "or" divider between social and email
          dividerRow: { display: "none" },
          // Hide "Don't have an account? Sign up" footer
          footerAction: { display: "none" },
          // Hide "Secured by Clerk" branding
          footer: { display: "none" },
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
