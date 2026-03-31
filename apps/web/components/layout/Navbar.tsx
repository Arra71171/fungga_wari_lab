"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { AnimatedThemeToggler } from "@workspace/ui/components/animated-theme-toggler";
import { BrandLogo } from "@workspace/ui/components/BrandLogo";

const navItems = [
  { name: "Stories", href: "/stories" },
  { name: "Platform", href: "/#features" },
  { name: "Community", href: "/#community" },
  { name: "Archive", href: "/#archive" },
];

// Dashboard lives on a separate origin (dashboard app).
// In dev: localhost:3000. In prod: set NEXT_PUBLIC_DASHBOARD_URL.
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3000";

function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);

  useMotionValueEvent(scrollY, "change", (latest: number) => {
    setScrolled(latest > 20);
  });

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0, x: "-50%" }}
      animate={{ y: 0, opacity: 1, x: "-50%" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-6 left-1/2 z-50 flex items-center gap-4 px-3 py-2 transition-all duration-300",
        "rounded-none border border-border bg-background",
        scrolled ? "shadow-sm" : "shadow-md"
      )}
    >
      <Link
        href="/"
        className="mr-4 pl-1 hover:opacity-80 transition-opacity"
        aria-label="Fungga Wari Lab — Home"
      >
        <BrandLogo variant="full" size="sm" />
      </Link>

      <div className="hidden items-center gap-2 md:flex border-l-2 border-foreground/20 pl-6 h-8">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="rounded-none px-4 py-1 text-sm font-mono font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground hover:bg-secondary transition-colors"
          >
            {item.name}
          </Link>
        ))}
      </div>

      <div className="ml-4 flex items-center gap-2">
        <AnimatedThemeToggler />
        <Button
          variant="default"
          size="default"
          className="rounded-none font-mono font-bold uppercase tracking-widest transition-all"
          asChild
        >
          <a href={DASHBOARD_URL}>Dashboard</a>
        </Button>
      </div>
    </motion.nav>
  );
}

export { Navbar };
