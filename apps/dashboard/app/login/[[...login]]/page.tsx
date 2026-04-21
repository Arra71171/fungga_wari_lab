"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGatewayLayout } from "@workspace/ui/components/AuthGatewayLayout";
import { useSupabaseAuth } from "@workspace/auth/supabase-provider";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { getAppUrl } from "@workspace/ui/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") ?? "/overview";
  const { supabase, user, isLoaded } = useSupabaseAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // If already logged in and no unauthorized error, redirect
  React.useEffect(() => {
    const isUnauthorized = searchParams.get("error") === "unauthorized";
    if (isLoaded && user && !isUnauthorized) {
      router.replace(redirectUrl);
    }
  }, [isLoaded, user, router, redirectUrl, searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error("Authentication Failed", {
          description: error.message,
        });
        return;
      }

      toast.success("Identity Verified", {
        description: "Access granted to the Forge.",
      });

      router.replace(redirectUrl);
      router.refresh();
    } catch {
      toast.error("Connection Error", {
        description: "Unable to reach authentication server.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthGatewayLayout
      portalLabel="Creator Studio"
      headingText="Access the Forge."
      portalDescription="Warekeepers Only"
      versionText="FW_LAB · Identity Protocol v2.4"
      backLinkHref={getAppUrl("web")}
      showSignUp={false}
    >
      <form onSubmit={handleSubmit} className="mt-4 w-full flex flex-col space-y-4">
        {searchParams.get("error") === "unauthorized" && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 font-mono">
            Unauthorized Access. Your account does not have permission to enter the Creator Studio.
          </div>
        )}
        {/* Email Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="dashboard-email"
            className="font-mono text-tight-label text-muted-foreground uppercase tracking-subtle"
          >
            Email Address
          </label>
          <input
            id="dashboard-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-10 rounded-none border border-border bg-cinematic-bg/80 px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/35 transition-all duration-200 focus:border-primary focus:bg-primary/5 outline-none"
            placeholder="your@email.com"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="dashboard-password"
            className="font-mono text-tight-label text-muted-foreground uppercase tracking-subtle"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="dashboard-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-10 rounded-none border border-border bg-cinematic-bg/80 px-3 pr-10 font-mono text-sm text-foreground placeholder:text-muted-foreground/35 transition-all duration-200 focus:border-primary focus:bg-primary/5 outline-none"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !email || !password}
          className="w-full rounded-none bg-primary text-primary-foreground font-mono text-tight-label font-black uppercase tracking-loose h-11 hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "ACCESSING..." : "ACCESS ARCHIVE"}
        </button>
      </form>
    </AuthGatewayLayout>
  );
}
