"use client"

import React from "react"
import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient, User } from "@supabase/supabase-js"
import { ThemeProvider } from "next-themes"

type AuthContextType = {
  user: User | null
  userProfile: UserProfile | null
  supabase: SupabaseClient
  isLoaded: boolean
  signOut: () => Promise<void>
}

type UserProfile = {
  id: string
  email: string | null
  name: string | null
  alias: string | null
  avatar_url: string | null
  role: string
}

const AuthContext = React.createContext<AuthContextType | null>(null)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = React.useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  )
  const [user, setUser] = React.useState<User | null>(null)
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null)
  const [isLoaded, setIsLoaded] = React.useState(false)

  // Track whether the initial session load is done.
  // onAuthStateChange must not flip isLoaded until after init completes.
  const initializedRef = React.useRef(false)

  const fetchProfile = React.useCallback(async (authUser: User) => {
    const { data } = await supabase
      .from("users")
      .select("id, email, name, alias, avatar_url, role")
      .eq("auth_id", authUser.id)
      .maybeSingle()
    setUserProfile(data as UserProfile | null)
  }, [supabase])

  React.useEffect(() => {
    let mounted = true

    // ── Step 1: Resolve initial session synchronously ──────────────────────────
    // This is the AUTHORITATIVE load. We await fetchProfile before setting
    // isLoaded=true so the dashboard guard never sees a half-loaded state.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      const authUser = session?.user ?? null
      setUser(authUser)
      if (authUser) {
        await fetchProfile(authUser)
      }
      initializedRef.current = true
      if (mounted) setIsLoaded(true)
    })

    // ── Step 2: Listen for subsequent auth state changes ───────────────────────
    // Only fires AFTER initialization is complete. We don't call setIsLoaded
    // again here — it was already set in Step 1 and must not be re-toggled,
    // which was causing the race condition and redirect loop.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return
        const authUser = session?.user ?? null
        setUser(authUser)
        if (authUser) {
          // Defer to avoid re-entering the Supabase client while it
          // still holds its internal auth lock.
          setTimeout(() => {
            if (mounted) void fetchProfile(authUser)
          }, 0)
        } else {
          setUserProfile(null)
        }
        // Only mark as loaded here if initialization somehow missed it
        // (e.g., getSession() returned before the subscription was ready)
        if (!initializedRef.current && mounted) {
          initializedRef.current = true
          setIsLoaded(true)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, userProfile, supabase, isLoaded, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

/** Root auth + theme provider for all apps */
function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}

/** Get the Supabase auth context */
function useSupabaseAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useSupabaseAuth must be used within SupabaseAuthProvider")
  }
  return context
}

/** Get just the user (convenience wrapper) */
function useSupabaseUser() {
  const { user, userProfile, isLoaded } = useSupabaseAuth()
  return { user, userProfile, isLoaded }
}

export { SupabaseAuthProvider, useSupabaseAuth, useSupabaseUser, AuthContext }
export type { AuthContextType, UserProfile }
