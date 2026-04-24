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

  const fetchProfile = React.useCallback(async (authUser: User) => {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, name, alias, avatar_url, role")
      .eq("auth_id", authUser.id)
      .maybeSingle()
    if (error) {
      // Non-fatal: user row may not exist yet (first sign-in before sync trigger runs)
      console.warn("[Auth] fetchProfile error:", error.message)
    }
    setUserProfile(data as UserProfile | null)
  }, [supabase])

  React.useEffect(() => {
    let mounted = true

    /**
     * Auth initialization strategy — two-phase to avoid IndexedDB lock contention:
     *
     * Phase 1 (instant): onAuthStateChange fires INITIAL_SESSION synchronously
     *   from the cached localStorage session — sets user state and marks isLoaded
     *   immediately so the UI can render without waiting for a network round-trip.
     *
     * Phase 2 (background): After a 50ms delay, getUser() validates the session
     *   server-side. We delay to avoid racing with the subscription's internal
     *   token-refresh which steals the IndexedDB lock if called simultaneously.
     *   If the lock is stolen anyway, we catch the AbortError gracefully — the
     *   session is already correctly set by Phase 1.
     */
    async function validateSessionServerSide() {
      // Short delay so the subscription's INITIAL_SESSION handler fully releases
      // the Supabase internal auth lock before we attempt getUser().
      await new Promise<void>((resolve) => setTimeout(resolve, 50))
      if (!mounted) return

      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser()
        if (!mounted) return

        if (error) {
          // AbortError = lock contention — session already set by INITIAL_SESSION
          // This is non-fatal; the listener handles state correctly.
          if (error.name === "AbortError" || error.message?.includes("steal")) {
            console.warn("[Auth] getUser lock contention — session managed by auth listener")
            return
          }
          if (error.name === "AuthSessionMissingError" || error.message?.includes("Auth session missing!")) {
            // Normal state for unauthenticated users
            return
          }
          // Network errors surfaced as AuthApiError — treat as transient
          if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
            console.warn("[Auth] getUser network error — session managed by auth state listener")
            return
          }
          console.error("[Auth] getUser error:", error.message)
          return
        }

        // Server-validated user — override any stale cached session value
        setUser(authUser)
        if (authUser) {
          await fetchProfile(authUser)
        } else {
          setUserProfile(null)
        }
      } catch (err) {
        if (!(err instanceof Error)) {
          console.error("[Auth] Unexpected non-Error thrown:", err)
          return
        }
        // AbortError = IndexedDB lock contention — non-fatal
        if (err.name === "AbortError") {
          console.warn("[Auth] getUser aborted — session managed by auth state listener")
          return
        }
        // TypeError: Failed to fetch = transient browser network failure.
        // Session state is already correct via INITIAL_SESSION + server proxy.
        if (err instanceof TypeError || err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
          console.warn("[Auth] getUser network error — session managed by auth state listener")
          return
        }
        console.error("[Auth] Unexpected error during session validation:", err)
      }
    }

    // Phase 1: Subscribe first — INITIAL_SESSION fires synchronously with cached session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        const authUser = session?.user ?? null

        if (event === "INITIAL_SESSION") {
          // Set user state from cached session immediately — no network required
          setUser(authUser)
          if (authUser) {
            await fetchProfile(authUser)
          }
          // Mark auth as loaded so UI can render immediately
          if (mounted) setIsLoaded(true)
          return
        }

        // Subsequent events: sign in, sign out, token refresh
        setUser(authUser)

        if (authUser) {
          // Defer to let Supabase release its internal auth lock before another request
          setTimeout(() => {
            if (mounted) void fetchProfile(authUser)
          }, 0)
        } else {
          setUserProfile(null)
        }
      }
    )

    // Phase 2: Background server-side validation (non-blocking)
    void validateSessionServerSide()

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
