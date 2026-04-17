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
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/users?clerk_id=eq.${authObj.userId}&select=role`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // If user not found or not an admin, redirect to public web site
          if (!data || data.length === 0 || data[0].role !== 'admin') {
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
