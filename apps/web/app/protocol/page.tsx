import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Shield, Layers, FileText, Fingerprint, ArrowLeft } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

export const metadata: Metadata = {
  title: "Protocol — Fungga Wari Lab",
  description: "The Neo-Archival Protocol — our methodology for preserving and presenting Kangleipak folk traditions with integrity, accuracy, and cultural sensitivity.",
}

const PRINCIPLES = [
  {
    title: "Cultural Fidelity",
    description: "Every narrative is recorded as close to its original oral form as possible. We honour the voice, rhythm, and intent of the storyteller.",
    icon: Fingerprint,
  },
  {
    title: "Structured Preservation",
    description: "Stories are catalogued with rich metadata: origin, language, attributed author, cultural context, and thematic tags for discoverability.",
    icon: Layers,
  },
  {
    title: "Transparent Attribution",
    description: "Every contribution is credited. Oral traditions belong to communities — we record, we do not claim.",
    icon: FileText,
  },
  {
    title: "Data Integrity",
    description: "All content is stored with version history, access controls, and Row Level Security to prevent unauthorized modification.",
    icon: Shield,
  },
]

export default function ProtocolPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      <main className="pt-28 pb-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-[2px] w-8 bg-primary" />
            <span className="text-fine font-mono uppercase tracking-ultra text-primary font-bold">
              Methodology
            </span>
          </div>

          {/* Title */}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.9] text-foreground mb-6">
            Neo-Archival <span className="italic text-primary">Protocol</span>
          </h1>

          <p className="text-sm text-muted-foreground font-mono leading-relaxed max-w-2xl mb-12">
            Our methodology for preserving the endangered oral traditions of Kangleipak. The Neo-Archival Protocol defines how stories are collected, validated, structured, and presented to ensure cultural integrity across generations.
          </p>

          {/* Protocol version badge */}
          <div className="inline-flex items-center gap-2 border border-border bg-secondary/30 px-4 py-2 mb-12">
            <div className="size-2 bg-primary" />
            <span className="font-mono text-nano uppercase tracking-caps text-foreground font-bold">
              Protocol Version 2.0
            </span>
            <span className="font-mono text-nano uppercase tracking-caps text-muted-foreground">
              — Active
            </span>
          </div>

          {/* Principles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px border border-border bg-border mb-12">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title} className="bg-background p-6 flex flex-col gap-3">
                <div className="size-10 border border-border flex items-center justify-center text-primary">
                  <principle.icon className="size-5" />
                </div>
                <h3 className="font-heading text-lg font-bold uppercase tracking-tight">{principle.title}</h3>
                <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>

          {/* Process section */}
          <h2 className="font-heading text-2xl font-bold uppercase tracking-tight mb-6 border-l-4 border-primary pl-4">
            Collection Process
          </h2>
          <div className="space-y-4 mb-12">
            {[
              { step: "01", title: "Field Collection", desc: "Oral narratives are recorded from community elders and storytellers in their native language." },
              { step: "02", title: "Transcription & Translation", desc: "Audio recordings are transcribed in Meiteilon/Meitei and translated to English with cultural context notes." },
              { step: "03", title: "Digital Structuring", desc: "Stories are organized into chapters, scenes, and metadata tags within the Creator Studio CMS." },
              { step: "04", title: "Review & Validation", desc: "Community reviewers verify cultural accuracy, attribution, and contextual integrity before publication." },
              { step: "05", title: "Publication & Preservation", desc: "Validated stories are published to the archive with immersive illustrations and multi-format reading options." },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 p-4 border border-border hover:border-primary/30 transition-colors">
                <span className="font-mono text-2xl font-black text-primary tabular-nums shrink-0 w-10">{item.step}</span>
                <div>
                  <h4 className="font-heading text-sm font-bold uppercase tracking-tight">{item.title}</h4>
                  <p className="text-xs font-mono text-muted-foreground leading-relaxed mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="font-mono uppercase tracking-widest text-xs" asChild>
              <Link href="/stories">View the Archive</Link>
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
            Neo-Archival Protocol v2.0
          </span>
        </div>
      </footer>
    </div>
  )
}
