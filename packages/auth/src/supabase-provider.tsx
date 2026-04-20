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
    const { data } = await supabase
      .from("users")
      .select("id, email, name, alias, avatar_url, role")
      .eq("auth_id", authUser.id)
      .maybeSingle()
    setUserProfile(data as UserProfile | null)
  }, [supabase])

  React.useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const authUser = session?.user ?? null
      setUser(authUser)
      setIsLoaded(true)
      if (authUser) fetchProfile(authUser)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const authUser = session?.user ?? null
        setUser(authUser)
        setIsLoaded(true)
        if (authUser) {
          fetchProfile(authUser)
        } else {
          setUserProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
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
