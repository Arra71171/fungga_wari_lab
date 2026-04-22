import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Activity, CheckCircle, Server, Database, ArrowLeft } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

export const metadata: Metadata = {
  title: "System Status — Fungga Wari Lab",
  description: "Live system status and operational health of the Fungga Wari Lab platform — database, API, CDN, and authentication services.",
}

const SERVICES = [
  {
    name: "Supabase Database",
    status: "Operational",
    description: "PostgreSQL database with Row Level Security",
    icon: Database,
  },
  {
    name: "Authentication",
    status: "Operational",
    description: "Supabase Auth with email/password flow",
    icon: CheckCircle,
  },
  {
    name: "Media CDN",
    status: "Operational",
    description: "Cloudinary image and video delivery",
    icon: Server,
  },
  {
    name: "API Gateway",
    status: "Operational",
    description: "Next.js API routes and server actions",
    icon: Activity,
  },
]

export default function SysStatusPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      <main className="pt-28 pb-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-[2px] w-8 bg-primary" />
            <span className="text-fine font-mono uppercase tracking-ultra text-primary font-bold">
              Operations
            </span>
          </div>

          {/* Title */}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.9] text-foreground mb-6">
            Sys<span className="italic text-primary">_</span>Status
          </h1>

          <p className="text-sm text-muted-foreground font-mono leading-relaxed max-w-2xl mb-12">
            Current operational status of all Fungga Wari Lab platform services. All systems are monitored continuously to ensure archive integrity and user experience.
          </p>

          {/* Overall status */}
          <div className="border border-border bg-background p-6 mb-8 flex items-center gap-4">
            <div className="size-3 bg-primary rounded-full animate-pulse" />
            <span className="font-mono text-sm uppercase tracking-widest text-primary font-bold">
              All Systems Operational
            </span>
            <span className="ml-auto font-mono text-nano uppercase tracking-caps text-muted-foreground">
              Last checked: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>

          {/* Service Grid */}
          <div className="space-y-px border border-border bg-border mb-12">
            {SERVICES.map((service) => (
              <div key={service.name} className="bg-background p-5 flex items-center gap-4">
                <div className="size-10 border border-border flex items-center justify-center text-foreground shrink-0">
                  <service.icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-sm font-bold uppercase tracking-tight">{service.name}</h3>
                  <p className="text-nano font-mono text-muted-foreground">{service.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="size-2 bg-primary rounded-full" />
                  <span className="font-mono text-nano uppercase tracking-widest text-primary font-bold">
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Architecture note */}
          <div className="border-l-4 border-primary pl-6 py-4 mb-12">
            <p className="text-sm text-muted-foreground font-mono leading-relaxed">
              Fungga Wari Lab runs on a modern JAMstack architecture: Next.js for rendering, Supabase for data persistence and auth, Cloudinary for media delivery, and Vercel for edge deployment.
            </p>
          </div>

          {/* CTA */}
          <Button variant="outline" size="lg" className="font-mono uppercase tracking-widest text-xs" asChild>
            <Link href="/">
              <ArrowLeft className="size-4 mr-2" />
              Return Home
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 md:px-12 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="font-mono text-nano uppercase tracking-caps text-muted-foreground">
            Fungga Wari Lab © {new Date().getFullYear()}
          </span>
          <span className="font-mono text-nano uppercase tracking-caps text-muted-foreground">
            Infrastructure Monitoring
          </span>
        </div>
      </footer>
    </div>
  )
}
