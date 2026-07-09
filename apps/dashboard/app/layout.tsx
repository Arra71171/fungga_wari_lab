import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "@workspace/ui/globals.css";
import { SupabaseAuthProvider } from "@workspace/auth/supabase-provider";
import { cn } from "@workspace/ui/lib/utils";
import { Toaster } from "@workspace/ui/components/sonner";
import { AuthObserver } from "@/components/AuthObserver";

// ── The Attention-Grabber (Headlines)
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  preload: false,
});

// ── The Attention-Grabber (Hero Titles)
const spaceGroteskDisplay = Space_Grotesk({
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: false,
});

// ── The Dashboard Workhorse (UI, Data, Microcopy)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: false,
});

// ── The Dashboard Workhorse (Mono Override for Consistency)
const interMono = Inter({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "Creator Studio — Fungga Wari Lab",
    template: "%s | Creator Studio",
  },
  description: "The Fungga Wari Lab Creator Studio — manage stories, chapters, scenes, and assets for the Meitei folk storytelling platform.",
  robots: {
    // Dashboard is private CMS — must not be indexed by search engines.
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased font-sans flex flex-col min-h-screen",
        spaceGrotesk.variable,
        spaceGroteskDisplay.variable,
        inter.variable,
        interMono.variable,
      )}
    >
      <body suppressHydrationWarning>
        <SupabaseAuthProvider>
          {children}
          <AuthObserver />
          <Toaster />
        </SupabaseAuthProvider>
      </body>
    </html>
  );
}
