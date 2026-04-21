import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns a domain-agnostic URL, preventing localhost bleed in production.
 */
export function getAppUrl(app: "web" | "dashboard"): string {
  const url = app === "web" 
    ? process.env.NEXT_PUBLIC_WEB_URL 
    : process.env.NEXT_PUBLIC_DASHBOARD_URL;

  // In development, return the configured URL or fallback to standard local ports
  if (process.env.NODE_ENV === "development") {
    return url || (app === "web" ? "http://localhost:3001" : "http://localhost:3000");
  }

  // In production, aggressively ignore "localhost" configurations (often copied accidentally)
  if (url && !url.includes("localhost")) {
    return url;
  }

  // If running on Vercel and no valid URL is found, fallback to the dynamic Vercel origin.
  // Note: If apps are deployed separately, users MUST configure the NEXT_PUBLIC_* variables in Vercel.
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    // Prevent cross-app routing errors when variables are missing
    const isDashboardDeployment = process.env.NEXT_PUBLIC_VERCEL_URL.includes("dashboard") || process.env.NEXT_PUBLIC_VERCEL_URL.includes("studio");
    
    if (app === "dashboard" && !isDashboardDeployment) {
      return "https://funggawari-dashboard.vercel.app";
    }
    if (app === "web" && isDashboardDeployment) {
      return "https://funggawari.vercel.app";
    }
    
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // Absolute fallback
  return "/";
}
