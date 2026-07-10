"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";

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
  CreditCard,
} from "lucide-react";

import { createCustomerPortalSession } from "@/actions/paywallActions";
import { ProfileMenu } from "./ProfileMenu";

const navItems = [
  { name: "Library", href: "/stories", icon: BookOpen },
  { name: "Pricing", href: "/pricing", icon: CreditCard },
  { name: "System", href: "/#features", icon: Home },
  { name: "Community", href: "/#community", icon: Users },
  { name: "Folklore", href: "/#archive", icon: Library },
];

// Dashboard is now served via Next.js rewrites on the same origin.
// This solves the cross-origin cookie limitation on .vercel.app domains.
const DASHBOARD_URL = "/dashboard";

function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user, userProfile, isLoaded, signOut } = useSupabaseAuth();

  useMotionValueEvent(scrollY, "change", (latest: number) => {
    const previous = scrollY.getPrevious() || 0;
    
    // Smart Header Logic: Hide on scroll down after 150px, show on scroll up
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    
    setScrolled(latest > 20);
  });

  const isDashboardUser = ["admin", "superadmin", "editor"].includes(userProfile?.role || "");
  const isAuthenticated = isLoaded && !!user;

  async function handleSignOut() {
    await signOut();
    setMobileOpen(false);
    // Use hard navigation to ensure cookie cleanup completes before redirect
    window.location.replace("/");
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: hidden ? -100 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-shadow duration-300",
        "bg-background border-b border-border",
        scrolled ? "shadow-nordic-sm" : ""
      )}
    >
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 lg:px-20 py-3 flex items-center justify-between">
        {/* Brand — compact on mobile: icon + stacked wordmark to prevent wrap */}
        <Link
          href="/"
          className="hover:opacity-80 transition-opacity shrink-0 flex items-center gap-3"
          aria-label="Fungga Wari Lab — Home"
        >
          {/* Icon glyph — circular */}
          <span className="inline-flex shrink-0 items-center justify-center rounded-none border border-border bg-secondary/30 size-8 text-foreground">
            <FungaMark size={14} />
          </span>
          {/* Mobile wordmark */}
          <span className="flex flex-col leading-none md:hidden" aria-hidden="true">
            <span className="font-meetei font-black tracking-wide text-fine text-foreground">
              ꯐꯨꯡꯒꯥ ꯋꯥꯔꯤ
            </span>
            <span className="font-serif font-bold text-nano text-muted-foreground/80 tracking-wider mt-0.5">
              .Lab
            </span>
          </span>
          {/* Desktop wordmark */}
          <span className="hidden md:inline-flex items-center gap-1 leading-none">
            <span className="font-meetei font-black tracking-wide text-base text-foreground">
              ꯐꯨꯡꯒꯥ ꯋꯥꯔꯤ
            </span>
            <span className="font-serif font-bold text-xs text-muted-foreground/80 opacity-90">
              .Lab
            </span>
          </span>
        </Link>

        {/* ── Desktop nav links ─────────────────────────────────────── */}
        <div className="hidden items-center gap-2 md:flex border-l border-border/50 pl-6 h-8">
          {navItems.map((item) => {
            const isCollections = item.name === "Folklore";
            const showDashboard = isCollections && isDashboardUser;
            const href = showDashboard ? DASHBOARD_URL : item.href;
            const name = showDashboard ? "Dashboard" : item.name;

            if (showDashboard) {
              return (
                /* eslint-disable-next-line no-restricted-syntax -- DASHBOARD_URL is cross-origin; next/link cannot be used */
                <a
                  key={item.name}
                  href={href}
                  className="px-4 py-1.5 text-xs font-mono tracking-widest uppercase text-muted-foreground hover:bg-foreground hover:text-background transition-colors"
                >
                  {name}
                </a>
              );
            }

            return (
              <Link
                key={item.name}
                href={href}
                className="px-4 py-1.5 text-xs font-mono tracking-widest uppercase text-muted-foreground hover:bg-foreground hover:text-background transition-colors"
              >
                {name}
              </Link>
            );
          })}
        </div>

        {/* ── Desktop auth controls ─────────────────────────────────── */}
        <div className="ml-2 hidden md:flex items-center gap-4">
          {isLoaded && !isAuthenticated && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="font-mono text-xs tracking-widest uppercase rounded-none transition-all hover:bg-foreground hover:text-background text-muted-foreground"
                asChild
              >
                <Link href="/login">SIGN IN</Link>
              </Button>
              <Button
                variant="default"
                size="sm"
                className="font-mono text-xs tracking-widest uppercase rounded-none transition-all bg-primary text-primary-foreground hover:bg-primary/90"
                asChild
              >
                <Link href="/register">SIGN UP</Link>
              </Button>
              <div className="pl-2 border-l border-border h-6 flex items-center">
                <AnimatedThemeToggler />
              </div>
            </>
          )}
          {isAuthenticated && (
            <ProfileMenu
              userProfile={userProfile}
              onSignOut={handleSignOut}
              createPortalSessionAction={createCustomerPortalSession}
            />
          )}
        </div>

        {/* ── Mobile right side: theme + hamburger ──────────────────── */}
        <div className="ml-auto flex items-center gap-3 md:hidden">
          <AnimatedThemeToggler />

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open navigation menu"
                className="flex items-center justify-center size-10 rounded-none border border-border/50 bg-background text-foreground hover:bg-secondary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-[280px] p-0 flex flex-col bg-background border-r border-border"
              aria-describedby={undefined}
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
                    className="flex items-center gap-3 px-3 py-3 text-xs font-mono tracking-widest uppercase text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors border-l-2 border-transparent hover:border-primary"
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
                    {/* eslint-disable-next-line no-restricted-syntax -- DASHBOARD_URL is cross-origin; next/link cannot be used */}
                    <a
                      href={DASHBOARD_URL}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 text-xs font-mono tracking-widest uppercase text-brand-ember hover:text-brand-ember/80 hover:bg-brand-ember/10 transition-colors border-l-2 border-brand-ember/40 hover:border-brand-ember"
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
                      className="w-full font-mono text-xs tracking-widest uppercase"
                      asChild
                    >
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        SIGN IN
                      </Link>
                    </Button>
                    <Button
                      variant="default"
                      className="w-full font-mono text-xs tracking-widest uppercase"
                      asChild
                    >
                      <Link href="/register" onClick={() => setMobileOpen(false)}>
                        SIGN UP
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
                            alt={`${userProfile.name || "User"}'s avatar`}
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
                          <span className="text-nano font-sans font-medium tracking-wide text-brand-ember">
                            Superadmin
                          </span>
                        )}
                        {userProfile?.role === "admin" && (
                          <span className="text-nano font-sans font-medium tracking-wide text-brand-ember">
                            Admin
                          </span>
                        )}
                        {userProfile?.role === "editor" && (
                          <span className="text-nano font-sans font-medium tracking-wide text-brand-ember">
                            Editor
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <form action={createCustomerPortalSession}>
                        <button
                          type="submit"
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label="Manage Billing"
                          title="Manage Billing"
                        >
                          <CreditCard className="size-4" />
                        </button>
                      </form>
                      <button
                        onClick={handleSignOut}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="Sign out"
                      >
                        <LogOut className="size-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
}

export { Navbar };
