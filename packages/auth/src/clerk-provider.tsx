"use client"

import React from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { enUS } from "@clerk/localizations"
import { useTheme } from "next-themes"

type Props = { children: React.ReactNode }

/**
 * Inner component that consumes the resolved theme from next-themes
 * to dynamically set Clerk's baseTheme. This ensures the UserButton
 * popover and all Clerk-managed UI respect the user's theme selection.
 */
function ClerkWithTheme({ children }: Props) {
  const { resolvedTheme } = useTheme()

  return (
    <ClerkProvider
      allowedRedirectOrigins={[
        "http://localhost:3000",
        "http://localhost:3001",
        process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3000",
        process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3001",
      ]}
      localization={{
        ...enUS,
        formButtonPrimary: "ACCESSING...",
        signIn: {
          start: {
            title: "Sign in to Fungga-Wari-Lab",
            subtitle: "Welcome back! Please sign in to continue",
          },
        },
      }}
      appearance={{
        baseTheme: resolvedTheme === "dark" ? dark : undefined,
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
          // Hide "Secured by Clerk" branding on static forms
          footer: { display: "none" },

          // --- Zen Brutalist Overrides for Popovers (UserButton & Logout) ---
          userButtonPopoverCard: "bg-bg-panel border-2 border-border shadow-none rounded-none !p-0",
          userButtonPopoverActionButton: "hover:bg-bg-surface rounded-none px-4 py-3 text-foreground transition-none font-mono",
          userButtonPopoverActionButtonText: "text-foreground font-bold uppercase tracking-[0.15em] text-[10px]",
          userButtonPopoverActionButtonIconBox: "text-brand-ember",
          userPreview: "px-4 py-4 border-b border-border-subtle",
          userPreviewMainIdentifier: "text-foreground font-heading font-black tracking-tight",
          userPreviewSecondaryIdentifier: "text-muted-foreground font-mono text-[9px] uppercase tracking-widest",
          userButtonPopoverFooter: "hidden",

          // --- Global Component Tuning ---
          card: "bg-background border border-border shadow-none rounded-none",
          headerTitle: "font-heading uppercase tracking-tighter",
          headerSubtitle: "font-mono uppercase tracking-widest text-[10px]",
          formButtonPrimary: "rounded-none bg-brand-ember text-primary-foreground hover:opacity-90 font-mono text-xs font-bold uppercase tracking-widest transition-none h-10",
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}

/**
 * Public wrapper — just re-exports the theme-aware Clerk provider.
 * Must be rendered INSIDE a ThemeProvider (next-themes).
 */
export function ClerkAuthProvider({ children }: Props) {
  return <ClerkWithTheme>{children}</ClerkWithTheme>
}
