import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/login(.*)"]);

export const proxy = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // If user is signed in and tries to visit the login page, redirect to stories
  if (userId && isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/stories", req.url));
  }

  // If route is not public and user is not signed in, redirect to login
  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export default proxy;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
