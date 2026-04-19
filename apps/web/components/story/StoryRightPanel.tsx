"use client";

import * as React from "react";
import {
  BookOpen,
  Loader2,
  Mic2,
  Pause,
  PanelRightClose,
  Play,
  Square,
  Zap,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useElevenLabsTTS } from "@/hooks/useElevenLabsTTS";
import { BookmarkToggle } from "./BookmarkToggle";
import { useStoryReader } from "./StoryReaderContext";

/**
 * StoryRightPanel — Right panel of the cinematic reader.
 *
 * Narration powered by ElevenLabs AI voice synthesis.
 * Futuristic HUD aesthetic: spectrum bars, scanlines, glitch pulse.
 */
type StoryRightPanelProps = {
  /** 'desktop' renders as a fixed aside; 'mobile' renders as scrollable content */
  variant?: "desktop" | "mobile";
  /** Called when the user clicks the close/collapse button (desktop only) */
  onClose?: () => void;
};

/** Deterministic bar heights based on index to avoid SSR mismatch */
function deriveBarHeight(index: number): number {
  return Math.max(10, ((index * 13 + index * index * 5) % 72) + 8);
}

const BAR_HEIGHTS = Array.from({ length: 32 }, (_, i) => deriveBarHeight(i));

export function StoryRightPanel({ variant = "desktop", onClose }: StoryRightPanelProps) {
  const { activeScene, story, currentSceneId } = useStoryReader();

  const sceneText = React.useMemo<string | null>(() => {
    if (!activeScene || !currentSceneId) return null;

    function extractFromTiptap(
      node: Record<string, unknown> | undefined,
    ): string {
      if (!node) return "";
      if (node.type === "text" && typeof node.text === "string") return node.text;
      const children = node.content as Record<string, unknown>[] | undefined;
      if (!children) return "";
      return children.map(extractFromTiptap).join(" ");
    }

    if (activeScene.tiptap_content) {
      const text = extractFromTiptap(
        activeScene.tiptap_content as Record<string, unknown>,
      );
      if (text.trim()) return text.trim();
    }

    if (activeScene.content) return activeScene.content.trim() || null;
    return null;
  }, [activeScene, currentSceneId]);

  const { state, play, pause, resume, stop } = useElevenLabsTTS(sceneText);

  const isPlaying = state === "playing";
  const isPaused = state === "paused";
  const isLoading = state === "loading";
  const isError = state === "error";
  const isActive = isPlaying || isPaused;

  const wrapperClassName =
    variant === "mobile"
      ? "w-full flex flex-col px-5 pt-6 pb-6 bg-cinematic-panel z-10 overflow-y-auto scrollbar-none"
      : "w-80 h-full flex flex-col px-5 pt-6 pb-6 border-l border-cinematic-border shrink-0 bg-cinematic-panel/90 backdrop-blur-md z-10 overflow-y-auto scrollbar-none";

  return (
    <aside
      data-slot="story-right-panel"
      className={wrapperClassName}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <BookOpen className="size-4 text-brand-ember/60" />
          <span className="font-mono text-[9px] uppercase tracking-widest">
            Reader Panel
          </span>
        </div>
        <div className="flex items-center gap-2">
          {story?.id ? <BookmarkToggle storyId={story.id} /> : null}
          {/* Close/collapse button — desktop only, hidden in mobile sheet */}
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close reader panel"
              className="size-7 flex items-center justify-center border border-cinematic-border/30 text-muted-foreground/50 hover:text-cinematic-text hover:border-brand-ember/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <PanelRightClose className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── ElevenLabs AI Narration ─────────────────────────── */}
      <section aria-label="AI audio narration" className="mb-8">
        {/* Section label */}
        <div className="flex items-center gap-2 mb-4">
          <Mic2 className="size-3.5 text-brand-ember" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-brand-ember font-bold">
            AI Narration
          </span>
          <span className="ml-auto flex items-center gap-1">
            <Zap className="size-2.5 text-brand-glow/70" />
            <span className="font-mono text-[8px] uppercase tracking-widest text-brand-glow/70">
              ElevenLabs
            </span>
          </span>
        </div>

        {/* Spectrum visualiser */}
        <div className="relative border border-cinematic-border/40 bg-cinematic-panel/80 overflow-hidden mb-1">
          {/* Scanline overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, oklch(0 0 0 / 80%) 2px, oklch(0 0 0 / 80%) 3px)",
            }}
          />

          {/* Spectrum bars */}
          <div className="w-full h-16 relative flex items-end px-2 pb-1 gap-px">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-ember/8 to-transparent pointer-events-none" />
            {BAR_HEIGHTS.map((height, index) => (
              <div
                key={index}
                className={cn(
                  "flex-1 rounded-none transition-all duration-150",
                  isPlaying
                    ? "bg-brand-ember/80"
                    : isPaused
                      ? "bg-brand-ember/35"
                      : isLoading
                        ? "bg-brand-glow/40"
                        : isError
                          ? "bg-destructive/40"
                          : "bg-cinematic-border/30",
                )}
                style={{
                  height: `${height}%`,
                  ...(isPlaying && {
                    animation: `spectrumPulse ${0.6 + (index % 5) * 0.15}s ease-in-out ${index * 0.03}s infinite alternate`,
                  }),
                }}
              />
            ))}
          </div>

          {/* Status line at bottom of visualiser */}
          <div
            className={cn(
              "h-px w-full transition-all duration-500",
              isPlaying
                ? "bg-brand-ember shadow-[0_0_6px_var(--brand-ember)]"
                : isPaused
                  ? "bg-brand-ember/40"
                  : isLoading
                    ? "bg-brand-glow/60"
                    : "bg-cinematic-border/20",
            )}
          />
        </div>

        {/* Controls row */}
        <div className="border border-cinematic-border/40 bg-cinematic-panel/80 flex items-center gap-3 px-4 py-3">
          {/* Play / Pause / Resume button */}
          <button
            onClick={isPlaying ? pause : isPaused ? resume : play}
            disabled={isLoading || !sceneText}
            aria-label={
              isPlaying
                ? "Pause narration"
                : isPaused
                  ? "Resume narration"
                  : "Play narration"
            }
            className={cn(
              "size-8 border flex items-center justify-center transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              sceneText && !isLoading && !isError
                ? "border-brand-ember/60 text-brand-ember hover:bg-brand-ember/12 hover:border-brand-ember cursor-pointer"
                : isError
                  ? "border-destructive/50 text-destructive/70 cursor-not-allowed"
                  : "border-border/20 text-muted-foreground/30 cursor-not-allowed",
            )}
          >
            {isLoading ? (
              <Loader2 className="size-3.5 animate-spin text-brand-glow" />
            ) : isPlaying || isPaused ? (
              <Pause className="size-3.5" />
            ) : (
              <Play className="size-3.5 translate-x-px" />
            )}
          </button>

          {/* Stop button — only when active */}
          {isActive ? (
            <button
              onClick={stop}
              aria-label="Stop narration"
              className="size-8 border border-cinematic-border/40 text-muted-foreground hover:text-cinematic-text hover:border-cinematic-border flex items-center justify-center transition-all duration-200 cursor-pointer"
            >
              <Square className="size-3 fill-current" />
            </button>
          ) : null}

          {/* Status label */}
          <span className="ml-auto font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50">
            {isLoading && (
              <span className="text-brand-glow/80 animate-pulse">
                Synthesising…
              </span>
            )}
            {isPlaying && (
              <span className="text-brand-ember">▶ Playing</span>
            )}
            {isPaused && "Paused"}
            {isError && (
              <span className="text-destructive/70">Unavailable</span>
            )}
            {state === "idle" && !sceneText && "No text"}
            {state === "idle" && sceneText && (
              <span className="text-brand-ember/50">Ready</span>
            )}
          </span>
        </div>

        {/* Provider badge */}
        <div className="mt-2 flex items-center justify-center gap-1.5">
          <div
            className={cn(
              "size-1 rounded-none transition-colors",
              isPlaying
                ? "bg-brand-ember shadow-[0_0_4px_var(--brand-ember)]"
                : "bg-cinematic-border/30",
            )}
          />
          <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground/30">
            Powered by ElevenLabs AI
          </span>
          <div
            className={cn(
              "size-1 rounded-none transition-colors",
              isPlaying
                ? "bg-brand-ember shadow-[0_0_4px_var(--brand-ember)]"
                : "bg-cinematic-border/30",
            )}
          />
        </div>
      </section>

      <div className="h-px bg-cinematic-border/30 mb-8" />

      {/* ── Story Metadata ─────────────────────────────────── */}
      <section aria-label="Story metadata" className="space-y-4">
        <h3 className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50">
          Manuscript Info
        </h3>
        {story?.title ? (
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40 mb-1">
              Title
            </p>
            <p className="font-heading text-sm text-cinematic-text font-medium truncate">
              {story.title}
            </p>
          </div>
        ) : null}
        {story?.category ? (
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40 mb-1">
              Category
            </p>
            <p className="font-mono text-[10px] text-brand-ochre uppercase tracking-widest">
              {story.category}
            </p>
          </div>
        ) : null}
        {story?.language ? (
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40 mb-1">
              Language
            </p>
            <p className="font-mono text-[10px] text-cinematic-text uppercase tracking-widest">
              {story.language}
            </p>
          </div>
        ) : null}
      </section>

      {/* ── Footer pip ─────────────────────────────────────── */}
      <div className="mt-auto pt-8">
        <div className="flex items-center gap-1.5">
          <div className="size-1 bg-brand-ember/30 rounded-none" />
          <div className="size-1 bg-brand-ember/50 rounded-none" />
          <div className="size-1 bg-brand-ember rounded-none shadow-[0_0_4px_var(--brand-ember)]" />
        </div>
      </div>
    </aside>
  );
}
