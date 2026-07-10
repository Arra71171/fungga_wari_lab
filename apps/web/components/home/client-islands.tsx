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
import { BentoGrid, BentoCard } from "@workspace/ui/components/bento-grid";
import {
  Card,
  CardDescription,
  CardTitle,
} from "@workspace/ui/components/card";
import { Lens } from "@workspace/ui/components/lens";
import { MagneticButton } from "@workspace/ui/components/MagneticButton";
import { SplitText } from "@workspace/ui/components/SplitText";
import { BorderBeam } from "@workspace/ui/components/border-beam";
import { ScrollReveal } from "@workspace/ui/components/ScrollReveal";
import { TypingAnimation } from "@workspace/ui/components/typing-animation";
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
      data-slot="hero-island"
      className="relative px-6 md:px-12 lg:px-20 pt-[126px] pb-24 min-h-[85vh] flex items-center justify-center overflow-hidden"
    >
      <motion.div
        style={{ opacity: heroOpacity }}
        className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10"
      >
        <div className="flex flex-col justify-center max-w-lg space-y-4">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] leading-[1.05] text-foreground">
              <span className="font-heading font-medium block">Where stories</span>
              <TypingAnimation
                className="font-heading font-medium text-brand-amber block whitespace-nowrap min-h-[1.2em]"
                words={["outlive silence.", "defy erasure.", "echo forever.", "forge memory."]}
                loop={true}
                duration={100}
                pauseDelay={2500}
              />
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
                <Button size="lg" className="rounded-none bg-foreground text-background hover:bg-foreground/90 text-sm font-sans font-medium transition-all shadow-sm" asChild>
                  <Link href="/stories">
                    Explore
                    <ArrowRight className="ml-2 size-4 opacity-70" />
                  </Link>
                </Button>
              </MagneticButton>
            </div>
          </motion.div>
        </div>

        <div className="relative flex items-center justify-center lg:justify-end w-full lg:pr-8">
          <ScrollReveal direction="up" distance={50} duration={1.2} scrub={0.5} className="relative z-10 w-full max-w-sm">
            <div className="relative w-full aspect-auto sm:aspect-square sm:max-w-sm mx-auto lg:max-w-sm bg-card rounded-none p-6 flex flex-col justify-between group transition-all duration-500 hover:shadow-nordic z-10 border border-border/40">
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

              <div className="flex-1 min-h-[180px] sm:min-h-0 w-full flex items-center justify-center relative rounded-none border border-border/40 bg-secondary/10 overflow-hidden mb-5">
                <Lens zoomFactor={1.5} lensSize={180}>
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
                </Lens>
                
                <div className="absolute bottom-0 right-0 px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-none border-t border-l border-border/50 z-20 pointer-events-auto">
                  <span className="text-[10px] font-sans font-semibold tracking-wider text-muted-foreground uppercase">Loktak Lake</span>
                </div>
              </div>

              <div className="border-t border-border/30 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-[10px] font-sans tracking-wide text-foreground/70">
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
                     <span className="font-medium text-foreground flex items-center gap-1.5"><div className="size-1.5 bg-primary/60 rounded-none"/> Verified</span>
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
    <div ref={ref} data-slot="section-heading-island" className="mb-20 md:mb-24 flex flex-col items-center text-center max-w-3xl mx-auto">
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
        gsap.utils.toArray("[data-slot='bento-card']"),
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
    <div data-slot="bento-grid-island" className="max-w-5xl mx-auto w-full" ref={bentoGridRef}>
      <SectionHeadingIsland
        badge="Catalogue Index"
        title="The Archive of Orality"
        subtitle="A curated index of ancient folklore, recorded precisely as they were spoken under the evening hearth."
      />

      <BentoGrid className="mt-8">
        <BentoCard
          name="Folklore Repository"
          description="Deep-earth oral traditions and cultural lore, structured for digital permanence."
          Icon={Archive}
          href="/stories"
          cta="Explore Repository"
          className="md:col-span-2"
          background={
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent z-10" />
              <Image
                src="/Folk-Stories-Archive.png"
                alt="Folk Stories Archive"
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover object-right opacity-70 transition-transform duration-700 ease-in-out group-hover:scale-105 group-hover:opacity-100"
              />
            </>
          }
        />
        <BentoCard
          name="Polyvocal Streams"
          description="Meticulously captured records of the many voices that carry our heritage."
          Icon={BookOpen}
          href="/#archive"
          cta="Learn More"
          className="md:col-span-1"
          background={<div className="absolute inset-0 bg-secondary/10" />}
        />
        <BentoCard
          name="The Hearth (CMS)"
          description="Where creators co-author history and validate the living breath of local lore."
          Icon={Users}
          href="/login"
          cta="Access Studio"
          className="md:col-span-1"
          background={<div className="absolute inset-0 bg-primary/5" />}
        />
        <BentoCard
          name="Neo-Archival Protocol"
          description="End-to-end systems for archiving endangered cultural data with modern stability."
          Icon={Layers}
          href="/sys-status"
          cta="View Protocol"
          className="md:col-span-2"
          background={<div className="absolute inset-0 bg-secondary/10" />}
        />
      </BentoGrid>
    </div>
  );
}

