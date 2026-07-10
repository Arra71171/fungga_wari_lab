import * as React from "react";
import Image from "next/image";
import { Globe, Cpu, BookOpen, Database, Zap } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { SectionDivider } from "@workspace/ui/components/SectionDivider";
import { WiseEpu } from "@workspace/ui/components/WiseEpu";
import { VelocityMarquee } from "@workspace/ui/components/VelocityMarquee";
import { createClient } from "@/lib/supabase/server";

import {
  ScrollProgressBarIsland,
  HeroIsland,
  BentoGridIsland,
  CapabilityCellIsland,
  SectionHeadingIsland,
  CtaIsland,
  FooterLinksIsland,
  ScrollTopology,
} from "@/components/home/client-islands";

import { FlickeringGrid } from "@workspace/ui/components/flickering-grid";

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
  const supabase = await createClient();
  
  // Fetch latest published story titles to scroll inside the marquee
  const { data: stories } = await supabase
    .from("stories")
    .select("title, category")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(10);

  const fallbackTitles = [
    { title: "THE TALE OF THE SEVEN BROTHERS", category: "folklore" },
    { title: "THE SPIRIT OF LOKTAK LAKE", category: "mythology" },
    { title: "THE FIRE KEEPER'S PROTOCOL", category: "lore" },
    { title: "THE ORAL HISTORY OF THE MEETEIS", category: "history" },
    { title: "CLANS OF THE KHABA-NGANBAS", category: "genealogy" },
  ];

  const items = (stories && stories.length > 0) ? stories : fallbackTitles;

  return (
    <section className="pt-24 pb-20 bg-background relative overflow-hidden border-b border-border">
      {/* Background Flickering Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.14] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_75%,transparent_100%)]">
        <FlickeringGrid
          squareSize={3}
          gridGap={6}
          color="var(--color-primary)"
          maxOpacity={0.35}
          flickerChance={0.25}
          className="h-full w-full"
        />
      </div>

      <SectionDivider variant="ink-wash" position="top" className="opacity-45 text-brand-ember/25 z-10" />
      <SectionDivider variant="smoke" position="bottom" className="opacity-80 text-background z-10" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,color-mix(in_srgb,var(--color-primary)_2%,transparent),transparent_80%)] pointer-events-none z-0" />
      
      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10 mb-12">
        <div className="flex flex-col items-start gap-2 max-w-xl">
          <div className="flex items-center gap-3">
            <div className="size-1.5 bg-brand-ember shrink-0" />
            <span className="text-fine font-sans text-xs font-semibold tracking-wider text-primary uppercase">
              Catalogue Index
            </span>
          </div>
          <h3 className="text-3xl md:text-4xl font-heading font-black uppercase tracking-tighter text-foreground ml-3 leading-none">
            Oral Tradition Archives.
          </h3>
        </div>

        <div className="flex flex-col items-start md:items-end text-left md:text-right font-mono text-[10px] tracking-widest text-muted-foreground/60 space-y-1">
          <span className="uppercase">Sector: Cataloguing · Lab</span>
          <span className="uppercase">System · Status: Online // Active</span>
        </div>
      </div>

      {/* Marquee Banner */}
      <div className="relative w-full py-4 border-y border-border-subtle bg-bg-panel/40 overflow-hidden z-10 select-none">
        <VelocityMarquee items={items} />
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
        <ScrollTopology />
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

        {/* ─── SYSTEMS OF MEMORY (ECOSYSTEM) ────────────────────────────────── */}
        <section className="relative py-24 px-6 md:px-12 lg:px-20 bg-background border-b border-border">
          <div className="mx-auto max-w-5xl space-y-8 md:space-y-16">
            <h2 className="relative z-10 max-w-xl text-3xl md:text-4xl lg:text-5xl font-heading font-black tracking-tighter uppercase text-foreground">
              The Wari ecosystem.
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
              <div className="relative space-y-4">
                <p className="text-muted-foreground">
                  Fungga Wari is evolving to be more than just an archive. <span className="text-foreground font-bold">It supports an entire ecosystem</span> — from preservation to exploration.
                </p>
                <p className="text-muted-foreground">It provides the foundational APIs, data models, and immersive interfaces helping communities and developers preserve indigenous lore.</p>

                <div className="grid grid-cols-2 gap-3 pt-6 sm:gap-4 border-t border-border-subtle mt-4">
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Zap className="size-4 text-brand-ember" />
                      <h3 className="text-sm font-bold uppercase tracking-wide">Faaast</h3>
                    </div>
                    <p className="text-muted-foreground text-sm font-mono tracking-tight">Accelerated edge delivery for multi-vocal media.</p>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="size-4 text-brand-ember" />
                      <h3 className="text-sm font-bold uppercase tracking-wide">Powerful</h3>
                    </div>
                    <p className="text-muted-foreground text-sm font-mono tracking-tight">Structured schemas designed for complex heritage.</p>
                  </div>
                </div>
              </div>
              
              <div className="relative mt-6 sm:mt-0 flex items-center justify-center">
                <div className="relative w-full border border-border bg-card flex overflow-hidden">
                  <Image 
                    src="/exercice-dark.png" 
                    className="hidden dark:block w-full h-auto object-cover" 
                    alt="Systems of Memory Dark" 
                    width={1206} 
                    height={612} 
                  />
                  <Image 
                    src="/exercice.png" 
                    className="block dark:hidden w-full h-auto object-cover" 
                    alt="Systems of Memory Light" 
                    width={1206} 
                    height={612} 
                  />
                </div>
              </div>
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
                Code. Coffee. Oliver Oinam (Fungga Wari Team)
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
