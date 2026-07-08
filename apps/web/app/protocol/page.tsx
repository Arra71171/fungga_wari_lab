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

      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Eyebrow */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
              Methodology
            </span>
            <div className="h-[1px] w-12 bg-border-subtle" />
          </div>

          {/* Title */}
          <h1 className="font-heading text-3xl md:text-4xl font-normal tracking-tight text-foreground mb-8">
            Neo-Archival Protocol
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mb-10">
            Our methodology for preserving the endangered oral traditions of Kangleipak. The Neo-Archival Protocol defines how stories are collected, validated, structured, and presented to ensure cultural integrity.
          </p>

          {/* Protocol version badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-none border border-border-subtle mb-16">
            <div className="size-1.5 rounded-none bg-primary" />
            <span className="text-xs font-medium text-foreground">
              Protocol Version 2.0
            </span>
            <span className="text-xs text-muted-foreground">
              Active
            </span>
          </div>

          {/* Principles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-20">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title} className="flex flex-col gap-4">
                <principle.icon className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-medium tracking-tight">{principle.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>

          {/* Process section */}
          <h2 className="font-heading text-xl font-normal tracking-tight mb-8">
            Collection Process
          </h2>
          <div className="space-y-8 mb-16 border-l border-border-subtle pl-6 ml-2">
            {[
              { step: "01", title: "Field Collection", desc: "Oral narratives are recorded from community elders and storytellers in their native language." },
              { step: "02", title: "Transcription & Translation", desc: "Audio recordings are transcribed in Meiteilon/Meitei and translated to English with cultural context notes." },
              { step: "03", title: "Digital Structuring", desc: "Stories are organized into chapters, scenes, and metadata tags within the Creator Studio CMS." },
              { step: "04", title: "Review & Validation", desc: "Community reviewers verify cultural accuracy, attribution, and contextual integrity before publication." },
              { step: "05", title: "Publication & Preservation", desc: "Validated stories are published to the archive with immersive illustrations and multi-format reading options." },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="absolute -left-[31px] top-1.5 size-2 bg-background border border-border-subtle rounded-none" />
                <h4 className="text-sm font-medium tracking-tight flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground">{item.step}</span>
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2 pl-7">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-3">
            <Button size="default" className="text-xs px-6 rounded-none font-medium" asChild>
              <Link href="/stories">View Archive</Link>
            </Button>
            <Button variant="ghost" size="default" className="text-xs px-6 rounded-none font-medium text-muted-foreground" asChild>
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
            Neo-Archival Protocol v2.0
          </span>
        </div>
      </footer>
    </div>
  )
}
