import type { Metadata } from "next"
import { JetBrains_Mono, Cinzel, Instrument_Serif, Cardo } from "next/font/google"

import "@workspace/ui/globals.css"
import { SupabaseAuthProvider } from "@workspace/auth/supabase-provider"
import { cn } from "@workspace/ui/lib/utils"
import { Toaster } from "@workspace/ui/components/sonner"
import { NoiseOverlay } from "@workspace/ui/components/NoiseOverlay"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
// ── Folk-story serif body: warm, literary feel for the reader experience
const cardo = Cardo({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

// ── Folk-story heading: mythological, cinematic vibe (Cinzel Decorative feel)
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
})

// ── Display type: high-contrast condensed serif for hero section titles
const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

// ── Mono: JetBrains Mono for IDs, tags, metadata labels
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://funggawari.com"),
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
        cardo.variable,
        jetbrainsMono.variable,
        cinzel.variable,
        instrumentSerif.variable
      )}
    >
      <body suppressHydrationWarning>
        <NoiseOverlay opacity={0.03} />
        <SupabaseAuthProvider>
          {children}
          <Toaster />
        </SupabaseAuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