export function CapabilityCellIsland({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string; }) {
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
    <div ref={containerRef} data-slot="capability-cell-island" className="group p-8 border-r border-border/50 bg-background/50 hover:bg-secondary/20 transition-colors duration-300 cursor-default">
      <div ref={iconRef} className="size-12 mb-8 border border-border/50 flex items-center justify-center bg-secondary/30 text-foreground group-hover:-rotate-3 group-hover:scale-110 group-hover:bg-brand-ember group-hover:text-primary-foreground transition-all duration-300 shadow-nordic-sm rounded-none">
        {icon}
      </div>
      <h3 className="text-lg font-medium tracking-wide text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground font-sans text-xs leading-relaxed mb-6 h-12">{desc}</p>
      <div ref={lineRef} className="h-[1px] bg-brand-ember w-[24px]" />
    </div>
  );
}

export function CtaIsland() {
  return (
    <div data-slot="cta-island" className="relative z-30 max-w-5xl mx-auto w-full flex items-center justify-center text-center">
      <motion.div
        variants={{ hidden: { opacity: 0, scale: 0.94, y: 30 }, visible: { opacity: 1, scale: 1, y: 0 } }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -100px 0px" }}
        transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
        className="w-full max-w-3xl bg-cinematic-bg/90 dark:bg-cinematic-panel/85 border border-cinematic-border/40 text-cinematic-text p-12 md:p-20 backdrop-blur-md shadow-nordic rounded-none"
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
    <div data-slot="footer-links-island" className="flex flex-wrap justify-center gap-6 text-2xs font-mono text-muted-foreground tracking-wide font-bold">
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

export function ScrollTopology() {
  const { scrollYProgress } = useScroll();
  const pathLength = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });

  return (
    <div data-slot="scroll-topology" className="fixed top-0 right-[2vw] bottom-0 w-12 pointer-events-none z-[5] hidden lg:block opacity-40">
      <svg viewBox="0 0 100 1000" className="w-full h-full" preserveAspectRatio="none">
        <motion.path
          d="M 50 0 L 50 150 L 80 180 L 80 300 L 20 330 L 20 500 L 80 530 L 80 750 L 50 780 L 50 1000"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="1.5"
          style={{ pathLength }}
        />
        <motion.path
          d="M 50 0 L 50 150 L 80 180 L 80 300 L 20 330 L 20 500 L 80 530 L 80 750 L 50 780 L 50 1000"
          fill="none"
          stroke="var(--color-muted-foreground)"
          strokeWidth="0.5"
          strokeDasharray="2 4"
          className="opacity-20"
        />
      </svg>
    </div>
  );
}
