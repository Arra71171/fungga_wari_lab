import { clerkMiddleware } from "@clerk/nextjs/server";

// The Reader app is entirely public with optional auth.
// Authorization for stories is handled at the component level by PaywallGate.

export default clerkMiddleware(async (auth, req) => {
  // No globally protected routes in the public web app.
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
