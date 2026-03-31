"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { BookOpen, CheckSquare, Settings, LogOut, Users } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { BrandLogo } from "@workspace/ui/components/BrandLogo";

const navItems = [
  { name: "Stories", href: "/stories", icon: BookOpen },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Team", href: "/settings", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <div className="flex w-64 flex-col border-r border-border bg-background">
      <div className="p-6">
        <Link
          href={process.env.NEXT_PUBLIC_LANDING_URL || "http://localhost:3001"}
          className="group flex items-center gap-3 transition-opacity hover:opacity-80"
          aria-label="Return to Landing Page"
        >
          <BrandLogo
            variant="full"
            size="md"
            className="transition-all group-hover:opacity-90"
          />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start font-heading text-sm tracking-wide transition-all",
                  isActive ? "bg-primary/10 text-primary font-bold shadow-sm" : "hover:text-primary"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start font-mono text-muted-foreground hover:text-destructive"
          onClick={() => void signOut({ redirectUrl: "/login" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
