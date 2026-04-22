"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react"
import { AuthGatewayLayout } from "@workspace/ui/components/AuthGatewayLayout"

function LoginForm() {
  const searchParams = useSearchParams()
  // Sanitize redirect to same-origin relative paths only (XSS prevention)
  const redirectParam = searchParams.get("redirect")
  const redirectTo =
    redirectParam?.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : "/"

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

    /**
     * Use a hard navigation (window.location) instead of router.push() + router.refresh().
     *
     * We add a slight delay to ensure the @supabase/ssr auth listener has time to
     * write the session into document.cookie. Without this delay, the redirect can
     * fire before the cookie is set, causing a double-login bug.
     */
    setTimeout(() => {
      window.location.replace(redirectTo)
    }, 500)
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
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

function LoginFormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-12 bg-muted rounded-sm"></div>
        <div className="h-10 w-full bg-muted/50 rounded-sm"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-20 bg-muted rounded-sm"></div>
        <div className="h-10 w-full bg-muted/50 rounded-sm"></div>
      </div>
      <div className="h-10 w-full bg-primary/20 rounded-sm mt-6"></div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <AuthGatewayLayout
      portalLabel="Public Archive"
      headingText="Sign In."
      portalDescription="Reader Access"
      versionText="FW_LAB · Identity Protocol v2.4"
      backLinkHref="/"
      showSignUp={true}
    >
      <React.Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </React.Suspense>
    </AuthGatewayLayout>
  )
}
