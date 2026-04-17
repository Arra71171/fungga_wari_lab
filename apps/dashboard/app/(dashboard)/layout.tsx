"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";
import {
  BookOpen,
  Settings2,
  ListTodo,
  Library,
  LayoutDashboard,
  LogOut,
  Globe,
  ExternalLink,
  Menu,
} from "lucide-react";
import { BrandLogo } from "@workspace/ui/components/BrandLogo";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { AnimatedThemeToggler } from "@workspace/ui/components/animated-theme-toggler";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";

const navItems = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "Manuscripts", href: "/stories", icon: BookOpen },
  { name: "Tasks", href: "/tasks", icon: ListTodo },
  { name: "Assets", href: "/assets", icon: Library },
  { name: "Settings", href: "/settings", icon: Settings2 },
];

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <>
      <div className="p-5 flex items-center h-[72px] shrink-0 border-b border-border-subtle lg:border-none">
        <Link href="/overview" className="hover:opacity-80 transition-opacity">
          <BrandLogo variant="full" size="sm" />
        </Link>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto">
        <div className="text-[9px] font-mono tracking-[0.2em] text-muted-foreground/60 uppercase mb-5 pl-3">
          Creator Studio
        </div>

        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.name} href={item.href} className="block group outline-none">
              <div
                className={cn(
                  "flex items-center px-3 py-2 cursor-pointer transition-all duration-200 rounded-sm",
                  isActive
                    ? "border-l-[3px] border-brand-ember bg-brand-ember/15 text-brand-ember"
                    : "border-l-[3px] border-transparent text-muted-foreground hover:text-foreground hover:bg-bg-surface/50"
                )}
              >
                <item.icon className={cn("mr-3 size-4", isActive ? "text-brand-ember" : "")} />
                <span className={cn("text-sm tracking-wide", isActive ? "font-semibold" : "font-normal")}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}

        <div className="text-[9px] font-mono tracking-[0.2em] text-muted-foreground/60 uppercase mt-8 mb-3 pl-3">
          Public Site
        </div>
        {/* eslint-disable-next-line no-restricted-syntax -- external link, target=_blank requires raw <a> */}
        <a
          href={
            process.env.NEXT_PUBLIC_WEB_URL
              ? `${process.env.NEXT_PUBLIC_WEB_URL}/stories`
              : "http://localhost:3001/stories"
          }
          target="_blank"
          rel="noopener noreferrer"
          className="block group outline-none"
        >
          <div className="flex items-center px-3 py-2 cursor-pointer transition-all duration-200 rounded-sm border-l-[3px] border-transparent text-muted-foreground hover:text-foreground hover:bg-bg-surface/50">
            <Globe className="mr-3 size-4" />
            <span className="text-sm tracking-wide font-normal">View Stories</span>
            <ExternalLink className="ml-auto size-3 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
        </a>
      </nav>

      {/* User Profile & Actions Footer */}
      <div className="border-t border-border-subtle bg-bg-panel p-4 flex flex-col gap-3 shrink-0">
        <UserProfileBlock />

        <div className="flex items-center gap-2">
          <SignOutButton signOutOptions={{ sessionId: undefined }}>
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center rounded-none bg-bg-surface border-border-subtle text-muted-foreground hover:text-foreground hover:border-border hover:bg-bg-surface/80"
              onClick={() => toast.info("Signing Out", { description: "Re-sealing the archive..." })}
            >
              <LogOut className="size-4 mr-2" />
              <span className="font-mono text-[10px] uppercase tracking-widest">Sign Out</span>
            </Button>
          </SignOutButton>

          <div className="shrink-0 border border-border-subtle bg-bg-surface flex items-center justify-center size-[34px] hover:border-border transition-colors">
            <AnimatedThemeToggler />
          </div>
        </div>
      </div>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-bg-base text-foreground">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "w-[240px] hidden lg:flex flex-col border-r border-border-subtle",
          "bg-bg-panel z-50 sticky top-0 h-screen shrink-0"
        )}
      >
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Main Content Area - CMS Workspace */}
      <main className="flex-1 w-full relative h-screen flex flex-col min-w-0 bg-bg-base">
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center h-[60px] px-4 border-b border-border-subtle bg-bg-panel shrink-0 sticky top-0 z-40">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden mr-2">
                <Menu className="size-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 flex flex-col bg-bg-panel border-r-border-subtle">
              <SheetHeader className="p-0 text-left">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              </SheetHeader>
              <SidebarContent pathname={pathname} />
            </SheetContent>
          </Sheet>

          <div className="flex-1 flex items-center justify-center md:justify-start lg:hidden">
            <Link href="/overview" className="hover:opacity-80 transition-opacity">
              <BrandLogo variant="full" size="sm" />
            </Link>
          </div>
        </header>

        <div className="flex-1 w-full h-full overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

// ─── Custom User Profile Block ────────────────────────────────────────────────
// Uses Clerk's useUser() only — no Supabase query needed for the sidebar widget.
// Full profile data (alias, custom avatar) can be fetched in the /settings page.

function UserProfileBlock() {
  const { user: clerkUser } = useUser();

  if (!clerkUser) return null;

  const avatarUrl = clerkUser.imageUrl;
  const displayName =
    clerkUser.fullName ||
    clerkUser.primaryEmailAddress?.emailAddress ||
    "Archive Admin";
  const userRoleStr =
    (clerkUser.publicMetadata?.role as string) === "admin" ? "Admin" : "Creator";

  return (
    <div className="flex items-center gap-3">
      <div className="relative size-8 shrink-0 bg-secondary border border-border overflow-hidden">
        <Image
          src={avatarUrl}
          alt="Avatar"
          fill
          sizes="32px"
          className="object-cover grayscale opacity-80"
        />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-mono text-foreground truncate h-4 leading-none">
          {displayName}
        </span>
        <span className="text-[9px] font-mono tracking-widest text-brand-ember uppercase h-3 leading-none mt-1">
          {userRoleStr}
        </span>
      </div>
    </div>
  );
}
