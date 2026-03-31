"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import * as React from "react";
import { BorderBeam } from "@workspace/ui/components/border-beam";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
  type Variants,
} from "framer-motion";
import { useTheme } from "next-themes";
import { AnimatedThemeToggler } from "@workspace/ui/components/animated-theme-toggler";

// ─── Animation Variants ──────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 180, damping: 22 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 25, delay: 0.35 },
  },
};

// ─── Animated Grid Background ─────────────────────────────────────────────────

function GridBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 max-w-7xl mx-auto flex h-full">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`w-1/4 h-full flex-shrink-0 border-r border-border border-dashed ${
              i === 1 ? "hidden md:block" : i === 2 ? "hidden lg:block" : i === 3 ? "hidden lg:block" : ""
            }`}
            animate={{ opacity: [0.08, 0.2, 0.08] }}
            transition={{
              duration: 3.5 + i * 0.9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.7,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Magnetic Back Button ─────────────────────────────────────────────────────

function MagneticBackButton({ href }: { href: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 200, damping: 20, mass: 0.5 });
  const y = useSpring(rawY, { stiffness: 200, damping: 20, mass: 0.5 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    rawX.set((e.clientX - (rect.left + rect.width / 2)) * 0.35);
    rawY.set((e.clientY - (rect.top + rect.height / 2)) * 0.35);
  }

  function handleMouseLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <Link href={href} aria-label="Return to Mainframe">
      <motion.div
        ref={ref}
        style={{ x, y }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group flex items-center gap-4 outline-none cursor-pointer"
      >
        <motion.div
          className="flex size-12 items-center justify-center border border-border bg-background text-foreground shadow-brutal-sm"
          whileHover={{ backgroundColor: "var(--secondary)" }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="flex items-center justify-center"
            whileHover={{ x: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <ArrowLeft className="size-4" />
          </motion.div>
        </motion.div>
        <div className="hidden flex-col sm:flex">
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            FW_LAB
          </span>
          <span className="font-heading text-xs font-bold uppercase tracking-widest text-foreground">
            ACCESS
          </span>
        </div>
      </motion.div>
    </Link>
  );
}


// ─── Login Page ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <div
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background antialiased text-foreground selection:bg-primary/30 selection:text-primary-foreground"
    >
      <GridBackground />

      {/* Top Nav */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 md:py-8"
      >
        <MagneticBackButton
          href={process.env.NEXT_PUBLIC_LANDING_URL || "http://localhost:3001"}
        />
        <AnimatedThemeToggler />
      </motion.div>

      {/* Main content column */}
      <div className="relative z-20 flex w-full max-w-[480px] flex-col items-center gap-8 px-6 py-24">

        {/* Branding block — staggered */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center w-full gap-4"
        >
          {/* Status badge */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2.5 border border-border px-4 py-2 bg-secondary/50">
              <motion.div
                className="size-2 rounded-full bg-status-active"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                FW_LAB • Mainframe
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl font-heading font-black tracking-tighter uppercase leading-none"
          >
            Initialize{" "}
            <motion.span
              className="text-primary inline-block"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              Session.
            </motion.span>
          </motion.h1>

          {/* Sub line */}
          <motion.p
            variants={itemVariants}
            className="text-[11px] text-muted-foreground font-mono leading-relaxed max-w-[300px]"
          >
            Authenticate to access the Neo-Archival protocol and cultural heritage systems.
          </motion.p>
        </motion.div>

        {/* Auth Form Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="relative w-full overflow-hidden border border-border bg-background shadow-brutal"
        >
          <BorderBeam size={250} duration={12} delay={9} />
          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/login"
            fallbackRedirectUrl="/stories"
            appearance={{
              elements: {
                rootBox: "!w-full !max-w-full",
                cardBox: "!w-full !max-w-full !shadow-none !bg-transparent !rounded-none",
                card: "!w-full !max-w-full !shadow-none !border-none !rounded-none !bg-transparent px-8 py-6 relative z-10",
                headerTitle:
                  "font-heading text-lg font-black tracking-tighter uppercase text-foreground text-center !mb-1",
                headerSubtitle:
                  "font-mono text-[9px] uppercase tracking-widest text-muted-foreground text-center !max-w-none w-full !mb-0",
                main: "!gap-0",
                formFields: "!gap-0",
                formFieldRow: "!mt-5",
                formFieldLabelRow: "!mb-1.5",
                formFieldLabel:
                  "font-mono text-[9px] font-bold uppercase tracking-widest text-foreground !m-0",
                formFieldInput:
                  "!w-full h-11 !rounded-none !border-b-2 !border-l !border-r !border-t-0 border-border bg-secondary/20 px-3 font-mono text-sm text-foreground transition-all duration-300 focus:border-primary focus:bg-primary/5 !outline-none !shadow-none",
                formButtonPrimary:
                  "!w-full !rounded-none bg-primary text-primary-foreground font-mono text-[10px] font-bold uppercase tracking-widest h-12 hover:bg-primary/90 transition-all duration-300 !mt-6 !shadow-none !border-0",
                footerAction: "!hidden",
                footer: "!hidden",
                socialButtonsBlockButton: "!hidden",
                dividerRow: "!hidden",
                identityPreviewText: "font-mono text-sm text-foreground",
                identityPreviewEditButton:
                  "text-primary font-mono text-xs hover:text-primary/80 transition-colors",
                formResendCodeLink:
                  "text-primary font-mono text-xs hover:text-primary/80 transition-colors uppercase tracking-widest",
                otpCodeFieldInput:
                  "!rounded-none !border-b-2 !border-l !border-r !border-t-0 border-border bg-secondary/20 focus:border-primary focus:bg-primary/5 size-12 transition-all duration-300 !shadow-none",
              },
            }}
          />
        </motion.div>

        {/* Footer meta */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <motion.div
            className="border border-border px-6 py-2.5 bg-secondary/50 font-mono text-[9px] uppercase tracking-widest text-muted-foreground"
            whileHover={{ borderColor: "var(--primary)", color: "var(--primary)" }}
            transition={{ duration: 0.2 }}
          >
            FW_LAB • Identity Protocol v2.4
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
