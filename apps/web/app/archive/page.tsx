import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Archive, BookOpen, Globe, ArrowLeft } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

export const metadata: Metadata = {
  title: "Archive — Fungga Wari Lab",
  description: "The Kangleipak folk story archive — a digital sanctuary preserving Meitei oral traditions, mythology, and cultural heritage for future generations.",
}

export default function ArchivePage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      <main className="pt-28 pb-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-[2px] w-8 bg-primary" />
            <span className="text-fine font-mono uppercase tracking-ultra text-primary font-bold">
              Digital Repository
            </span>
          </div>

          {/* Title */}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.9] text-foreground mb-6">
            The <span className="italic text-primary">Archive</span>
          </h1>

          <p className="text-sm text-muted-foreground font-mono leading-relaxed max-w-2xl mb-12">
            A living digital repository safeguarding the oral traditions of Kangleipak — stories, myths, legends, and cultural narratives passed down through generations around the evening hearth.
          </p>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px border border-border bg-border mb-12">
            <div className="bg-background p-6 flex flex-col gap-3">
              <div className="size-10 border border-border flex items-center justify-center text-primary">
                <Archive className="size-5" />
              </div>
              <h3 className="font-heading text-lg font-bold uppercase tracking-tight">Preservation</h3>
              <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                Every story is digitally catalogued with structured metadata — category, language, cultural context, and attributed authorship — ensuring nothing is lost.
              </p>
            </div>
            <div className="bg-background p-6 flex flex-col gap-3">
              <div className="size-10 border border-border flex items-center justify-center text-primary">
                <BookOpen className="size-5" />
              </div>
              <h3 className="font-heading text-lg font-bold uppercase tracking-tight">Accessibility</h3>
              <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                Stories are presented in an immersive cinematic reader experience with text-to-speech narration, scene illustrations, and multi-language support.
              </p>
            </div>
            <div className="bg-background p-6 flex flex-col gap-3">
              <div className="size-10 border border-border flex items-center justify-center text-primary">
                <Globe className="size-5" />
              </div>
              <h3 className="font-heading text-lg font-bold uppercase tracking-tight">Community</h3>
              <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                Creators and storytellers contribute through the Creator Studio — a managed CMS where folklore keepers collaborate to record the living lore.
              </p>
            </div>
          </div>

          {/* Mission quote */}
          <div className="border-l-4 border-primary pl-6 py-4 mb-12">
            <p className="text-sm text-muted-foreground font-mono italic leading-relaxed">
              &ldquo;We stand at the threshold of silence, recording the whispers of the hearth before they vanish into the ash of time.&rdquo;
            </p>
            <span className="text-nano font-mono uppercase tracking-caps text-primary mt-2 block">
              — Fungga Wari Lab Manifesto
            </span>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="font-mono uppercase tracking-widest text-xs" asChild>
              <Link href="/stories">Browse the Archive</Link>
            </Button>
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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="font-mono text-nano uppercase tracking-caps text-muted-foreground">
            Fungga Wari Lab © {new Date().getFullYear()}
          </span>
          <span className="font-mono text-nano uppercase tracking-caps text-muted-foreground">
            Kangleipak Heritage Systems
          </span>
        </div>
      </footer>
    </div>
  )
}
