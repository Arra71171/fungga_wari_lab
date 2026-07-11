import * as React from "react"
import { SectionDivider } from "@workspace/ui/components/SectionDivider"
import { FooterLinksIsland } from "@/components/home/client-islands"

export function Footer() {
  return (
    <footer className="relative z-10 py-10 px-6 md:px-12 lg:px-20 bg-background border-t border-primary" data-slot="footer">
      <SectionDivider variant="smoke" fill="bg-background" stroke="text-primary/30" className="opacity-50 -top-px rotate-180" />
      <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="font-meetei text-2xl font-black tracking-wide flex items-center gap-2">
            <div className="size-4 bg-primary" />
            ꯐꯨꯡꯒꯥ ꯋꯥꯔꯤ <span className="font-mono text-lg font-bold">.Lab</span>
          </span>
          <span className="text-xs font-mono text-muted-foreground tracking-wide mt-2 border border-border px-2 py-1">
            Oral History Systems v2.0
          </span>
          <span className="text-xs font-mono text-muted-foreground/70 tracking-wide mt-4">
            Code. Coffee. Oliver Oinam (Fungga Wari Team)
          </span>
        </div>
        
        <FooterLinksIsland />
      </div>
    </footer>
  )
}
