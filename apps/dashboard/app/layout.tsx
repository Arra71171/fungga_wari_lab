import type { Metadata } from "next";
import { JetBrains_Mono, Cinzel, Instrument_Serif, Poppins } from "next/font/google";
import "@workspace/ui/globals.css";
import { ClerkAuthProvider } from "@workspace/auth/clerk-provider";
import { cn } from "@workspace/ui/lib/utils";
import { SyncUserStore } from "@/components/sync-user";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@workspace/ui/components/sonner";
import { AuthObserver } from "@/components/AuthObserver";

// ── Folk-story heading: Literary, cinematic vibe (Mythological feel)
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

// ── Display type: High-contrast, condensed serif for section hero titles
const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// ── Dashboard body: Geometric, modern UI contrast
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// ── Mono: Keep JetBrains Mono for IDs, tags, metadata
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

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
        "dark antialiased font-sans flex flex-col min-h-screen",
        cinzel.variable,
        instrumentSerif.variable,
        poppins.variable,
        jetbrainsMono.variable,
      )}
    >
      <body suppressHydrationWarning>
        <ClerkAuthProvider>
          <ThemeProvider>
            <SyncUserStore />
            <AuthObserver />
            {children}
            <Toaster />
          </ThemeProvider>
        </ClerkAuthProvider>
      </body>
    </html>
  );
}
