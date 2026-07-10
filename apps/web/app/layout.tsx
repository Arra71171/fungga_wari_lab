import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans, Noto_Sans_Meetei_Mayek } from "next/font/google"

import "@workspace/ui/globals.css"
import { SupabaseAuthProvider } from "@workspace/auth/supabase-provider"
import { cn } from "@workspace/ui/lib/utils"
import { Toaster } from "@workspace/ui/components/sonner"
import { NoiseOverlay } from "@workspace/ui/components/NoiseOverlay"
import { AuthObserver } from "@/components/AuthObserver"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { PaymentSuccessHandler } from "@/components/story/PaymentSuccessHandler"
import React from "react"

// ── The Storyteller (Subheadings, captions, body copy)
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: false,
})

// ── Mono Override for Consistency
const dmSansMono = DM_Sans({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
})

// ── The Attention-Grabber (Headlines)
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  preload: false,
})

// ── The Attention-Grabber (Story Titles, Hero Text)
const spaceGroteskDisplay = Space_Grotesk({
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: false,
})

const meeteiMayek = Noto_Sans_Meetei_Mayek({
  weight: ["400", "700"],
  subsets: ["meetei-mayek"],
  variable: "--font-meetei",
  display: "swap",
  preload: false,
})

export const metadata: Metadata = {
  title: {
    default: "Fungga Wari Lab — Folk Stories of Meitei Culture",
    template: "%s | Fungga Wari Lab",
  },
  description:
    "An immersive digital storytelling platform preserving and celebrating Meitei folk narratives. Explore illustrated stories, branching tales, and cinematic reader experiences.",
  keywords: ["Meitei", "folk stories", "Manipuri", "oral tradition", "digital storytelling", "Fungga Wari"],
  authors: [{ name: "Fungga Wari Lab" }],
  creator: "Fungga Wari Lab",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://funggawari.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Fungga Wari Lab",
    title: "Fungga Wari Lab — Folk Stories of Meitei Culture",
    description:
      "Immersive digital storytelling preserving Meitei folk narratives through illustrated branching stories.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fungga Wari Lab",
    description: "Meitei folk stories, reimagined for the digital age.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased font-sans flex flex-col min-h-screen",
        dmSans.variable,
        dmSansMono.variable,
        spaceGrotesk.variable,
        spaceGroteskDisplay.variable,
        meeteiMayek.variable
      )}
    >
      <body suppressHydrationWarning className="bg-premium-mesh">
        <NoiseOverlay opacity={0.03} />
        <SupabaseAuthProvider>
          {children}
          <React.Suspense fallback={null}>
            <PaymentSuccessHandler />
          </React.Suspense>
          <AuthObserver />
          <Toaster />
        </SupabaseAuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
