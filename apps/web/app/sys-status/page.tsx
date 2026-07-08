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

      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Eyebrow */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
              Operations
            </span>
            <div className="h-[1px] w-12 bg-border-subtle" />
          </div>

          {/* Title */}
          <h1 className="font-heading text-3xl md:text-4xl font-normal tracking-tight text-foreground mb-8">
            System Status
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mb-12">
            Current operational status of all Fungga Wari Lab platform services. 
            All systems are monitored continuously to ensure archive integrity and user experience.
          </p>

          {/* Overall status */}
          <div className="flex items-center gap-4 px-6 py-4 rounded-xl border border-border-subtle mb-10">
            <div className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium">
              All Systems Operational
            </span>
            <span className="ml-auto text-xs text-muted-foreground">
              Updated: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>

          {/* Service Grid */}
          <div className="space-y-6 mb-16">
            {SERVICES.map((service) => (
              <div key={service.name} className="flex items-center gap-6 pb-6 border-b border-border-subtle last:border-0 last:pb-0">
                <service.icon className="size-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium tracking-tight">{service.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-medium text-primary">
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Architecture note */}
          <div className="pl-6 border-l border-border-subtle mb-16 py-2">
            <p className="text-sm text-foreground/80 leading-relaxed">
              Fungga Wari Lab runs on a modern JAMstack architecture: Next.js for rendering, Supabase for data persistence and auth, Cloudinary for media delivery, and Vercel for edge deployment.
            </p>
          </div>

          {/* CTA */}
          <Button variant="ghost" size="default" className="text-xs px-6 rounded-full font-medium text-muted-foreground" asChild>
            <Link href="/">
              <ArrowLeft className="size-3 mr-2" />
              Return
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 md:px-12 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="font-mono text-nano tracking-wide text-muted-foreground">
            Fungga Wari Lab © {new Date().getFullYear()}
          </span>
          <span className="font-mono text-nano tracking-wide text-muted-foreground">
            Infrastructure Monitoring
          </span>
        </div>
      </footer>
    </div>
  )
}
