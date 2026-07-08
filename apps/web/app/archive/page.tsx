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

      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Eyebrow */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
              Digital Repository
            </span>
            <div className="h-[1px] w-12 bg-border-subtle" />
          </div>

          {/* Title */}
          <h1 className="font-heading text-3xl md:text-4xl font-normal tracking-tight text-foreground mb-8">
            The Archive
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mb-16">
            A digital repository safeguarding the oral traditions of Kangleipak. 
            Stories, myths, and legends preserved for the future.
          </p>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16">
            <div className="flex flex-col gap-4">
              <Archive className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-medium tracking-tight">Preservation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Digitally catalogued with structured metadata, ensuring no story is lost to time.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <BookOpen className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-medium tracking-tight">Accessibility</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Immersive reading experiences with multi-language support and illustrations.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Globe className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-medium tracking-tight">Community</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A collaborative platform for creators and folklore keepers.
              </p>
            </div>
          </div>

          {/* Mission quote */}
          <div className="pl-6 border-l border-border-subtle mb-16 py-2">
            <p className="text-sm text-foreground/80 italic leading-relaxed">
              &ldquo;Recording the whispers of the hearth before they vanish into the ash of time.&rdquo;
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-3">
            <Button size="default" className="text-xs px-6 rounded-full font-medium" asChild>
              <Link href="/stories">Browse</Link>
            </Button>
            <Button variant="ghost" size="default" className="text-xs px-6 rounded-full font-medium text-muted-foreground" asChild>
              <Link href="/">
                <ArrowLeft className="size-3 mr-2" />
                Return
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 md:px-12 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="font-mono text-nano tracking-wide text-muted-foreground">
            Fungga Wari Lab © {new Date().getFullYear()}
          </span>
          <span className="font-mono text-nano tracking-wide text-muted-foreground">
            Kangleipak Heritage Systems
          </span>
        </div>
      </footer>
    </div>
  )
}
