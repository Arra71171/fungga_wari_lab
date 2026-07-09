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
import {
  Card,
  CardDescription,
  CardTitle,
} from "@workspace/ui/components/card";
import { MagneticButton } from "@workspace/ui/components/MagneticButton";
import { SplitText } from "@workspace/ui/components/SplitText";
import { BorderBeam } from "@workspace/ui/components/border-beam";
import { ScrollReveal } from "@workspace/ui/components/ScrollReveal";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

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

export function ScrollProgressBarIsland() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    return scrollYProgress.on("change", (v) => setProgress(Math.round(v * 100)));
  }, [scrollYProgress]);

  return (
    <motion.div
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      data-slot="scroll-progress"
      className="fixed top-0 left-0 right-0 z-[100] h-[2px] bg-primary origin-left"
      style={{ scaleX }}
    />
  );
}

export function HeroIsland() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroRef = React.useRef(null);

  return (
    <section
      ref={heroRef}
      className="relative px-6 md:px-12 lg:px-20 py-24 min-h-[85vh] flex items-center justify-center overflow-hidden"
    >
      <motion.div
        style={{ opacity: heroOpacity }}
        className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10"
      >
        <div className="flex flex-col justify-center max-w-lg space-y-4">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] leading-[1.05] text-foreground">
              <span className="font-heading font-medium block">Where stories</span>
              <span className="block whitespace-nowrap">
                <span className="font-display italic text-brand-amber pr-2">outlive</span>
                <span className="font-heading font-medium text-outline">silence.</span>
              </span>
            </h1>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.4 }} className="py-2 pr-12">
            <p className="text-lg md:text-xl text-muted-foreground font-sans leading-relaxed">
              A digital sanctuary for Meetei folk traditions, oral histories, and the living lore of Loktak — crafted to honour.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.6 }} className="flex flex-col gap-4">
            <div className="flex pt-4">
              <MagneticButton strength={0.2}>
                <Button size="lg" className="h-12 px-8 rounded-none bg-foreground text-background hover:bg-foreground/90 text-sm font-sans font-medium transition-all shadow-sm" asChild>
                  <Link href="/stories">
                    Explore the Archive
                    <ArrowRight className="ml-2 size-4 opacity-70" />
                  </Link>
                </Button>
              </MagneticButton>
            </div>
          </motion.div>
        </div>

        <div className="relative flex items-center justify-center lg:justify-end w-full lg:pr-8">
          <ScrollReveal direction="up" distance={50} duration={1.2} scrub={0.5} className="relative z-10 w-full max-w-sm">
            <div className="relative w-full aspect-square sm:max-w-sm mx-auto lg:max-w-sm bg-background rounded-none p-6 flex flex-col justify-between group transition-all duration-500 hover:shadow-xl z-10 border border-border/40">
              <motion.div
                className="absolute inset-0 bg-primary/5 blur-[80px] rounded-none pointer-events-none z-[-1]"
                animate={{ scale: [1, 1.02, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="flex justify-between items-center z-10 w-full mb-6">
                <div className="flex items-center gap-3">
                  <div className="size-1.5 bg-primary rounded-none" />
                  <div className="text-xs font-sans text-muted-foreground font-medium tracking-wider uppercase">
                    SYS.ID: 9X-ALPHA
                  </div>
                </div>
                <Users className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              <div className="flex-1 flex items-center justify-center relative rounded-none border border-border/40 bg-secondary/10 overflow-hidden mb-5">
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
                
                <div className="absolute bottom-0 right-0 px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-none border-t border-l border-border/50 z-20 pointer-events-auto">
                  <span className="text-[10px] font-sans font-semibold tracking-wider text-muted-foreground uppercase">Loktak Lake</span>
                </div>
              </div>

              <div className="border-t border-border/30 pt-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-[10px] font-sans tracking-wide text-foreground/70">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground/60 uppercase font-semibold">Location</span>
                    <span className="font-medium text-foreground">Loktak Lake, Manipur</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground/60 uppercase font-semibold">Data</span>
                    <span className="font-medium text-foreground">Visual Topology & Lore</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground/60 uppercase font-semibold">Protocol</span>
                    <span className="font-medium text-foreground">Neo-Archival v2</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground/60 uppercase font-semibold">Integrity</span>
                    <span className="font-medium text-foreground flex items-center gap-1.5"><div className="size-1.5 bg-green-500/80 rounded-none"/> Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </motion.div>
    </section>
  );
}

export function SectionHeadingIsland({ title, subtitle, badge }: { title: string; subtitle?: string; badge?: string; }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });

  return (
    <div ref={ref} className="mb-20 md:mb-24 flex flex-col items-center text-center max-w-3xl mx-auto">
      <AnimatePresence>
        {badge && (
          <motion.span
            variants={clipReveal}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="inline-block px-3 py-1 mb-4 text-xs font-sans text-xs font-medium tracking-wide text-primary/80 bg-primary/5 rounded-none"
          >
            {badge}
          </motion.span>
        )}
      </AnimatePresence>
      <SplitText text={title} as="h2" className="text-4xl md:text-5xl lg:text-6xl font-heading font-semibold tracking-tight leading-none mb-4" stagger={0.055} delay={0.05} />
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

export function BentoGridIsland() {
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
    <div className="max-w-5xl mx-auto w-full" ref={bentoGridRef}>
      <SectionHeadingIsland
        badge="Catalogue Index"
        title="The Archive of Orality"
        subtitle="A curated index of ancient folklore, recorded precisely as they were spoken under the evening hearth."
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[250px]">
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
                  className="size-12 border border-border/50 bg-secondary/50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  <Archive className="size-5" />
                </motion.div>
                <span className="font-sans text-xs text-muted-foreground/50 font-medium group-hover:text-primary-foreground/50 transition-colors">
                  REF_01
                </span>
              </div>
              <div className="mt-8 max-w-sm">
                <CardTitle className="text-2xl lg:text-3xl tracking-tight mb-4 text-foreground">
                  Folklore Repository
                </CardTitle>
                <CardDescription className="font-sans text-sm max-w-xs font-semibold text-muted-foreground drop-shadow-sm">
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
                className="size-10 border border-primary/10 bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              >
                <BookOpen className="size-5" />
              </motion.div>
            </div>
            <div>
              <CardTitle className="text-xl tracking-tight mb-2">Polyvocal Streams</CardTitle>
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
                className="size-10 border border-primary-foreground/10 bg-primary-foreground/5 flex items-center justify-center text-primary-foreground group-hover:bg-primary-foreground group-hover:text-primary transition-colors"
              >
                <Users className="size-5" />
              </motion.div>
              <span className="font-sans text-xs text-primary-foreground/50">REF_03</span>
            </div>
            <div>
              <CardTitle className="text-xl tracking-tight mb-2">The Hearth (CMS)</CardTitle>
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
                className="size-10 border border-border/50 bg-secondary/50 flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-background transition-colors"
              >
                <Layers className="size-5" />
              </motion.div>
            </div>
            <div className="flex items-end justify-between">
              <div className="max-w-xs">
                <CardTitle className="text-xl tracking-tight mb-2">Neo-Archival Protocol</CardTitle>
                <CardDescription className="text-xs font-mono">
                  End-to-end systems for archiving endangered cultural data with modern stability.
                </CardDescription>
              </div>
              <div className="hidden sm:flex border border-border p-4 bg-secondary items-center justify-center font-sans text-xs uppercase text-muted-foreground">
                Integrity: Verified
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function CapabilityCellIsland({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string; }) {
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
    <div ref={containerRef} className="group p-8 border-r border-border/50 bg-background/50 hover:bg-secondary/20 transition-colors duration-300 cursor-default">
      <div ref={iconRef} className="size-12 mb-8 rounded-none border border-border/50 flex items-center justify-center bg-secondary/30 text-foreground group-hover:-rotate-3 group-hover:scale-110 group-hover:bg-brand-ember group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
        <Icon className="size-5" />
      </div>
      <h3 className="text-lg font-medium tracking-wide text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground font-sans text-xs leading-relaxed mb-6 h-12">{desc}</p>
      <div ref={lineRef} className="h-[1px] bg-brand-ember w-[24px]" />
    </div>
  );
}

export function CtaIsland() {
  return (
    <div className="relative z-30 max-w-5xl mx-auto w-full flex items-center justify-center text-center">
      <motion.div
        variants={{ hidden: { opacity: 0, scale: 0.94, y: 30 }, visible: { opacity: 1, scale: 1, y: 0 } }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -100px 0px" }}
        transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
        className="w-full max-w-3xl bg-cinematic-bg/90 dark:bg-cinematic-panel/85 border border-cinematic-border/40 text-cinematic-text p-12 md:p-20 backdrop-blur-md shadow-sm"
      >
        <motion.div
          className="mx-auto size-16 border border-primary/40 bg-primary/10 mb-8 flex items-center justify-center text-primary"
          animate={{ rotate: [0, 10, -10, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
        >
          <Sparkles className="size-8" />
        </motion.div>

        <SplitText text="What is past is prologue." as="h2" className="text-4xl md:text-6xl lg:text-7xl font-heading font-semibold tracking-tight leading-[0.85] mb-8 text-cinematic-text" stagger={0.055} />

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
          <MagneticButton strength={0.25}>
            <Button size="lg" className="h-14 px-10 text-sm font-medium tracking-wide transition-shadow" asChild>
              <Link href="/login">Begin the Journey</Link>
            </Button>
          </MagneticButton>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function FooterLinksIsland() {
  return (
    <div className="flex flex-wrap justify-center gap-6 text-2xs font-mono text-muted-foreground tracking-wide font-bold">
      {[
        { label: "Archive", href: "/archive" },
        { label: "Sys_Status", href: "/sys-status" },
        { label: "Protocol", href: "/protocol" },
        { label: "Data Terms", href: "/data-terms" },
      ].map((item, index) => (
        <ScrollReveal direction="up" distance={20} duration={0.8} delay={index * 0.15} key={item.label}>
          <motion.span whileHover={{ color: "var(--primary)" }} className="cursor-pointer block">
            <Link href={item.href} className="hover:underline underline-offset-4 decoration-2 transition-all">
              {item.label}
            </Link>
          </motion.span>
        </ScrollReveal>
      ))}
    </div>
  );
}
