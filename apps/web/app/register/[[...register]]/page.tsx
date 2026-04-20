"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { BrandLogo } from "@workspace/ui/components/BrandLogo"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Eye, EyeOff, UserPlus, Loader2 } from "lucide-react"

function RegisterForm() {
  const router = useRouter()

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
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
    setSuccess(null)
    setIsLoading(true)

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setIsLoading(false)
      return
    }

    if (signUpData.session) {
      // Session exists — email confirmation is disabled, user is authenticated
      setIsLoading(false)
      router.push("/")
      router.refresh()
    } else {
      // Email confirmation required — Supabase default
      setIsLoading(false)
      setSuccess("Account created! Please check your email to confirm your address before signing in.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
          Name
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Folklore Keeper"
          required
          minLength={2}
          autoComplete="name"
          className="bg-bg-surface border-border font-mono text-sm"
        />
      </div>

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
            minLength={6}
            autoComplete="new-password"
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

      {success && (
        <div className="bg-primary/10 border border-primary/30 text-primary text-xs font-mono px-3 py-2 rounded-sm">
          {success}
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
          <UserPlus className="size-4 mr-2" />
        )}
        {isLoading ? "Creating..." : "Join the Archive"}
      </Button>
    </form>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Brand */}
        <div className="flex flex-col items-center gap-4">
          <BrandLogo variant="full" size="md" />
          <div className="space-y-1 text-center">
            <h1 className="font-heading text-xl tracking-tight text-foreground">
              Join the Archive
            </h1>
            <p className="font-mono text-xs tracking-wide text-muted-foreground">
              Become a keeper of folklore
            </p>
          </div>
        </div>

        {/* Register Form */}
        <div className="border border-border bg-card p-6 shadow-brutal-sm">
          <RegisterForm />
        </div>

        {/* Login Link */}
        <p className="text-center text-xs font-mono text-muted-foreground">
          Already a keeper?{" "}
          <Link
            href="/login"
            className="text-brand-ember hover:text-brand-ochre transition-colors underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
