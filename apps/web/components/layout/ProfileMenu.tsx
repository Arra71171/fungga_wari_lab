"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  LogOut,
  User,
  LayoutDashboard,
  CreditCard,
  Moon,
  Sun,
} from "lucide-react"

// Types to decouple from exact Auth provider implementation if needed
interface UserProfile {
  name?: string | null
  email?: string | null
  avatar_url?: string | null
  role?: string | null
}

interface ProfileMenuProps {
  userProfile?: UserProfile | null
  onSignOut: () => void
  createPortalSessionAction: () => void
}

const DASHBOARD_URL = "/dashboard"

export function ProfileMenu({
  userProfile,
  onSignOut,
  createPortalSessionAction,
}: ProfileMenuProps) {
  const { setTheme, resolvedTheme } = useTheme()
  
  const isDashboardUser = ["admin", "superadmin", "editor"].includes(
    userProfile?.role || ""
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        <div className="relative size-8 border border-border/50 bg-secondary overflow-hidden rounded-none flex items-center justify-center transition-colors hover:border-primary">
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
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 font-sans">
        <DropdownMenuLabel className="font-mono flex flex-col space-y-1 p-3">
          <span className="text-sm font-semibold tracking-wide text-foreground truncate">
            {userProfile?.name || userProfile?.email || "User"}
          </span>
          {userProfile?.role && ["admin", "superadmin", "editor"].includes(userProfile.role) && (
            <span className="text-[10px] tracking-widest text-brand-ember uppercase">
              {userProfile.role}
            </span>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          {isDashboardUser && (
            <DropdownMenuItem asChild>
              <Link href={DASHBOARD_URL} className="cursor-pointer">
                <LayoutDashboard className="mr-2 size-4" />
                Creator Studio
              </Link>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem asChild>
            <form action={createPortalSessionAction} className="w-full">
              <button type="submit" className="flex w-full items-center cursor-pointer">
                <CreditCard className="mr-2 size-4" />
                Billing & Access
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? (
              <Sun className="mr-2 size-4" />
            ) : (
              <Moon className="mr-2 size-4" />
            )}
            Toggle Theme
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 size-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
