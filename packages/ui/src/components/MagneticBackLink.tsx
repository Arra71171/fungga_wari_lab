"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { MagneticButton } from "./MagneticButton";
import { cn } from "@workspace/ui/lib/utils";

interface MagneticBackLinkProps {
  href: string;
  label?: string;
  sublabel?: string;
  className?: string;
  variant?: "primary" | "default";
}

export function MagneticBackLink({
  href,
  label = "RETURN",
  sublabel = "FW_LAB",
  className,
  variant = "primary",
}: MagneticBackLinkProps) {
  return (
    <Link href={href} aria-label={`Return to ${label}`}>
      <MagneticButton
        strength={0.35}
        className={cn(
          "group flex flex-col sm:flex-row items-start sm:items-center gap-3 outline-none pointer-events-auto",
          className
        )}
      >
        <motion.div
          className={cn(
            "flex size-12 items-center justify-center border-2 border-border-strong",
            variant === "primary"
              ? "border-primary bg-primary/10 text-primary" // Used by web login
              : "bg-background text-foreground hover:bg-secondary/50" // Used by dashboard login
          )}
          whileHover={
            variant === "primary"
              ? { scale: 1.05, backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" }
              : { scale: 1.05, backgroundColor: "var(--color-secondary)" }
          }
          transition={{ duration: 0.2 }}
        >
          <motion.div
            whileHover={{ x: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <ArrowLeft className="size-5" />
          </motion.div>
        </motion.div>
        
        {/* Label block */}
        <div className="flex flex-col">
          <span className={cn(
            "font-mono text-fine uppercase tracking-eyebrow",
            variant === "primary" ? "text-primary/80" : "text-muted-foreground"
          )}>
            {sublabel}
          </span>
          <span className={cn(
            "font-heading font-black uppercase tracking-widest",
            variant === "primary" ? "text-sm text-foreground" : "text-xs text-foreground"
          )}>
            {label}
          </span>
        </div>
      </MagneticButton>
    </Link>
  );
}
