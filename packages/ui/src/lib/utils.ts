import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns a domain-agnostic URL, preventing localhost bleed in production.
 */
export function getAppUrl(app: "web" | "dashboard"): string {
  // 1. Prioritize explicitly defined environment variables.
  // These should be set in the Vercel Dashboard (Settings -> Environment Variables).
  const envUrl = app === "dashboard" 
    ? process.env.NEXT_PUBLIC_DASHBOARD_URL 
    : process.env.NEXT_PUBLIC_WEB_URL;

  // Only use the envUrl if it's not a localhost address in production
  if (envUrl && (process.env.NODE_ENV !== "production" || !envUrl.includes("localhost"))) {
    return envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
  }

  // 2. Handle Local Development fallback
  const isDev = process.env.NODE_ENV === "development" || !process.env.NEXT_PUBLIC_VERCEL_URL;
  if (isDev) {
    return app === "dashboard" ? "http://localhost:3000" : "http://localhost:3001";
  }

  // 3. Handle Client-Side Fallback
  // If we are already on the correct app, we can use the current origin.
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isDashboardHost = host.includes("dashboard") || host.includes("studio") || host.startsWith("studio.");
    
    if ((app === "dashboard" && isDashboardHost) || (app === "web" && !isDashboardHost)) {
      return window.location.origin;
    }
  }

  // 4. Production Fallback (Brittle without Env Vars)
  // If we reach here, it means we are in production but NEXT_PUBLIC_DASHBOARD_URL/WEB_URL is missing.
  // We use NEXT_PUBLIC_VERCEL_URL which is automatically provided by Vercel.
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL!;

  if (app === "dashboard") {
    const isDashboardDeployment = vercelUrl.includes("dashboard") || vercelUrl.includes("studio");
    if (!isDashboardDeployment) {
      // IMPORTANT: Set NEXT_PUBLIC_DASHBOARD_URL in Vercel Environment Variables
      // to the URL of your deployed dashboard Vercel project.
      // Until then, this fallback will point to the web app which will cause a loop.
      // See: https://vercel.com/docs/environment-variables
      console.warn(
        "[getAppUrl] NEXT_PUBLIC_DASHBOARD_URL is not set. " +
        "Dashboard redirects will fail. " +
        "Please deploy apps/dashboard as a separate Vercel project " +
        "and set NEXT_PUBLIC_DASHBOARD_URL in your Vercel Environment Variables."
      );
      // Return the current origin rather than a non-existent domain
      return typeof window !== "undefined" ? window.location.origin : `https://${vercelUrl}`;
    }
  } else {
    const isDashboardDeployment = vercelUrl.includes("dashboard") || vercelUrl.includes("studio");
    if (isDashboardDeployment) {
      console.warn(
        "[getAppUrl] NEXT_PUBLIC_WEB_URL is not set. " +
        "Please set NEXT_PUBLIC_WEB_URL in your Vercel Environment Variables."
      );
      return typeof window !== "undefined" ? window.location.origin : `https://${vercelUrl}`;
    }
  }

  return `https://${vercelUrl}`;
}
