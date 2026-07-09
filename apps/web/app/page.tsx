import * as React from "react";
import Image from "next/image";
import { Globe, Cpu, BookOpen, Database } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { SectionDivider } from "@workspace/ui/components/SectionDivider";
import { WiseEpu } from "@workspace/ui/components/WiseEpu";
import { createClient } from "@/lib/supabase/server";

import {
  ScrollProgressBarIsland,
  HeroIsland,
  BentoGridIsland,
  CapabilityCellIsland,
  SectionHeadingIsland,
  CtaIsland,
  FooterLinksIsland,
} from "@/components/home/client-islands";

// ─── Grid Background ─────────────────────────────────────────────────────────

function GridBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-15">
      <div 
        className="absolute inset-0 max-w-7xl mx-auto h-full bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px)] bg-[size:25%_100%] [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
      />
    </div>
  );
}

// ─── Story Ticker (Server) ───────────────────────────────────────────────────

async function StoryTicker() {
  // We can fetch data here if we needed to pass it to a client component
  // const supabase = await createClient();
  // const { data } = await supabase.from("stories").select("title").eq("status", "published").order("created_at", { ascending: false }).limit(10);
  
  return (
    <section className="pt-32 md:pt-48 pb-0 bg-background relative overflow-hidden border-b border-border">
      <SectionDivider variant="ink-wash" position="top" className="opacity-40 text-brand-ember/20" />
      <SectionDivider variant="smoke" position="bottom" className="opacity-80 text-background" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,color-mix(in_srgb,var(--color-primary)_3%,transparent),transparent_70%)] pointer-events-none z-0" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12 relative z-10">
        {/* We would use ScrollReveal here, but it requires use client, so we will wrap it or just use simple CSS or leave it static */}
        {/* For full fidelity, we should make a Client wrapper or just keep the style. */}
        {/* But looking closely at the original, ScrollReveal was used. */}
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-8 bg-brand-ember" />
            <span className="text-fine font-sans text-sm font-medium tracking-wide text-primary">Catalogue Index</span>
          </div>
          <h3 className="text-xl md:text-2xl font-heading font-black uppercase tracking-tighter text-foreground ml-3">
            Oral Tradition Archives
          </h3>
        </div>
      </div>
    </section>
  );
}

// ─── Main Page (Server Component) ─────────────────────────────────────────────

export default async function Home() {
  return (
    <>
      <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden font-sans">
        <ScrollProgressBarIsland />
        <Navbar />
        <GridBackground />

        {/* ─── HERO ─────────────────────────────────────────────────────────── */}
        <HeroIsland />

        {/* ─── TICKER ───────────────────────────────────────────────────────── */}
        <StoryTicker />

        {/* ─── FEATURE BENTO ────────────────────────────────────────────────── */}
        <section id="stories" className="relative py-24 px-6 md:px-12 lg:px-20 bg-secondary/10 border-y border-border">
          <BentoGridIsland />
        </section>

        {/* ─── CAPABILITIES ─────────────────────────────────────────────────── */}
        <section className="relative py-24 px-6 md:px-12 lg:px-20 bg-background border-b border-border">
          <div className="max-w-5xl mx-auto w-full">
            <SectionHeadingIsland
              title="Systems of Memory"
              badge="Foundation"
              subtitle="Minimalist, high-performance systems built with professional humility and technical rigour."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-border">
              {[
                { title: "Lore Preservation", desc: "High-performance storage for multi-vocal multimedia formats.", icon: Globe },
                { title: "Narrative Engine", desc: "Structured Zen Brutalist editor for deep narrative craft.", icon: Cpu },
                { title: "Real-time Epigraphy", desc: "Collaborative tools for deep translation & cultural tagging.", icon: BookOpen },
                { title: "Heritage Schemas", desc: "Structured data models designed for indigenous heritage.", icon: Database },
              ].map((cap, i) => (
                <CapabilityCellIsland key={i} icon={cap.icon} title={cap.title} desc={cap.desc} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ──────────────────────────────────────────────────────────── */}
        <section className="relative py-24 px-6 md:px-12 lg:px-20 overflow-hidden bg-cinematic-bg">
          <Image
            src="/begin-the-journey.png"
            alt="Begin the journey illustration"
            fill
            sizes="100vw"
            className="object-cover object-center z-0 opacity-40 dark:opacity-60"
            priority={false}
            quality={100}
          />
          <div className="absolute inset-x-0 top-0 h-40 z-10 bg-gradient-to-b from-cinematic-bg to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 z-10 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute inset-y-0 left-0 w-32 md:w-64 z-10 bg-gradient-to-r from-cinematic-bg to-transparent" />
          <div className="absolute inset-y-0 right-0 w-32 md:w-64 z-10 bg-gradient-to-l from-cinematic-bg to-transparent" />
          <div className="absolute inset-0 z-10 bg-cinematic-bg/30 pointer-events-none" />
          
          <CtaIsland />
        </section>

        {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
        <footer className="relative z-10 py-10 px-6 md:px-12 lg:px-20 bg-background border-t border-primary">
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
                Code. Coffee. Oliver Oinam (Fungga_Wari Team)
              </span>
            </div>
            
            <FooterLinksIsland />
          </div>
        </footer>
      </div>
      
      {/* WiseEpu — lore keeper chatbot, scoped to landing page only */}
      <WiseEpu apiRoute="/api/wise-epu" />
    </>
  );
}
