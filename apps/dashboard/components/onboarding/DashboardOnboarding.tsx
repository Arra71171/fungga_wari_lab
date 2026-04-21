"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  X, ChevronRight, ChevronLeft,
  BarChart2, BookOpen, Library, Settings2,
  Eye, FileText, Send, Globe2, BookCheck,
  ListTodo, Globe, UserCircle, Sun,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

// ─── Step Content Components ──────────────────────────────────────────────────

function WelcomeContent() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        You&apos;re now inside{" "}
        <span className="font-semibold text-foreground">Fungga Wari Creator Studio</span>{" "}
        — your command center for building and managing the Fungga Wari oral
        literature archive.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: BarChart2, label: "Analytics", desc: "KPIs, charts & pipeline" },
          { icon: BookOpen,  label: "Manuscripts", desc: "Write, edit & publish" },
          { icon: Library,   label: "Assets", desc: "Media via Cloudinary" },
          { icon: Settings2, label: "Settings", desc: "Profile & preferences" },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-start gap-2 border border-border-subtle bg-bg-surface/50 p-3">
            <Icon className="mt-0.5 size-4 shrink-0 text-brand-ember" />
            <div>
              <p className="font-mono text-fine font-semibold uppercase tracking-wide text-foreground">{label}</p>
              <p className="mt-0.5 text-tight-label text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-tight-label text-muted-foreground/60">This tour takes ~30 seconds. You can skip anytime.</p>
    </div>
  );
}

