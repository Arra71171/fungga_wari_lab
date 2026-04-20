"use client"

import React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { cn } from "@workspace/ui/lib/utils"
import { BrandLogo } from "@workspace/ui/components/BrandLogo"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/"

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const supabase = React.useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setIsLoading(false)
      return
    }

    // Check if the user is a superadmin and redirect accordingly
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("auth_id", user.id)
        .maybeSingle()

      if (profile?.role === "superadmin") {
        const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3000"
        window.location.href = dashboardUrl
        return
      }
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="keeper@fungga-wari.com"
          required
          autoComplete="email"
          className="bg-bg-surface border-border font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="bg-bg-surface border-border font-mono text-sm pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-xs font-mono px-3 py-2 rounded-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full font-mono text-xs tracking-widest uppercase"
      >
        {isLoading ? (
          <Loader2 className="size-4 mr-2 animate-spin" />
        ) : (
          <LogIn className="size-4 mr-2" />
        )}
        {isLoading ? "Entering..." : "Enter the Archive"}
      </Button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Brand */}
        <div className="flex flex-col items-center gap-4">
          <BrandLogo variant="full" size="md" />
          <div className="space-y-1 text-center">
            <h1 className="font-heading text-xl tracking-tight text-foreground">
              Welcome Back
            </h1>
            <p className="font-mono text-xs tracking-wide text-muted-foreground">
              Enter the folklore archive
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="border border-border bg-card p-6 shadow-brutal-sm">
          <React.Suspense fallback={null}>
            <LoginForm />
          </React.Suspense>
        </div>

        {/* Register Link */}
        <p className="text-center text-xs font-mono text-muted-foreground">
          New to the archive?{" "}
          <Link
            href="/register"
            className="text-brand-ember hover:text-brand-ochre transition-colors underline underline-offset-4"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
