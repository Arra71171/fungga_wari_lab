import { Geist, JetBrains_Mono, DM_Sans } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ConvexClerkProvider } from "@workspace/auth/convex-provider"
import { cn } from "@workspace/ui/lib/utils";

const dmSansHeading = DM_Sans({subsets:['latin'],variable:'--font-heading'});

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased font-sans flex flex-col min-h-screen", fontSans.variable, jetbrainsMono.variable, dmSansHeading.variable)}
    >
      <body suppressHydrationWarning>
        <ConvexClerkProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </ConvexClerkProvider>
      </body>
    </html>
  )
}
