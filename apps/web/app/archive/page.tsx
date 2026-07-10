import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/layout/Navbar"
import { Archive, BookOpen, Globe, ArrowRight, Flame } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

export const metadata: Metadata = {
  title: "Archive — Fungga Wari Lab",
  description: "The Kangleipak folk story archive — a digital sanctuary preserving Meitei oral traditions, mythology, and cultural heritage for future generations.",
}

export default function ArchivePage() {
  return (
    <div className="relative min-h-screen bg-cinematic-bg text-foreground overflow-x-hidden selection:bg-primary/30">
      <Navbar />

      <main className="relative pt-32 pb-24 px-6 md:px-12 min-h-[90vh] flex flex-col items-center border-x border-border max-w-7xl mx-auto bg-background">
        
        {/* Decorative Grid Overlay for Architectural Vibe */}
        <div className="absolute inset-0 pointer-events-none opacity-5 z-0"
             style={{
               backgroundImage: `repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)`,
               backgroundSize: "16px 16px",
             }}
        />

        <div className="w-full max-w-4xl relative z-10 flex flex-col">
          
          {/* Brutalist Metadata Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 mb-12 gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] tracking-widest text-primary uppercase">
                Protocol: Neo-Archival
              </span>
              <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                <div className="size-1.5 bg-brand-ochre rounded-none animate-pulse" />
                System Status: Online
              </span>
            </div>
            <div className="hidden md:block">
              <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                Location: Kangleipak Heritage Systems
              </span>
            </div>
          </div>

          {/* Brutalist Title */}
          <div className="flex flex-col gap-4 mb-16">
            <h1 className="font-heading text-6xl md:text-8xl font-black tracking-tighter text-foreground uppercase leading-[0.85]">
              The <br className="hidden md:block" /> Archive
            </h1>
            <p className="font-sans text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mt-4">
              A digital repository safeguarding the oral traditions of Kangleipak. 
              Stories, myths, and legends preserved in absolute permanence.
            </p>
          </div>

          {/* Structural Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border mb-20 bg-background">
            {/* Cell 1 */}
            <div className="group flex flex-col p-8 border-b md:border-b-0 md:border-r border-border hover:bg-cinematic-panel transition-colors duration-300">
              <div className="size-12 flex items-center justify-center border border-border mb-6 group-hover:border-primary/50 transition-colors bg-secondary/10">
                <Archive className="size-5 text-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-heading text-lg font-black tracking-tight uppercase mb-3">Preservation</h3>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                Digitally catalogued with strict metadata structures, ensuring no story is lost to the ash of time.
              </p>
            </div>
            
            {/* Cell 2 */}
            <div className="group flex flex-col p-8 border-b md:border-b-0 md:border-r border-border hover:bg-cinematic-panel transition-colors duration-300">
              <div className="size-12 flex items-center justify-center border border-border mb-6 group-hover:border-primary/50 transition-colors bg-secondary/10">
                <BookOpen className="size-5 text-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-heading text-lg font-black tracking-tight uppercase mb-3">Accessibility</h3>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                Immersive, high-contrast reading experiences designed around zero-curve Nordic typography.
              </p>
            </div>

            {/* Cell 3 */}
            <div className="group flex flex-col p-8 hover:bg-cinematic-panel transition-colors duration-300">
              <div className="size-12 flex items-center justify-center border border-border mb-6 group-hover:border-primary/50 transition-colors bg-secondary/10">
                <Globe className="size-5 text-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-heading text-lg font-black tracking-tight uppercase mb-3">Community</h3>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                A collaborative ledger for creators, elders, and contemporary folklore keepers.
              </p>
            </div>
          </div>

          {/* Epigraphic Quote Section */}
          <div className="relative border border-border-strong bg-cinematic-bg p-8 md:p-12 mb-16 flex flex-col items-center justify-center text-center shadow-nordic">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4">
              <Flame className="size-6 text-brand-ember/60" />
            </div>
            <p className="font-heading text-xl md:text-3xl font-medium text-foreground tracking-tight leading-snug">
              &ldquo;RECORDING THE WHISPERS OF THE HEARTH BEFORE THEY VANISH INTO THE ASH OF TIME.&rdquo;
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div className="h-[1px] w-12 bg-border-strong" />
              <span className="font-mono text-[10px] tracking-widest text-primary uppercase">
                Lab Directive 01
              </span>
              <div className="h-[1px] w-12 bg-border-strong" />
            </div>
          </div>

          {/* Stark CTA */}
          <div className="flex justify-center mt-auto border-t border-border pt-12">
            <Button size="lg" className="h-14 px-8 rounded-none font-heading text-lg font-black uppercase tracking-widest group" asChild>
              <Link href="/stories">
                Access the Repository
                <ArrowRight className="ml-3 size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 md:px-12 py-8 bg-background max-w-7xl mx-auto border-x">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            Fungga Wari Lab © {new Date().getFullYear()}
          </span>
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            Kangleipak Heritage Systems
          </span>
        </div>
      </footer>
    </div>
  )
}
