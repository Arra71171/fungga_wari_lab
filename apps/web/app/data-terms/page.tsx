import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { ArrowLeft } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

export const metadata: Metadata = {
  title: "Data Terms — Fungga Wari Lab",
  description: "Data terms, privacy policy, and usage guidelines for the Fungga Wari Lab platform.",
}

export default function DataTermsPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      <main className="pt-28 pb-20 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-[2px] w-8 bg-primary" />
            <span className="text-fine font-mono uppercase tracking-ultra text-primary font-bold">
              Legal
            </span>
          </div>

          {/* Title */}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.9] text-foreground mb-6">
            Data <span className="italic text-primary">Terms</span>
          </h1>

          <p className="text-sm text-muted-foreground font-mono leading-relaxed max-w-2xl mb-12">
            Our commitment to data transparency, user privacy, and cultural heritage protection.
          </p>

          {/* Effective date */}
          <div className="inline-flex items-center gap-2 border border-border bg-secondary/30 px-4 py-2 mb-12">
            <span className="font-mono text-nano uppercase tracking-caps text-foreground font-bold">
              Effective: January 2026
            </span>
          </div>

          {/* Terms sections */}
          <div className="space-y-10">
            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-4 border-l-4 border-primary pl-4">
                1. Data Collection
              </h2>
              <div className="pl-4 space-y-3 text-sm font-mono text-muted-foreground leading-relaxed">
                <p>We collect only essential data required for platform functionality:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Email address and display name for authentication</li>
                  <li>User role assignments for access control</li>
                  <li>Content contributions submitted through the Creator Studio</li>
                  <li>Anonymous usage analytics for performance optimization</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-4 border-l-4 border-primary pl-4">
                2. Cultural Content Ownership
              </h2>
              <div className="pl-4 space-y-3 text-sm font-mono text-muted-foreground leading-relaxed">
                <p>Oral traditions and folk stories belong to the communities from which they originate. Fungga Wari Lab acts as a digital custodian, not a rights holder.</p>
                <p>Contributors retain moral rights to their submissions. Published stories are attributed to their original source and community.</p>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-4 border-l-4 border-primary pl-4">
                3. Data Security
              </h2>
              <div className="pl-4 space-y-3 text-sm font-mono text-muted-foreground leading-relaxed">
                <p>All data is stored in Supabase with Row Level Security (RLS) policies ensuring users can only access and modify their own content.</p>
                <p>Authentication is handled through Supabase Auth with secure session management. Passwords are never stored in plaintext.</p>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-4 border-l-4 border-primary pl-4">
                4. Media Storage
              </h2>
              <div className="pl-4 space-y-3 text-sm font-mono text-muted-foreground leading-relaxed">
                <p>All media assets (story illustrations, cover images, audio) are stored on Cloudinary with secure delivery via HTTPS CDN.</p>
                <p>We do not sell, share, or distribute user-uploaded media to third parties.</p>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-4 border-l-4 border-primary pl-4">
                5. Your Rights
              </h2>
              <div className="pl-4 space-y-3 text-sm font-mono text-muted-foreground leading-relaxed">
                <p>You may request deletion of your account and associated personal data at any time by contacting the platform administrators.</p>
                <p>Published cultural content may be retained in the archive for preservation purposes, with attribution removed upon request.</p>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-4 border-l-4 border-primary pl-4">
                6. Contact
              </h2>
              <div className="pl-4 space-y-3 text-sm font-mono text-muted-foreground leading-relaxed">
                <p>For data-related inquiries, contact the Fungga Wari Lab team through the platform or via the Creator Studio.</p>
              </div>
            </section>
          </div>

          {/* CTA */}
          <div className="mt-12 pt-8 border-t border-border">
            <Button variant="outline" size="lg" className="font-mono uppercase tracking-widest text-xs" asChild>
              <Link href="/">
                <ArrowLeft className="size-4 mr-2" />
                Return Home
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 md:px-12 py-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className="font-mono text-nano uppercase tracking-caps text-muted-foreground">
            Fungga Wari Lab © {new Date().getFullYear()}
          </span>
          <span className="font-mono text-nano uppercase tracking-caps text-muted-foreground">
            Data Governance
          </span>
        </div>
      </footer>
    </div>
  )
}
