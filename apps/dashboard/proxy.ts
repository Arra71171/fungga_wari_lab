import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(['/login(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const authObj = await auth();
    
    // 1. Protect route via Clerk
    if (!authObj.userId) {
      await auth.protect();
      return;
    }

    // 2. Fetch role from Supabase users table via REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Try to get the Clerk JWT for Supabase to respect RLS
    let clerkToken: string | null = null;
    try {
      clerkToken = await authObj.getToken({ template: "supabase" });
    } catch {
      console.warn("Clerk supabase template not configured");
    }

    if (supabaseUrl && anonKey && clerkToken) {
      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/users?clerk_id=eq.${authObj.userId}&select=role`,
          {
            headers: {
              apikey: anonKey,
              Authorization: `Bearer ${clerkToken}`,
            },
            cache: "no-store",
          }
        );

        if (response.ok) {
          const data = await response.json();
          // If user not found or not a superadmin, redirect to public web site
          if (!data || data.length === 0 || data[0].role !== 'superadmin') {
            const webUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3001";
            return NextResponse.redirect(new URL(webUrl));
          }
        }
      } catch (error) {
        console.error("Failed to verify admin role in proxy:", error);
      }
    }
  }
});
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
