"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  AnimatePresence,
  type Variants,
} from "framer-motion";
import {
  BookOpen,
  Users,
  Archive,
  Globe,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Navbar } from "@/components/layout/Navbar";
import {
  Card,
  CardDescription,
  CardTitle,
} from "@workspace/ui/components/card";
import { MagneticButton } from "@workspace/ui/components/MagneticButton";
import { SplitText } from "@workspace/ui/components/SplitText";
import { TextMatrixRain } from "@workspace/ui/components/TextMatrixRain";
import { BorderBeam } from "@workspace/ui/components/border-beam";
import { Marquee } from "@workspace/ui/components/marquee";
import { RichTextRenderer } from "@workspace/ui/components/editor/rich-text-renderer";
import { EmberParticles } from "@workspace/ui/components/EmberParticles";
import { SectionDivider } from "@workspace/ui/components/SectionDivider";
import { ScrollReveal } from "@workspace/ui/components/ScrollReveal";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};


const clipReveal: Variants = {
  hidden: { clipPath: "inset(0 0 100% 0)", opacity: 0 },
  visible: {
    clipPath: "inset(0 0 0% 0)",
    opacity: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Scroll Progress Bar ─────────────────────────────────────────────────────

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[100] h-[2px] bg-primary origin-left"
      style={{ scaleX }}
    />
  );
}

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


// ─── Story Ticker ────────────────────────────────────────────────────────────

function StoryTicker() {
  const [stories, setStories] = React.useState<string[]>([
    "Loading...",
  ]);

  React.useEffect(() => {
    async function fetchStories() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("stories")
        .select("title")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (!error && data && data.length > 0) {
        setStories(data.map((s) => s.title));
      } else if (!error && data?.length === 0) {
        // Fallback if no published stories yet
        setStories(["Archive Empty", "Awaiting Manuscripts"]);
      }
    }
    fetchStories();
  }, []);

  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden border-b border-border">
      {/* Abstract ink dividers */}
      <SectionDivider variant="ink-wash" position="top" className="opacity-40 text-brand-ember/20" />
      <SectionDivider variant="smoke" position="bottom" className="opacity-80 text-background" />

      {/* Background Polish */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,color-mix(in_srgb,var(--color-primary)_3%,transparent),transparent_70%)] pointer-events-none z-0" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12 relative z-10">
        <ScrollReveal direction="up" distance={30} duration={0.8}>
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-8 bg-brand-ember" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-ember font-bold">Catalogue Index</span>
            </div>
            <h3 className="text-xl md:text-2xl font-heading font-black uppercase tracking-tighter text-foreground ml-3">
              Oral Tradition Archives
            </h3>
          </div>
        </ScrollReveal>
      </div>
      
      {/* Typrographic Wall with Edge Masking */}
      <div className="relative [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] md:relative z-10">
        <div className="-space-y-4 md:-space-y-8 lg:-space-y-12">
          {/* Row 1: Solid & Subtle */}
          <ScrollReveal direction="left" distance={150} duration={1.2} scrub={1} className="w-full">
            <Marquee pauseOnHover className="[--gap:4rem] py-2" repeat={3} duration={70}>
              {stories.map((story, i) => (
                <div key={i} className="group cursor-default px-8">
                  <span className="text-6xl md:text-8xl lg:text-9xl font-heading font-black uppercase tracking-tighter text-muted-foreground/10 group-hover:text-brand-ember/40 transition-colors duration-700 select-none">
                    {story}
                  </span>
                </div>
              ))}
            </Marquee>
          </ScrollReveal>
          
          {/* Row 2: Outline & Prominent */}
          <ScrollReveal direction="right" distance={150} duration={1.2} scrub={1} className="w-full">
            <Marquee pauseOnHover reverse className="[--gap:4rem] py-2" repeat={3} duration={55}>
              {stories.slice().reverse().map((story, i) => (
                <div key={i} className="group cursor-default px-8">
                  <span 
                    className="text-6xl md:text-8xl lg:text-9xl font-heading font-black uppercase tracking-tighter text-transparent group-hover:text-brand-ember transition-all duration-700 select-none"
                    style={{ WebkitTextStroke: '1px var(--brand-ember)' }}
                  >
                    {story}
                  </span>
                </div>
              ))}
            </Marquee>
          </ScrollReveal>

          {/* Row 3: Solid & Deep */}
          <ScrollReveal direction="left" distance={100} duration={1.5} scrub={1} className="w-full">
            <Marquee pauseOnHover className="[--gap:4rem] py-2" repeat={3} duration={85}>
              {stories.map((story, i) => (
                <div key={i} className="group cursor-default px-8">
                  <span className="text-6xl md:text-8xl lg:text-9xl font-heading font-black uppercase tracking-tighter text-muted-foreground/5 group-hover:text-brand-ember/30 transition-colors duration-700 select-none">
                    {story}
                  </span>
                </div>
              ))}
            </Marquee>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

