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
import { BorderBeam } from "@workspace/ui/components/border-beam";
import { Marquee } from "@workspace/ui/components/marquee";

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const bentoContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const bentoItem: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 180, damping: 22 },
  },
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
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 max-w-7xl mx-auto flex h-full">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`w-1/4 h-full flex-shrink-0 border-r border-border border-dashed ${
              i === 0 ? "" : i === 1 ? "hidden md:block" : i === 2 ? "hidden lg:block" : "hidden lg:block"
            }`}
            animate={{ opacity: [0.1, 0.22, 0.1] }}
            transition={{
              duration: 4 + i * 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.6,
            }}
          />
        ))}
      </div>
    </div>
  );
}


// ─── Story Ticker ────────────────────────────────────────────────────────────

function StoryTicker() {
  const stories = [
    "Hiyangthau",
    "Henjunaha",
    "Kabokki Nong",
    "Lanmei Thanbi",
    "Kabui Keioiba",
    "Lai Khutsangbi",
    "Lamhui Lousing",
    "Laira Macha Taret",
    "Lukhrabi Amadi Hangoi",
    "Henzoonaha",
  ];

  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden border-b border-border">
      {/* Background Polish */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(64,115,260,0.03),transparent_70%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12 relative z-10">
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-8 bg-primary" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary font-bold">Catalogue Index</span>
          </div>
          <h3 className="text-xl md:text-2xl font-heading font-black uppercase tracking-tighter text-foreground ml-3">
            Oral Tradition Archives
          </h3>
        </div>
      </div>
      
      {/* Typrographic Wall with Edge Masking */}
      <div className="relative [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] md:relative">
        <div className="-space-y-4 md:-space-y-8 lg:-space-y-12">
          {/* Row 1: Solid & Subtle */}
          <Marquee pauseOnHover className="[--gap:4rem] py-2" repeat={3} duration={70}>
            {stories.map((story, i) => (
              <div key={i} className="group cursor-default px-8">
                <span className="text-6xl md:text-8xl lg:text-9xl font-heading font-black uppercase tracking-tighter text-muted-foreground/10 group-hover:text-primary/40 transition-colors duration-700 select-none">
                  {story}
                </span>
              </div>
            ))}
          </Marquee>
          
          {/* Row 2: Outline & Prominent */}
          <Marquee pauseOnHover reverse className="[--gap:4rem] py-2" repeat={3} duration={55}>
            {stories.slice().reverse().map((story, i) => (
              <div key={i} className="group cursor-default px-8">
                <span 
                  className="text-6xl md:text-8xl lg:text-9xl font-heading font-black uppercase tracking-tighter text-transparent group-hover:text-primary transition-all duration-700 select-none"
                  style={{ WebkitTextStroke: '1px var(--color-primary, oklch(0.40 0.18 260 / 0.15))' }}
                >
                  {story}
                </span>
              </div>
            ))}
          </Marquee>

          {/* Row 3: Solid & Deep */}
          <Marquee pauseOnHover className="[--gap:4rem] py-2" repeat={3} duration={85}>
            {stories.map((story, i) => (
              <div key={i} className="group cursor-default px-8">
                <span className="text-6xl md:text-8xl lg:text-9xl font-heading font-black uppercase tracking-tighter text-muted-foreground/5 group-hover:text-primary/30 transition-colors duration-700 select-none">
                  {story}
                </span>
              </div>
            ))}
          </Marquee>
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
  index,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  index: number;
}) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });

  return (
    <motion.div
      ref={ref}
      variants={bentoItem}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={index}
      whileHover={{ backgroundColor: "var(--secondary)", transition: { duration: 0.2 } }}
      className="group p-8 border-b sm:border-b-0 sm:border-r border-border bg-background last:border-r-0 last:border-b-0 transition-colors cursor-default"
    >
      <motion.div
        className="size-12 mb-8 border border-border flex items-center justify-center bg-muted/20 text-foreground"
        whileHover={{ rotate: 6, scale: 1.08, backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <Icon className="size-5" />
      </motion.div>
      <h3 className="text-lg font-bold uppercase tracking-tight mb-3">{title}</h3>
      <p className="text-muted-foreground font-mono text-xs leading-relaxed mb-6 h-12">{desc}</p>
      <motion.div
        className="h-[1px] bg-primary"
        initial={{ width: "24px" }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const heroRef = React.useRef(null);

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden font-sans">
      <ScrollProgressBar />
      <Navbar />
      <GridBackground />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative px-6 md:px-12 pt-32 md:pt-40 lg:pt-48 pb-24 lg:pb-32 overflow-hidden"
      >
        <motion.div
          style={{ opacity: heroOpacity }}
          className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10"
        >
          {/* Hero Content */}
          <div className="lg:col-span-7">
            {/* Status Badge */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-3 mb-6 border border-border inline-flex p-2 pr-6 bg-secondary/50"
            >
              <motion.div
                className="size-3 bg-status-active"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                FW_LAB • Mainframe
              </span>
            </motion.div>

            {/* Split-text headline */}
            <div className="mb-5">
              <SplitText
                text="Preserve Stories."
                as="h1"
                className="text-6xl sm:text-7xl md:text-8xl font-heading font-black tracking-tighter uppercase leading-[0.88]"
                stagger={0.07}
                delay={0.1}
              />
              <SplitText
                text="Power Culture."
                as="h1"
                className="text-6xl sm:text-7xl md:text-8xl font-heading font-black tracking-tighter uppercase leading-[0.88] text-muted-foreground/70"
                stagger={0.07}
                delay={0.3}
              />
            </div>

            {/* Subtext */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.55 }}
              className="py-2 pl-4 border-l-2 border-primary/50 mb-8 max-w-xl"
            >
              <p className="text-sm md:text-base text-muted-foreground font-mono leading-relaxed">
                A digital ecosystem for folk stories, cultural archiving, and community knowledge.
                Bridging ancient lore with the future of culture through minimalist architecture.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-4"
            >
              <MagneticButton strength={0.3}>
                <Button
                  size="lg"
                  className="h-14 px-8 text-sm font-bold tracking-widest uppercase shadow-brutal hover:shadow-brutal-primary transition-shadow"
                >
                  Explore Network
                  <ArrowRight className="ml-3 size-4" />
                </Button>
              </MagneticButton>

              <MagneticButton strength={0.25}>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-sm font-bold tracking-widest uppercase border border-border hover:bg-secondary transition-colors"
                >
                  Initialize User
                </Button>
              </MagneticButton>
            </motion.div>
          </div>

          {/* Hero Visual */}
          <div className="lg:col-span-5 relative hidden lg:flex items-center justify-center h-full min-h-[500px]">
            <motion.div
              style={{ y }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full aspect-[3/4] border border-border bg-background shadow-brutal p-5 md:p-6 flex flex-col justify-between overflow-hidden group hover:shadow-brutal-primary transition-shadow duration-500"
            >
              <BorderBeam size={150} duration={8} delay={1} />
              {/* Glow */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/8 blur-[120px] rounded-full pointer-events-none z-[-1]"
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="flex justify-between items-start z-10">
                <div className="text-[10px] md:text-xs font-mono text-primary font-bold uppercase tracking-widest">
                  SYS.ID: 9X-ALPHA
                </div>
                <Users className="size-5 md:size-6 text-primary/70 group-hover:text-primary transition-colors" />
              </div>

              <div className="flex-1 flex items-center justify-center py-4 relative">
                <video
                  src="/video/9X-ALPHA.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full min-h-[240px] max-h-[500px] object-cover"
                />
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-[10px] text-muted-foreground uppercase leading-tight font-mono tracking-tighter">
                  Location: Loktak Lake, Manipur <br />
                  Data: Visual Topology & Lore <br />
                  Mode: Ambient Preservation
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <StoryTicker />

      {/* ─── FEATURE BENTO ────────────────────────────────────────────────── */}
      <section
        id="stories"
        className="relative py-24 md:py-32 px-6 md:px-12 bg-secondary/10 border-y border-border"
      >
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Platform Core"
            title="Digital Artifacts"
            subtitle="Transforming fragile oral traditions into permanent digital foundations via our Neo-Archival protocol."
          />

          <motion.div
            variants={bentoContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[250px]"
          >
            {/* Feature 1 */}
            <motion.div variants={bentoItem} className="md:col-span-8">
              <Card className="h-full shadow-brutal hover:shadow-brutal-primary transition-shadow duration-300 bg-background p-6 flex flex-col justify-between group relative overflow-hidden text-foreground">
                <BorderBeam size={250} duration={10} delay={0} />
                <div className="absolute top-0 right-0 w-2/3 h-full z-0 opacity-70 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700 ease-in-out">
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent z-10" />
                  <Image
                    src="/Folk-Stories-Archive.png"
                    alt="Folk Stories Archive"
                    fill
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
                      Folk Stories Archive
                    </CardTitle>
                    <CardDescription className="font-mono text-sm max-w-xs font-semibold text-muted-foreground drop-shadow-sm">
                      A centralized repository for deep-earth oral traditions, manuscripts, and cultural lore, structured for permanence.
                    </CardDescription>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={bentoItem} className="md:col-span-4">
              <Card className="h-full shadow-brutal hover:shadow-brutal-primary transition-shadow duration-300 bg-secondary/30 p-6 flex flex-col justify-between group">
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
                  <CardTitle className="text-xl uppercase tracking-tighter mb-2">Verified Transcriptions</CardTitle>
                  <CardDescription className="text-xs font-mono">
                    Meticulously crafted records capturing the authentic polyvocal streams of oral tradition.
                  </CardDescription>
                </div>
              </Card>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={bentoItem} className="md:col-span-5">
              <Card className="h-full shadow-brutal hover:shadow-brutal-primary transition-shadow duration-300 bg-primary text-primary-foreground p-6 flex flex-col justify-between group border-primary">
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
                  <CardTitle className="text-xl uppercase tracking-tighter mb-2">Community Hub</CardTitle>
                  <CardDescription className="text-xs font-mono opacity-80 text-primary-foreground">
                    A collaborative space for creators to co-author history and validate local lore.
                  </CardDescription>
                </div>
              </Card>
            </motion.div>

            {/* Feature 4 */}
            <motion.div variants={bentoItem} className="md:col-span-7">
              <Card className="h-full shadow-brutal hover:shadow-brutal-primary transition-shadow duration-300 bg-background p-6 flex flex-col justify-between group">
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
                    <CardTitle className="text-xl uppercase tracking-tighter mb-2">Preservation Tools</CardTitle>
                    <CardDescription className="text-xs font-mono">
                      Specialized toolsets for archiving endangered cultural data with modern stability.
                    </CardDescription>
                  </div>
                  <div className="hidden sm:flex border border-border p-4 bg-secondary items-center justify-center font-mono text-[10px] uppercase text-muted-foreground">
                    Integrity: Verified
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── CAPABILITIES ─────────────────────────────────────────────────── */}
      <section className="relative py-24 md:py-32 px-6 md:px-12 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="The Tech Stack"
            badge="Infrastructure"
            subtitle="High-fidelity systems designed to process, store, and distribute cultural heritage at scale."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-border">
            {[
              { title: "Story Hosting", desc: "High-performance storage for multimedia formats.", icon: Globe },
              { title: "Semantic Authoring", desc: "Structured Zen Brutalist editor for deep narrative craft.", icon: Cpu },
              { title: "Live Annotations", desc: "Realtime collaboration tools for translation & tagging.", icon: BookOpen },
              { title: "Metadata Schemas", desc: "Structured data designed for indigenous heritage.", icon: Database },
            ].map((cap, i) => (
              <CapabilityCell key={i} icon={cap.icon} title={cap.title} desc={cap.desc} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 md:px-12 flex items-center justify-center text-center overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 z-0">
          <Image
            src="/Closing-CTA.png"
            alt="Build the Future"
            fill
            className="object-cover opacity-80 mix-blend-luminosity"
          />
        </div>
        <div className="absolute inset-0 z-0 bg-primary/70 mix-blend-multiply" />
        <div className="absolute inset-0 z-10 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:32px_32px]" />

        <motion.div
          variants={{ hidden: { opacity: 0, scale: 0.94, y: 30 }, visible: { opacity: 1, scale: 1, y: 0 } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -100px 0px" }}
          transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
          className="relative z-20 max-w-3xl border border-border bg-background text-foreground p-12 md:p-20 shadow-brutal-primary backdrop-blur-sm"
        >
          <motion.div
            className="mx-auto size-16 border border-border bg-secondary mb-8 flex items-center justify-center text-primary"
            animate={{ rotate: [0, 10, -10, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
          >
            <Sparkles className="size-8" />
          </motion.div>

          <SplitText
            text="Build the Future Of Stories"
            as="h2"
            className="text-4xl md:text-6xl lg:text-7xl font-heading font-black tracking-tighter uppercase leading-[0.85] mb-8"
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
                className="h-14 px-10 text-sm font-bold tracking-widest uppercase shadow-brutal hover:shadow-brutal-primary transition-shadow"
                asChild
              >
                <Link href="/login">Initialize Comm</Link>
              </Button>
            </MagneticButton>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="relative z-10 py-10 px-6 md:px-12 bg-background border-t border-primary">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="font-heading text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              <div className="size-4 bg-primary" />
              Fungga_Wari
            </span>
            <span className="text-3xs font-mono text-muted-foreground uppercase tracking-widest mt-2 border border-border px-2 py-1">
              Oral History Systems v2.0
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-2xs font-mono text-muted-foreground uppercase tracking-widest font-bold">
            {["Protocol", "Data Terms", "Sys_Status"].map((label) => (
              <motion.span key={label} whileHover={{ color: "var(--primary)" }} className="cursor-pointer">
                <Link href="#" className="hover:underline underline-offset-4 decoration-2 transition-all">
                  {label}
                </Link>
              </motion.span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
