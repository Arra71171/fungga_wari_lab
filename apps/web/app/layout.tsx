import type { Metadata } from "next"
import { JetBrains_Mono, Inter, Outfit, Instrument_Serif, Noto_Sans_Meetei_Mayek } from "next/font/google"

import "@workspace/ui/globals.css"
import { SupabaseAuthProvider } from "@workspace/auth/supabase-provider"
import { cn } from "@workspace/ui/lib/utils"
import { Toaster } from "@workspace/ui/components/sonner"
import { NoiseOverlay } from "@workspace/ui/components/NoiseOverlay"
import { AuthObserver } from "@/components/AuthObserver"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

// ── Clean Sans for body text (Nordic Minimalist)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: false,
})

// ── Geometric Sans for headers (Nordic Minimalist)
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  preload: false,
})

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: false,
})

// ── Mono: JetBrains Mono for IDs, tags, metadata labels
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
        inter.variable,
        jetbrainsMono.variable,
        outfit.variable,
        instrumentSerif.variable,
        meeteiMayek.variable
      )}
    >
      <body suppressHydrationWarning>
        <NoiseOverlay opacity={0.03} />
        <SupabaseAuthProvider>
          {children}
          <AuthObserver />
          <Toaster />
        </SupabaseAuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
