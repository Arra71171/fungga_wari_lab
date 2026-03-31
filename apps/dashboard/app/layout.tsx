import type { Metadata } from "next";
import { JetBrains_Mono, Bacasime_Antique, Instrument_Serif, Gentium_Plus } from "next/font/google";
import "@workspace/ui/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ConvexClerkProvider } from "@workspace/auth/convex-provider";
import { cn } from "@workspace/ui/lib/utils";

// ── Folk-story heading: Literary, old-style serif with modern screen discipline
const bacasimeAntique = Bacasime_Antique({
  weight: "400",
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

// ── Body serif: Humanist, open, multilingual-ready (Meitei cultural content)
const gentiumPlus = Gentium_Plus({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// ── Mono: Keep JetBrains Mono for IDs, tags, metadata
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Dashboard - Fungga Wari Lab",
  description: "Creator and Team Workspace",
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
        bacasimeAntique.variable,
        instrumentSerif.variable,
        gentiumPlus.variable,
        jetbrainsMono.variable,
      )}
    >
      <body>
        <ConvexClerkProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </ConvexClerkProvider>
      </body>
    </html>
  );
}

