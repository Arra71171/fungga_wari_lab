"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { BrandLogo } from "@workspace/ui/components/BrandLogo";
import { useSupabaseAuth } from "@workspace/auth/supabase-provider";
import { AnimatedThemeToggler } from "@workspace/ui/components/animated-theme-toggler";
import { LogOut, User } from "lucide-react";

const navItems = [
  { name: "Library", href: "/stories" },
  { name: "System", href: "/#features" },
  { name: "Community", href: "/#community" },
  { name: "Folklore", href: "/#archive" },
];

// Dashboard lives on a separate origin (dashboard app).
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3000";

function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);
  const { user, userProfile, isLoaded, signOut } = useSupabaseAuth();
  const router = useRouter();

  useMotionValueEvent(scrollY, "change", (latest: number) => {
    setScrolled(latest > 20);
  });

  const isSuperAdmin = userProfile?.role === "superadmin";
  const isAuthenticated = isLoaded && !!user;

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

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
        {navItems.map((item) => {
          const isCollections = item.name === "Folklore";
          const showDashboard = isCollections && isSuperAdmin;
          const href = showDashboard ? DASHBOARD_URL : item.href;
          const name = showDashboard ? "Dashboard" : item.name;

          if (showDashboard) {
            return (
              <a
                key={item.name}
                href={href}
                className="group relative rounded-none px-4 py-1 text-sm font-mono font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors overflow-hidden"
              >
                {name}
                <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-primary scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out" />
              </a>
            );
          }

          return (
            <Link
              key={item.name}
              href={href}
              className="group relative rounded-none px-4 py-1 text-sm font-mono font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors overflow-hidden"
            >
              {name}
              <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-primary scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out" />
            </Link>
          );
        })}
      </div>

      <div className="ml-4 flex items-center gap-4">
        {isLoaded && !isAuthenticated && (
          <>
            <Button
              variant="outline"
              size="default"
              className="rounded-none font-mono font-bold uppercase tracking-widest transition-all hover:bg-secondary border-border"
              asChild
            >
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              variant="default"
              size="default"
              className="rounded-none font-mono font-bold uppercase tracking-widest transition-all"
              asChild
            >
              <Link href="/register">Sign Up</Link>
            </Button>
          </>
        )}
        {isAuthenticated && (
          <div className="ml-2 flex items-center gap-2">
            {/* User avatar */}
            <div className="relative size-8 border border-border bg-secondary overflow-hidden flex items-center justify-center">
              {userProfile?.avatar_url ? (
                <Image
                  src={userProfile.avatar_url}
                  alt="Avatar"
                  fill
                  sizes="32px"
                  className="object-cover grayscale opacity-80"
                />
              ) : (
                <User className="size-4 text-muted-foreground" />
              )}
            </div>
            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        )}
        <div className="ml-2 pl-2 border-l border-border h-6 flex items-center">
          <AnimatedThemeToggler />
        </div>
      </div>
    </motion.nav>
  );
}

export { Navbar };