function AnalyticsContent() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        The <span className="font-semibold text-foreground">Overview page</span> is
        your analytics hub. Everything about your archive&apos;s health lives here.
      </p>
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3 border-l-2 border-brand-ember pl-3">
          <Eye className="mt-0.5 size-4 shrink-0 text-brand-ochre" />
          <div>
            <p className="text-tight-label font-semibold text-foreground">KPI Cards</p>
            <p className="text-tight-label text-muted-foreground">
              Total Manuscripts · Total Views · Total Reads · Completion Rate — live stats at a glance.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 border-l-2 border-brand-ochre pl-3">
          <div className="flex shrink-0 items-center gap-1 mt-0.5">
            <FileText className="size-3.5 text-muted-foreground" />
            <Send className="size-3.5 text-brand-ochre" />
            <Globe2 className="size-3.5 text-primary" />
          </div>
          <div>
            <p className="text-tight-label font-semibold text-foreground">Publishing Pipeline</p>
            <p className="text-tight-label text-muted-foreground">
              Track every story&apos;s progress: Drafts → In Review → Published.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 border-l-2 border-border-strong pl-3">
          <BookCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-tight-label font-semibold text-foreground">Engagement Charts</p>
            <p className="text-tight-label text-muted-foreground">
              Completion rate donuts, category distribution, and a real-time activity feed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentToolsContent() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Everything you need to create and manage archive content — three dedicated sections in the sidebar.
      </p>
      <div className="flex flex-col gap-2">
        {[
          {
            icon: BookOpen, color: "text-brand-ember",
            label: "Manuscripts",
            desc: "Block-based editor for stories. Set status (Draft → In Review → Published), add cover art, manage chapters and scenes.",
          },
          {
            icon: ListTodo, color: "text-brand-ochre",
            label: "Tasks",
            desc: "Drag-and-drop Kanban board for translation, transcription, and editorial review tasks.",
          },
          {
            icon: Library, color: "text-muted-foreground",
            label: "Assets",
            desc: "Upload illustrations, audio and media. All assets optimized and served via Cloudinary CDN.",
          },
        ].map(({ icon: Icon, color, label, desc }) => (
          <div key={label} className="flex items-start gap-3 border border-border-subtle bg-bg-surface/30 p-3">
            <Icon className={cn("mt-0.5 size-4 shrink-0", color)} />
            <div>
              <p className="text-tight-label font-semibold text-foreground">{label}</p>
              <p className="text-tight-label text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileContent() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Your profile block and quick actions live at the bottom of the sidebar — always one click away.
      </p>
      <div className="flex flex-col gap-2">
        {[
          { icon: UserCircle, color: "text-brand-ember", label: "Your Profile", desc: "Displays your name and role. Head to Settings to update your avatar and preferences." },
          { icon: Sun,        color: "text-brand-ochre", label: "Theme Toggle", desc: "Switch between light and dark mode instantly — your preference is saved automatically." },
          { icon: Globe,      color: "text-muted-foreground", label: "View Stories (Public Site)", desc: "Opens the immersive reader — see the archive exactly as your audience does." },
        ].map(({ icon: Icon, color, label, desc }) => (
          <div key={label} className={cn("flex items-start gap-3 border-l-2 pl-3", color === "text-brand-ember" ? "border-brand-ember" : color === "text-brand-ochre" ? "border-brand-ochre" : "border-border-strong")}>
            <Icon className={cn("mt-0.5 size-4 shrink-0", color)} />
            <div>
              <p className="text-tight-label font-semibold text-foreground">{label}</p>
              <p className="text-tight-label text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="font-mono text-xs text-brand-ember tracking-wide">
        You&apos;re all set. Start building the archive. 🔥
      </p>
    </div>
  );
}

// ─── Step Definitions ─────────────────────────────────────────────────────────

interface OnboardingStep {
  icon: string;
  title: string;
  content: React.ReactNode;
}

const STEPS: OnboardingStep[] = [
  { icon: "🔥", title: "Welcome to Creator Studio", content: <WelcomeContent /> },
  { icon: "📊", title: "Your Analytics Hub",         content: <AnalyticsContent /> },
  { icon: "✍️", title: "Content & Tools",            content: <ContentToolsContent /> },
  { icon: "👤", title: "Profile & Settings",         content: <ProfileContent /> },
];

// ─── Tour Card ────────────────────────────────────────────────────────────────

interface TourCardProps {
  step: OnboardingStep;
  stepIndex: number;
  totalSteps: number;
  direction: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

function TourCard({ step, stepIndex, totalSteps, direction, onNext, onPrev, onSkip }: TourCardProps) {
  return (
    <motion.div
      key={stepIndex}
      initial={{ opacity: 0, x: direction > 0 ? 40 : -40, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: direction > 0 ? -40 : 40, scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
      className="relative w-[560px] max-w-[92vw] overflow-hidden border border-border bg-bg-panel text-foreground shadow-brutal"
    >
      {/* Top accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-brand-ember via-brand-ochre to-brand-glow" />

      {/* Decorative glow */}
      <div
        className="pointer-events-none absolute right-0 top-0 size-52 translate-x-16 -translate-y-16 rounded-full bg-brand-ember opacity-[0.05] blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col gap-5 p-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center border border-brand-ember/30 bg-brand-ember/10 text-lg">
              {step.icon}
            </div>
            <div>
              <p className="font-mono text-nano uppercase tracking-eyebrow text-brand-ember mb-1">
                Step {stepIndex + 1} of {totalSteps}
              </p>
              <h3 className="font-heading text-xl font-bold tracking-tight text-foreground leading-tight">
                {step.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onSkip}
            aria-label="Skip onboarding tour"
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="text-sm">{step.content}</div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border-subtle pt-4">
          {/* Progress pills */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-[5px] rounded-full transition-all duration-300",
                  i === stepIndex   ? "w-7 bg-brand-ember" :
                  i < stepIndex     ? "w-[5px] bg-brand-ember/40" :
                                      "w-[5px] bg-border-strong"
                )}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                onClick={onPrev}
                aria-label="Previous step"
                className="flex size-8 items-center justify-center border border-border-subtle bg-transparent text-muted-foreground transition-colors hover:bg-bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}
            <button
              onClick={onNext}
              className="flex h-8 items-center gap-1 bg-brand-ember px-5 font-mono text-fine uppercase tracking-widest text-primary-foreground transition-colors hover:bg-brand-ember/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {stepIndex === totalSteps - 1 ? "Get Started" : "Next"}
              {stepIndex !== totalSteps - 1 && <ChevronRight className="size-3" />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Onboarding Component ────────────────────────────────────────────────

export function DashboardOnboarding() {
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSeen = localStorage.getItem("hasSeenDashboardTour");
      if (!hasSeen) {
        setVisible(true);
        localStorage.setItem("hasSeenDashboardTour", "true");
      }
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setDirection(1);
      setStepIndex((s) => s + 1);
    } else {
      setVisible(false);
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setDirection(-1);
      setStepIndex((s) => s - 1);
    }
  };

  const handleSkip = () => setVisible(false);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9998] bg-bg-base/85 backdrop-blur-sm"
            onClick={handleSkip}
            aria-hidden
          />

          {/* Centered card — NEVER clips viewport */}
          <div
            className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center p-4"
            aria-live="polite"
          >
            <div className="pointer-events-auto">
              <AnimatePresence mode="wait" custom={direction}>
                <TourCard
                  key={stepIndex}
                  step={STEPS[stepIndex]}
                  stepIndex={stepIndex}
                  totalSteps={STEPS.length}
                  direction={direction}
                  onNext={handleNext}
                  onPrev={handlePrev}
                  onSkip={handleSkip}
                />
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