// ─── Section Heading ──────────────────────────────────────────────────────────

// ─── Section Heading ──────────────────────────────────────────────────────────

function SectionHeading({
  title,
  subtitle,
  badge,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
}) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });

  return (
    <div ref={ref} className="mb-12 md:mb-16 border-l-4 border-primary pl-6 py-2">
      <AnimatePresence>
        {badge && (
          <motion.span
            variants={clipReveal}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="inline-block px-3 py-1 mb-4 text-xs font-mono uppercase tracking-widest text-primary border border-primary bg-primary/5"
          >
            {badge}
          </motion.span>
        )}
      </AnimatePresence>

      <SplitText
        text={title}
        as="h2"
        className="text-4xl md:text-5xl lg:text-6xl font-heading font-black tracking-tighter uppercase leading-none mb-4"
        stagger={0.055}
        delay={0.05}
      />

      {subtitle && (
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ delay: 0.25 }}
          className="text-sm text-muted-foreground font-mono max-w-xl leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

// ─── Capability Cell ──────────────────────────────────────────────────────────

function CapabilityCell({
  icon: Icon,
  title,
  desc,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  index: _index,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  index: number;
}) {
  const containerRef = React.useRef(null);
  const lineRef = React.useRef(null);
  const iconRef = React.useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 90%",
        end: "bottom 75%",
        scrub: 1.5,
      }
    });

    tl.fromTo(lineRef.current, { width: "24px", opacity: 0.5 }, { width: "100%", opacity: 1, duration: 1, ease: "none" })
      .fromTo(iconRef.current, { opacity: 0, scale: 0.5, rotateY: -90 }, { opacity: 1, scale: 1, rotateY: 0, duration: 0.5, ease: "back.out(2)" }, 0);
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="group p-8 border-b sm:border-y-0 sm:border-r border-border bg-background last:border-r-0 last:border-b-0 hover:bg-secondary/40 transition-colors duration-300 cursor-default"
    >
      <div
        ref={iconRef}
        className="size-12 mb-8 border border-border flex items-center justify-center bg-muted/20 text-foreground group-hover:-rotate-3 group-hover:scale-110 group-hover:bg-brand-ember group-hover:text-primary-foreground transition-all duration-300 shadow-sm"
      >
        <Icon className="size-5" />
      </div>
      <h3 className="text-lg font-bold uppercase tracking-tight mb-3">{title}</h3>
      <p className="text-muted-foreground font-mono text-xs leading-relaxed mb-6 h-12">{desc}</p>
      <div
        ref={lineRef}
        className="h-[1px] bg-brand-ember w-[24px]"
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const { scrollYProgress } = useScroll();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for future parallax hero
  const _y = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // Fetch Manifesto from CMS
  const [manifestoContent, setManifestoContent] = React.useState<{ tiptapContent: Record<string, unknown> } | null | undefined>(undefined);

  React.useEffect(() => {
    async function fetchManifesto() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data, error } = await supabase
          .from("global_content")
          .select("tiptap_content")
          .eq("slug", "manifesto")
          .maybeSingle();
        
        if (error) {
          console.warn("[manifesto] Failed to fetch:", error.message);
          setManifestoContent(null);
          return;
        }
        setManifestoContent(data ? { tiptapContent: data.tiptap_content as Record<string, unknown> } : null);
      } catch {
        setManifestoContent(null);
      }
    }
    fetchManifesto();
  }, []);

  const heroRef = React.useRef(null);
  const bentoGridRef = React.useRef(null);

  useGSAP(() => {
    if (bentoGridRef.current) {
      gsap.fromTo(
        gsap.utils.toArray(".bento-feature-card"),
        { y: 80, opacity: 0, rotateX: 5, z: -50 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          z: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "expo.out",
          scrollTrigger: {
            trigger: bentoGridRef.current,
            start: "top 85%",
            end: "bottom 60%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }
  }, { scope: bentoGridRef });

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden font-sans">
      <ScrollProgressBar />
      <Navbar />
      <GridBackground />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative px-6 md:px-12 pt-32 lg:pt-48 pb-16 md:pb-12 min-h-[90vh] flex items-center overflow-hidden"
      >
        <EmberParticles density={60} speed={0.5} className="z-0" />
        <motion.div
          style={{ opacity: heroOpacity }}
          className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center relative z-10"
        >
          {/* Hero Content */}
          <div className="lg:col-span-6 flex flex-col justify-center max-w-xl space-y-6">
            {/* Status Badge */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-3 border border-border inline-flex p-2 pr-6 bg-secondary/50 self-start"
            >
              <div className="relative flex items-center justify-center size-3">
                <motion.div
                  className="absolute inset-0 bg-brand-ember blur-[4px]"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative size-2 bg-brand-ember rounded-full" />
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-brand-ember">
                Oral History Archives • Active
              </span>
            </motion.div>

            {/* Split-text headline */}
            <ScrollReveal direction="up" distance={30} duration={1} delay={0.2} scrub={1}>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-heading font-black tracking-tighter uppercase leading-[0.9] text-foreground max-w-[12ch]">
                <TextMatrixRain duration={2.5} repeat={false} hoverRescramble>
                  Where stories outlive silence.
                </TextMatrixRain>
              </h1>
            </ScrollReveal>

            {/* Subtext */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
              className="py-2 pl-6 border-l-2 border-primary/50"
            >
              <p className="text-lg md:text-xl text-muted-foreground font-sans leading-tight tracking-wide">
                A digital sanctuary for Meetei folk traditions, oral histories, and the living lore of Loktak — crafted to honour.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.6 }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-wrap gap-3 pt-2">
                <MagneticButton strength={0.3}>
                  <Button
                    size="lg"
                    className="h-12 px-6 text-sm font-bold tracking-widest uppercase transition-shadow"
                    asChild
                  >
                    <Link href="/stories">
                      Browse Stories & Archives
                      <ArrowRight className="ml-3 size-4" />
                    </Link>
                  </Button>
                </MagneticButton>

                <MagneticButton strength={0.25}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-6 text-sm font-bold tracking-widest uppercase border border-border hover:bg-secondary transition-colors"
                  >
                    Explore the Platform
                  </Button>
                </MagneticButton>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5 lg:col-start-8 relative flex items-center justify-center w-full">
            {/* Ambient scroll-linked line */}
            <ScrollReveal direction="left" distance={100} duration={1.5} scrub={true}>
              <div className="absolute left-[-50px] top-1/2 w-48 h-[1px] bg-brand-ember/40 z-0 origin-left" />
            </ScrollReveal>

            {/* Ambient right margin text */}
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 rotate-90 origin-center hidden xl:block pointer-events-none z-0">
               <span className="text-xs font-mono uppercase tracking-[0.4em] text-muted-foreground/30">
                 SYS.ARCHIVE_READY // STATUS: ONLINE
               </span>
            </div>

            <ScrollReveal direction="up" distance={50} duration={1.2} scrub={0.5} className="relative z-10 w-full max-w-md">
              <div 
                className="relative w-full aspect-[3/4] sm:max-w-md mx-auto lg:max-w-md bg-background border border-border p-3 md:p-5 flex flex-col justify-between overflow-hidden group transition-all duration-500 hover:border-border-strong hover:shadow-brutal-primary z-10"
              >
                <BorderBeam size={150} duration={8} delay={1} />
                {/* Glow */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-brand-ember/15 blur-[120px] rounded-full pointer-events-none z-[-1]"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="flex justify-between items-center z-10 w-full mb-4">
                  <div className="flex items-center gap-2">
                    <div className="size-2 bg-brand-ember rounded-none" />
                    <div className="text-xs font-mono text-foreground/80 font-bold uppercase tracking-widest">
                      SYS.ID: 9X-ALPHA
                    </div>
                  </div>
                  <Users className="size-5 text-brand-ember group-hover:scale-110 transition-transform" />
                </div>

              <div className="flex-1 flex items-center justify-center relative p-2 border border-border/50 bg-secondary/20 overflow-hidden">
                <video
                  ref={(el) => {
                    if (el) {
                      el.defaultMuted = true;
                      el.muted = true;
                      el.play().catch(() => {});
                    }
                  }}
                  src="https://res.cloudinary.com/dlytqegcw/video/upload/v1776645841/tvyuk7g4k0ojvtdgz6lk.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full min-h-[220px] max-h-[480px] object-cover pointer-events-none"
                />
                
                {/* Watermark Overlay Element */}
                <div className="absolute bottom-0 right-0 px-4 py-2 bg-background border-t border-l border-border z-20 pointer-events-auto">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-foreground font-bold">Loktak Lake</span>
                </div>
              </div>

              <div className="border-t border-border/60 pt-4 mt-4">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-x-2 text-[10px] font-mono tracking-tight uppercase text-foreground/80">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground font-bold">Location:</span>
                    <span>Loktak Lake, Manipur</span>
                  </div>
                  <div className="w-[1px] bg-border block"></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground font-bold">Data:</span>
                    <span>Visual Topology & Lore</span>
                  </div>
                  <div className="flex flex-col gap-1 mt-3">
                    <span className="text-muted-foreground font-bold">Protocol:</span>
                    <span>Neo-Archival v2</span>
                  </div>
                  <div className="w-[1px] bg-border block mt-3"></div>
                  <div className="flex flex-col gap-1 mt-3">
                    <span className="text-muted-foreground font-bold">Integrity:</span>
                    <span>Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </motion.div>
      </section>

      <StoryTicker />

      {/* ─── MISSION STATEMENT ────────────────────────────────────────────── */}
      <section className="relative py-24 md:py-32 bg-secondary/5 border-b border-border flex items-center justify-center overflow-hidden">
        {/* Decorative Flanking Lines */}
        <div className="absolute left-6 md:left-12 top-0 bottom-0 w-[1px] bg-gradient-to-b from-border/0 via-border/50 to-border/0 hidden lg:block" />
        <div className="absolute right-6 md:right-12 top-0 bottom-0 w-[1px] bg-gradient-to-b from-border/0 via-border/50 to-border/0 hidden lg:block" />
        
        <div className="max-w-4xl mx-auto px-6 text-center z-10">
          <ScrollReveal direction="up" distance={20} duration={1} delay={0.1}>
            {manifestoContent === undefined ? (
              <div className="animate-pulse space-y-6 flex flex-col items-center">
                <div className="w-1/2 h-10 bg-secondary/50" />
                <div className="w-12 h-1 bg-brand-ember mb-8" />
                <div className="w-3/4 h-6 bg-secondary/50" />
              </div>
            ) : manifestoContent && manifestoContent.tiptapContent ? (
              <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-h2:text-4xl md:prose-h2:text-5xl prose-p:font-mono prose-p:text-sm md:prose-p:text-base prose-p:uppercase prose-p:tracking-[0.2em] prose-p:text-muted-foreground prose-p:leading-relaxed mx-auto text-center">
                 <RichTextRenderer content={manifestoContent.tiptapContent} />
              </div>
            ) : (
              <>
                <SplitText
                  text="What is past is prologue."
                  as="h2"
                  className="text-4xl md:text-5xl lg:text-6xl font-heading font-black uppercase tracking-tighter mb-8 text-foreground max-w-3xl mx-auto leading-tight"
                  stagger={0.06}
                  delay={0.2}
                />
                <div className="w-16 h-1 bg-brand-ember mx-auto mb-10 flex shadow-[0_0_10px_var(--brand-glow)]" />
                <ScrollReveal direction="up" distance={30} duration={1} delay={0.4}>
                  <p className="text-muted-foreground font-mono text-sm md:text-base uppercase tracking-[0.2em] leading-relaxed max-w-2xl mx-auto relative">
                    <span className="absolute -left-4 top-0 text-brand-ember/40 text-lg">&ldquo;</span>
                    We stand at the threshold of silence, recording the whispers of the hearth before they vanish into the ash of time.
                    <span className="absolute -right-4 bottom-0 text-brand-ember/40 text-lg">&rdquo;</span>
                  </p>
                </ScrollReveal>
              </>
            )}
          </ScrollReveal>
        </div>
      </section>

      {/* ─── FEATURE BENTO ────────────────────────────────────────────────── */}
      <section
        id="stories"
        className="relative py-24 md:py-32 px-6 md:px-12 bg-secondary/10 border-y border-border"
      >
        <div className="max-w-7xl mx-auto" ref={bentoGridRef}>
          <SectionHeading
            badge="Catalogue Index"
            title="The Archive of Orality"
            subtitle="A curated index of ancient folklore, recorded precisely as they were spoken under the evening hearth."
          />

          <div
            className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[250px]"
          >
            {/* Feature 1 */}
            <div className="md:col-span-8 bento-feature-card" style={{ perspective: "1000px" }}>
              <Card className="h-full transition-all duration-300 bg-background p-6 flex flex-col justify-between group relative overflow-hidden text-foreground hover:border-border-strong">
                <BorderBeam size={250} duration={10} delay={0} />
                <div className="absolute top-0 right-0 w-2/3 h-full z-0 opacity-70 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700 ease-in-out">
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent z-10" />
                  <Image
                    src="/Folk-Stories-Archive.png"
                    alt="Folk Stories Archive"
                    fill
                    sizes="(max-width: 768px) 100vw, 66vw"
                    className="object-cover object-right"
                  />
                </div>
                <div className="relative z-10 flex flex-col justify-between h-full w-full">
                  <div className="flex justify-between items-start w-full">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -3 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      className="size-12 border border-border bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      <Archive className="size-5" />
                    </motion.div>
                    <span className="font-mono text-xs text-muted-foreground/30 font-bold group-hover:text-primary-foreground/50 transition-colors">
                      REF_01
                    </span>
                  </div>
                  <div className="mt-8 max-w-sm">
                    <CardTitle className="text-2xl lg:text-3xl uppercase tracking-tighter mb-4 drop-shadow-md text-foreground">
                      Folklore Repository
                    </CardTitle>
                    <CardDescription className="font-mono text-sm max-w-xs font-semibold text-muted-foreground drop-shadow-sm">
                      Deep-earth oral traditions and cultural lore, structured for digital permanence.
                    </CardDescription>
                  </div>
                </div>
              </Card>
            </div>

            {/* Feature 2 */}
            <div className="md:col-span-4 bento-feature-card" style={{ perspective: "1000px" }}>
              <Card className="h-full transition-all duration-300 bg-background p-6 flex flex-col justify-between group hover:border-border-strong">
                <div className="flex justify-between items-start">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 3 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="size-10 border border-primary/20 bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    <BookOpen className="size-5" />
                  </motion.div>
                </div>
                <div>
                  <CardTitle className="text-xl uppercase tracking-tighter mb-2">Polyvocal Streams</CardTitle>
                  <CardDescription className="text-xs font-mono">
                    Meticulously captured records of the many voices that carry our heritage.
                  </CardDescription>
                </div>
              </Card>
            </div>

            {/* Feature 3 */}
            <div className="md:col-span-5 bento-feature-card" style={{ perspective: "1000px" }}>
              <Card className="h-full transition-all duration-300 bg-background p-6 flex flex-col justify-between group hover:border-border-strong">
                <div className="flex justify-between items-start">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -3 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="size-10 border border-primary-foreground/20 bg-primary-foreground/10 flex items-center justify-center text-primary-foreground group-hover:bg-primary-foreground group-hover:text-primary transition-colors"
                  >
                    <Users className="size-5" />
                  </motion.div>
                  <span className="font-mono text-xs text-primary-foreground/50">REF_03</span>
                </div>
                <div>
                  <CardTitle className="text-xl uppercase tracking-tighter mb-2">The Hearth (CMS)</CardTitle>
                  <CardDescription className="text-xs font-mono opacity-80 text-primary-foreground">
                    Where creators co-author history and validate the living breath of local lore.
                  </CardDescription>
                </div>
              </Card>
            </div>

            {/* Feature 4 */}
            <div className="md:col-span-7 bento-feature-card" style={{ perspective: "1000px" }}>
              <Card className="h-full transition-all duration-300 bg-background p-6 flex flex-col justify-between group hover:border-border-strong">
                <div className="flex justify-between items-start">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="size-10 border border-border bg-secondary flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-background transition-colors"
                  >
                    <Layers className="size-5" />
                  </motion.div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="max-w-xs">
                    <CardTitle className="text-xl uppercase tracking-tighter mb-2">Neo-Archival Protocol</CardTitle>
                    <CardDescription className="text-xs font-mono">
                      End-to-end systems for archiving endangered cultural data with modern stability.
                    </CardDescription>
                  </div>
                  <div className="hidden sm:flex border border-border p-4 bg-secondary items-center justify-center font-mono text-[10px] uppercase text-muted-foreground">
                    Integrity: Verified
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CAPABILITIES ─────────────────────────────────────────────────── */}
      <section className="relative py-24 md:py-32 px-6 md:px-12 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
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
              <CapabilityCell key={i} icon={cap.icon} title={cap.title} desc={cap.desc} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 md:px-12 flex items-center justify-center text-center overflow-hidden bg-cinematic-bg">

        {/* ── Full-bleed illustration ── */}
        <Image
          src="https://res.cloudinary.com/dlytqegcw/image/upload/v1776439982/fungga-wari-lab/illustrations/fungga-wari-lab/illustrations/cta-section-bg.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center z-0"
          priority={false}
          quality={90}
        />

        {/* ── Dark cinematic overlay: edges crushed to black, center breathes ── */}
        <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,transparent_0%,oklch(0.10_0.02_50/0.55)_50%,oklch(0.05_0.01_50/0.92)_100%)]" />
        {/* ── Bottom-to-top gradient to bleed into footer ── */}
        <div className="absolute inset-x-0 bottom-0 h-40 z-10 bg-gradient-to-t from-background to-transparent" />
        {/* ── Top-to-bottom gradient to bleed from previous section ── */}
        <div className="absolute inset-x-0 top-0 h-24 z-10 bg-gradient-to-b from-background to-transparent" />

        {/* ── Ember particles — now blend naturally against the dark fire scene ── */}
        <EmberParticles density={50} speed={0.35} className="z-20 mix-blend-screen opacity-60" />

        <motion.div
          variants={{ hidden: { opacity: 0, scale: 0.94, y: 30 }, visible: { opacity: 1, scale: 1, y: 0 } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -100px 0px" }}
          transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
          className="relative z-30 max-w-3xl bg-cinematic-bg/80 border border-cinematic-border text-cinematic-text p-12 md:p-20 backdrop-blur-md shadow-brutal"
        >
          <motion.div
            className="mx-auto size-16 border border-primary/40 bg-primary/10 mb-8 flex items-center justify-center text-primary"
            animate={{ rotate: [0, 10, -10, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
          >
            <Sparkles className="size-8" />
          </motion.div>

          <SplitText
            text="What is past is prologue."
            as="h2"
            className="text-4xl md:text-6xl lg:text-7xl font-heading font-black tracking-tighter uppercase leading-[0.85] mb-8 text-cinematic-text"
            stagger={0.055}
          />

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12"
          >
            <MagneticButton strength={0.25}>
              <Button
                size="lg"
                className="h-14 px-10 text-sm font-bold tracking-widest uppercase transition-shadow"
                asChild
              >
                <Link href="/login">Begin the Journey</Link>
              </Button>
            </MagneticButton>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="relative z-10 py-10 px-6 md:px-12 bg-background border-t border-primary">
        <SectionDivider variant="smoke" fill="bg-background" stroke="text-primary/30" className="opacity-50 -top-px rotate-180" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="font-heading text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              <div className="size-4 bg-primary" />
              Fungga Wari Lab
            </span>
            <span className="text-3xs font-mono text-muted-foreground uppercase tracking-widest mt-2 border border-border px-2 py-1">
              Oral History Systems v2.0
            </span>
            <span className="text-3xs font-mono text-muted-foreground/70 uppercase tracking-widest mt-4">
              Code. Coffee. Oliver Oinam (Fungga_Wari Team)
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-2xs font-mono text-muted-foreground uppercase tracking-widest font-bold">
            {["Archive", "Sys_Status", "Protocol", "Data Terms"].map((label, index) => (
              <ScrollReveal direction="up" distance={20} duration={0.8} delay={index * 0.15} key={label}>
                <motion.span whileHover={{ color: "var(--primary)" }} className="cursor-pointer block">
                  <Link href="#" className="hover:underline underline-offset-4 decoration-2 transition-all">
                    {label}
                  </Link>
                </motion.span>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
