import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Only the login page is public on the dashboard.
// Next.js 15 includes the basePath in req.nextUrl.pathname, so we must
// match both the bare path (edge cases) and the basePath-prefixed path.
const publicRoutes = ["/login", "/dashboard/login"]

function isPublicRoute(pathname: string) {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))
}

export default async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect unauthenticated users to login
  if (!user && !isPublicRoute(req.nextUrl.pathname)) {
    const redirectResponse = NextResponse.redirect(new URL("/dashboard/login", req.url))
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  // Redirect authenticated users away from login
  if (user && isPublicRoute(req.nextUrl.pathname)) {
    // If they have an unauthorized error, stay on the login page to show the error
    if (req.nextUrl.searchParams.get("error") === "unauthorized") {
      return supabaseResponse
    }

    const redirectResponse = NextResponse.redirect(new URL("/dashboard/overview", req.url))
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  // Enforce role-based access control for dashboard routes
  if (user && !isPublicRoute(req.nextUrl.pathname)) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("auth_id", user.id)
      .single()

    if (!profile || !["admin", "superadmin", "editor"].includes(profile.role)) {
      const redirectResponse = NextResponse.redirect(new URL("/dashboard/login?error=unauthorized", req.url))
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })
      return redirectResponse
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
