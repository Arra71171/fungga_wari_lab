"use client";

import * as React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { AmbientGrid } from "./AmbientGrid";
import { FolkKey } from "./FolkKey";
import { NoiseOverlay } from "./NoiseOverlay";

// ─── Animation Variants ───────────────────────────────────────────────────────

const titleVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const lineVariants: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 210, damping: 26 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 160, damping: 24, delay: 0.18 },
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthGatewayLayoutProps {
  portalLabel: string;
  headingText?: string;
  portalDescription?: string;
  versionText: string;
  backLinkHref?: string;
  showSignUp?: boolean;
  children: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AuthGatewayLayout({
  portalLabel,
  headingText = "Sign In.",
  portalDescription = "Identity Verification",
  versionText,
  backLinkHref = "/",
  showSignUp = false,
  children,
}: AuthGatewayLayoutProps) {
  return (
    /*
     * Auth portals respect the user's theme preference from next-themes.
     * All tokens use semantic design-system values that adapt to light/dark.
     */
    <div className="relative min-h-screen bg-background text-foreground antialiased selection:bg-primary/30 overflow-x-hidden">
      <AmbientGrid />
      <NoiseOverlay opacity={0.028} />

      {/* ── Header bar ──────────────────────────────────────────────── */}
      <header className="relative z-20 flex items-center justify-between h-14 px-6 lg:px-10 border-b-2 border-border">
        {/* Back link — lean, fully contained within h-14 */}
        <Link
          href={backLinkHref}
          aria-label="Return to landing page"
          className="group flex items-center gap-3 outline-none"
        >
          <motion.div
            className="flex size-8 shrink-0 items-center justify-center border border-primary/50 bg-primary/10 text-primary"
            whileHover={{
              scale: 1.06,
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
              borderColor: "var(--color-primary)",
            }}
            transition={{ duration: 0.16 }}
          >
            <motion.div
              whileHover={{ x: -3 }}
              transition={{ type: "spring", stiffness: 350, damping: 18 }}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </motion.div>
          </motion.div>

          <div className="hidden sm:flex flex-col leading-none">
            <span className="font-mono text-nano font-bold uppercase tracking-caps text-primary/60">
              fw_lab
            </span>
            <span className="font-heading text-xs font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors duration-200">
              Return
            </span>
          </div>
        </Link>

        {/* Version stamp — no theme toggle (page is always dark by design) */}
        <span
          aria-hidden="true"
          className="font-mono text-fine font-bold uppercase tracking-caps text-muted-foreground/45 select-none"
        >
          {versionText}
        </span>
      </header>

      {/* ── Main centered layout ─────────────────────────────────────── */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen-content px-4 sm:px-6 py-10 lg:py-14">

        {/* Title block — above the card */}
        <motion.div
          variants={titleVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-content mb-7 lg:mb-9"
        >
          <motion.p
            variants={lineVariants}
            className="font-mono text-tight-label font-bold uppercase tracking-ultra text-primary mb-3 flex items-center gap-2"
          >
            <span className="size-1.5 bg-primary inline-block shrink-0" />
            {portalLabel}
          </motion.p>
          <motion.h1
            variants={lineVariants}
            className="font-heading text-fluid-heading font-semibold text-foreground leading-[1.04] tracking-tight"
          >
            {headingText}
          </motion.h1>
        </motion.div>

        {/* Two-column card ─────────────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-content border-2 border-border bg-card overflow-hidden flex flex-col lg:grid lg:grid-cols-auth"
        >
          {/* LEFT: Folk key visual */}
          <div className="relative min-h-64 lg:min-h-96 border-b-2 lg:border-b-0 lg:border-r-2 border-border overflow-hidden bg-secondary">
            {/* Warm radial glow behind key */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none bg-radial-primary-glow"
            />

            <FolkKey className="z-10" />

            {/* Portal watermark */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none select-none">
              <span className="font-mono text-nano font-bold uppercase tracking-ultra text-primary/22">
                {portalLabel}
              </span>
              <span className="font-mono text-nano font-bold uppercase tracking-eyebrow text-foreground/12">
                sys.key
              </span>
            </div>

            {/* Mobile fade */}
            <div
              aria-hidden="true"
              className="lg:hidden absolute inset-x-0 bottom-0 h-10 pointer-events-none bg-fade-to-card"
            />
          </div>

          {/* RIGHT: Form panel */}
          <div className="flex flex-col p-6 lg:p-8 w-full justify-center">

            {/* Sub-header */}
            <div className="pb-4 mb-5 border-b border-border">
              <p className="font-mono text-fine font-bold uppercase tracking-loose text-muted-foreground">
                {portalDescription}
              </p>
            </div>

            {/* Clerk form */}
            <div className="flex-1 min-w-0">
              {children}
            </div>

            {/* Optional sign-up link */}
            {showSignUp && (
              <div className="pt-4 mt-3 border-t border-border">
                <p className="font-mono text-tight-label text-muted-foreground">
                  No account?{" "}
                  <Link
                    href="/register"
                    className="text-primary font-bold uppercase tracking-wide hover:text-primary/70 transition-colors duration-200"
                  >
                    Create access →
                  </Link>
                </p>
              </div>
            )}

            {/* Instance stamp */}
            <p
              aria-hidden="true"
              className="mt-5 font-mono text-nano uppercase tracking-label text-muted-foreground/25 select-none"
            >
              {portalLabel} · sys.auth v2
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
