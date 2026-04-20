"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { BrandLogo, FungaMark } from "@workspace/ui/components/BrandLogo";
import { useSupabaseAuth } from "@workspace/auth/supabase-provider";
import { AnimatedThemeToggler } from "@workspace/ui/components/animated-theme-toggler";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import {
  LogOut,
  User,
  Menu,
  LayoutDashboard,
  Library,
  Users,
  BookOpen,
  Home,
} from "lucide-react";

const navItems = [
  { name: "Library", href: "/stories", icon: BookOpen },
  { name: "System", href: "/#features", icon: Home },
  { name: "Community", href: "/#community", icon: Users },
  { name: "Folklore", href: "/#archive", icon: Library },
];

// Dashboard lives on a separate origin (dashboard app).
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3000";

function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user, userProfile, isLoaded, signOut } = useSupabaseAuth();
  const router = useRouter();

  useMotionValueEvent(scrollY, "change", (latest: number) => {
    setScrolled(latest > 20);
  });

  const isDashboardUser = ["admin", "superadmin", "editor"].includes(userProfile?.role || "");
  const isAuthenticated = isLoaded && !!user;

  async function handleSignOut() {
    await signOut();
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0, x: "-50%" }}
      animate={{ y: 0, opacity: 1, x: "-50%" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-6 left-1/2 z-50 flex items-center justify-between md:justify-center w-[calc(100%-2rem)] md:w-auto gap-3 px-4 py-3 transition-all duration-300",
        "rounded-none border border-border bg-background",
        scrolled ? "shadow-brutal-sm" : "shadow-brutal"
      )}
    >
      {/* Brand — compact on mobile: icon + stacked wordmark to prevent wrap */}
      <Link
        href="/"
        className="hover:opacity-80 transition-opacity shrink-0 flex items-center gap-2.5"
        aria-label="Fungga Wari Lab — Home"
      >
        {/* Icon glyph — always visible */}
        <span className="inline-flex shrink-0 items-center justify-center border-2 border-border-strong bg-primary/10 p-1.5 text-primary">
          <FungaMark size={18} />
        </span>
        {/* Mobile wordmark: two stacked lines, compact mono */}
        <span className="flex flex-col leading-none md:hidden" aria-hidden="true">
          <span className="font-mono font-black uppercase tracking-[0.12em] text-fine text-foreground">
            Fungga Wari
          </span>
          <span className="font-mono font-bold text-nano text-muted-foreground/80 tracking-wider mt-0.5">
            .Lab
          </span>
        </span>
        {/* Desktop wordmark: horizontal */}
        <span className="hidden md:inline-flex items-center gap-1 leading-none">
          <span className="font-mono font-black uppercase tracking-widest text-base text-foreground">
            Fungga Wari
          </span>
          <span className="font-mono font-bold text-xs text-muted-foreground/80 opacity-90">
            .Lab
          </span>
        </span>
      </Link>

      {/* ── Desktop nav links ─────────────────────────────────────── */}
      <div className="hidden items-center gap-2 md:flex border-l-2 border-foreground/20 pl-6 h-8">
        {navItems.map((item) => {
          const isCollections = item.name === "Folklore";
          const showDashboard = isCollections && isDashboardUser;
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

      {/* ── Desktop auth controls ─────────────────────────────────── */}
      <div className="ml-2 hidden md:flex items-center gap-4">
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
          <div className="flex items-center gap-2">
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
            <button
              onClick={handleSignOut}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        )}
        <div className="pl-2 border-l border-border h-6 flex items-center">
          <AnimatedThemeToggler />
        </div>
      </div>

      {/* ── Mobile right side: theme + hamburger ──────────────────── */}
      <div className="ml-auto flex items-center gap-3 md:hidden">
        <AnimatedThemeToggler />

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="Open navigation menu"
              className="flex items-center justify-center size-10 border-2 border-border bg-background text-foreground hover:bg-secondary hover:border-foreground/40 transition-all"
            >
              <Menu className="size-5" />
            </button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-[280px] p-0 flex flex-col bg-background border-l border-border"
          >
            <SheetHeader className="p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            </SheetHeader>

            {/* Sheet header */}
            <div className="flex items-center justify-between h-14 px-5 border-b border-border shrink-0">
              <BrandLogo variant="full" size="sm" />
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
              <p className="font-mono text-nano tracking-label uppercase text-muted-foreground/60 mb-4 pl-3">
                Navigation
              </p>

              {/* Standard nav items */}
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-mono font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors border-l-2 border-transparent hover:border-primary"
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.name}
                </Link>
              ))}

              {/* Dashboard shortcut — authorized roles only */}
              {isDashboardUser && (
                <>
                  <div className="my-4 border-t border-border" />
                  <p className="font-mono text-nano tracking-label uppercase text-muted-foreground/60 mb-3 pl-3">
                    Creator Studio
                  </p>
                  <a
                    href={DASHBOARD_URL}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-mono font-bold uppercase tracking-widest text-brand-ember hover:text-brand-ember/80 hover:bg-brand-ember/10 transition-colors border-l-2 border-brand-ember/40 hover:border-brand-ember"
                  >
                    <LayoutDashboard className="size-4 shrink-0" />
                    Dashboard
                  </a>
                </>
              )}
            </nav>

            {/* Auth footer */}
            <div className="border-t border-border bg-secondary/20 p-4 shrink-0 space-y-3">
              {isLoaded && !isAuthenticated && (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="w-full rounded-none font-mono font-bold uppercase tracking-widest"
                    asChild
                  >
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button
                    variant="default"
                    className="w-full rounded-none font-mono font-bold uppercase tracking-widest"
                    asChild
                  >
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}

              {isAuthenticated && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative size-8 shrink-0 border border-border bg-secondary overflow-hidden flex items-center justify-center">
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
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-mono text-foreground truncate">
                        {userProfile?.name || userProfile?.email || "User"}
                      </span>
                      {userProfile?.role === "superadmin" && (
                        <span className="text-nano font-mono tracking-widest uppercase text-brand-ember">
                          Superadmin
                        </span>
                      )}
                      {userProfile?.role === "admin" && (
                        <span className="text-nano font-mono tracking-widest uppercase text-brand-ember">
                          Admin
                        </span>
                      )}
                      {userProfile?.role === "editor" && (
                        <span className="text-nano font-mono tracking-widest uppercase text-brand-ember">
                          Editor
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    aria-label="Sign out"
                  >
                    <LogOut className="size-4" />
                  </button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.nav>
  );
}

export { Navbar };
