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
     * `dark` class is intentional — auth portals are ALWAYS cinematic/dark
     * regardless of OS preference. This makes all CSS tokens resolve to their
     * dark-mode values and prevents Clerk's light-theme stylesheet from
     * overriding our appearance variables.
     */
    <div className="dark relative min-h-screen bg-cinematic-bg text-foreground antialiased selection:bg-primary/30 overflow-x-hidden">
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
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60">
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
          className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/45 select-none"
        >
          {versionText}
        </span>
      </header>

      {/* ── Main centered layout ─────────────────────────────────────── */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 sm:px-6 py-10 lg:py-14">

        {/* Title block — above the card */}
        <motion.div
          variants={titleVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[900px] mb-7 lg:mb-9"
        >
          <motion.p
            variants={lineVariants}
            className="font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-primary mb-3 flex items-center gap-2"
          >
            <span className="size-1.5 bg-primary inline-block shrink-0" />
            {portalLabel}
          </motion.p>
          <motion.h1
            variants={lineVariants}
            className="font-heading text-[clamp(2.4rem,5vw,3.75rem)] font-semibold text-foreground leading-[1.04] tracking-tight"
          >
            {headingText}
          </motion.h1>
        </motion.div>

        {/* Two-column card ─────────────────────────────────────────────── */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[900px] border-2 border-border bg-cinematic-panel overflow-hidden flex flex-col lg:grid lg:grid-cols-[1fr_360px]"
        >
          {/* LEFT: Folk key visual */}
          <div className="relative min-h-[260px] lg:min-h-0 border-b-2 lg:border-b-0 lg:border-r-2 border-border overflow-hidden bg-cinematic-bg">
            <FolkKey />

            {/* Warm radial glow behind key */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 50% 40% at 50% 50%, color-mix(in oklch, var(--primary) 8%, transparent), transparent 70%)",
              }}
            />

            {/* Portal watermark */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none select-none">
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.35em] text-primary/22">
                {portalLabel}
              </span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-foreground/12">
                sys.key
              </span>
            </div>

            {/* Mobile fade */}
            <div
              aria-hidden="true"
              className="lg:hidden absolute inset-x-0 bottom-0 h-10 pointer-events-none"
              style={{
                background: "linear-gradient(to bottom, transparent, var(--cinematic-panel))",
              }}
            />
          </div>

          {/* RIGHT: Form panel */}
          <div className="flex flex-col p-6 lg:p-8 min-h-[420px] lg:min-h-0">

            {/* Sub-header */}
            <div className="pb-4 mb-5 border-b border-border">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
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
                <p className="font-mono text-[11px] text-muted-foreground">
                  No account?{" "}
                  <a
                    href="/register"
                    className="text-primary font-bold uppercase tracking-wide hover:text-primary/70 transition-colors duration-200"
                  >
                    Create access →
                  </a>
                </p>
              </div>
            )}

            {/* Instance stamp */}
            <p
              aria-hidden="true"
              className="mt-5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/25 select-none"
            >
              {portalLabel} · sys.auth v2
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
