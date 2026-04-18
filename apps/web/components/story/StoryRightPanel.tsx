"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import {
  Volume2,
  Play,
  Pause,
  Square,
  Loader2,
  BookOpen,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useStoryReader } from "./StoryReaderContext";
import { useKokoroTTS } from "@/hooks/useKokoroTTS";
import { BookmarkToggle } from "./BookmarkToggle";

/**
 * StoryRightPanel — Right panel of the 3-panel cinematic reader.
 *
 * Features:
 * - Kokoro-82M TTS: reads the current scene's text blocks via a Web Worker
 * - Bookmark toggle
 * - Story metadata
 *
 * Must be a Client Component (uses hooks + Web Audio API).
 */
export function StoryRightPanel() {
  const { activeScene, story, currentSceneId } = useStoryReader();

  // ── Extract readable text from current scene's tiptap_content or content ──
  const sceneText = React.useMemo<string | null>(() => {
    if (!activeScene || !currentSceneId) return null;

    // Helper: walk TipTap ProseMirror nodes and collect text
    function extractFromTiptap(node: Record<string, unknown> | undefined): string {
      if (!node) return "";
      if (node.type === "text" && typeof node.text === "string") return node.text;
      const children = node.content as Record<string, unknown>[] | undefined;
      if (!children) return "";
      return children.map(extractFromTiptap).join(" ");
    }

    // Prefer tiptap_content (rich), fall back to plain content
    if (activeScene.tiptap_content) {
      const text = extractFromTiptap(activeScene.tiptap_content as Record<string, unknown>);
      if (text.trim()) return text.trim();
    }

    if (activeScene.content) {
      return activeScene.content.trim() || null;
    }

    return null;
  }, [activeScene, currentSceneId]);

  const { state, play, pause, resume, stop, isReady } =
    useKokoroTTS(sceneText);

  const isPlaying = state === "playing";
  const isPaused = state === "paused";
  const isModelLoading = state === "loading" && !isReady;
  const isGenerating = state === "loading" && isReady;

  // ── Waveform bars (stable across re-renders) ────────────────────────────────
  const barHeights = React.useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) =>
        Math.max(12, ((i * 11 + i * i * 3) % 68) + 10)
      ),
    []
  );

  return (
    <aside
      data-slot="story-right-panel"
      className="w-80 h-full flex flex-col px-5 pt-6 pb-6 border-l border-cinematic-border shrink-0 bg-cinematic-panel/90 backdrop-blur-md z-10 overflow-y-auto scrollbar-none"
    >
      {/* ── Actions row ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <BookOpen className="size-4 text-brand-ember/60" />
          <span className="font-mono text-[9px] uppercase tracking-widest">
            Reader Panel
          </span>
        </div>
        {story?._id && (
          <BookmarkToggle storyId={story._id as any} />
        )}
      </div>

      {/* ── Audio Narration ─────────────────────────────────────────────── */}
      <section aria-label="Audio narration" className="mb-8">
        <div className="flex items-center gap-2 text-brand-ember text-[9px] font-mono font-bold mb-4 uppercase tracking-widest">
          <Volume2 className="size-3.5" />
          Audio Narration
          {isModelLoading && (
            <Loader2 className="size-3 animate-spin text-muted-foreground/50 ml-auto" />
          )}
        </div>

        {/* Waveform display */}
        <div className="border border-cinematic-border/40 bg-black/30 overflow-hidden mb-3">
          <div className="w-full h-16 relative flex items-end px-3 pb-1 gap-[2px]">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-ember/10 to-transparent pointer-events-none" />
            {barHeights.map((h, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-none transition-all",
                  isPlaying
                    ? "bg-brand-ember/70 animate-[pulse_1.5s_ease-in-out_infinite]"
                    : isPaused
                      ? "bg-brand-ember/30"
                      : "bg-cinematic-border/50"
                )}
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>

          {/* Transport controls */}
          <div className="flex items-center gap-3 px-4 py-3 border-t border-cinematic-border/20">
            {/* Play / Pause / Resume */}
            <button
              onClick={
                isPlaying ? pause : isPaused ? resume : play
              }
              disabled={!isReady || isGenerating || !sceneText}
              aria-label={
                isPlaying
                  ? "Pause narration"
                  : isPaused
                    ? "Resume narration"
                    : "Play narration"
              }
              className={cn(
                "size-8 border flex items-center justify-center transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isReady && sceneText && !isGenerating
                  ? "border-brand-ember/50 text-brand-ember hover:bg-brand-ember/10 cursor-pointer"
                  : "border-border/20 text-muted-foreground/30 cursor-not-allowed"
              )}
            >
              {isGenerating ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : isPlaying || isPaused ? (
                <Pause className="size-3.5" />
              ) : (
                <Play className="size-3.5 translate-x-px" />
              )}
            </button>

            {/* Stop */}
            {(isPlaying || isPaused) && (
              <button
                onClick={stop}
                aria-label="Stop narration"
                className="size-8 border border-border/30 text-muted-foreground hover:text-foreground hover:border-border flex items-center justify-center transition-all"
              >
                <Square className="size-3 fill-current" />
              </button>
            )}

            {/* Status label */}
            <span className="ml-auto text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50">
              {isModelLoading && "Loading model…"}
              {isGenerating && "Generating…"}
              {isReady && !sceneText && state === "idle" && "No text"}
              {isReady && sceneText && state === "idle" && "Ready"}
              {isPlaying && "Playing"}
              {isPaused && "Paused"}
            </span>
          </div>
        </div>

        {/* Model hint */}
        {!isReady && (
          <p className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest text-center">
            Kokoro-82M ONNX — First load takes ~30s
          </p>
        )}
      </section>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div className="h-px bg-cinematic-border/30 mb-8" />

      {/* ── Story Metadata ───────────────────────────────────────────────── */}
      <section aria-label="Story metadata" className="space-y-4">
        <h3 className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50">
          Manuscript Info
        </h3>
        {story?.title && (
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40 mb-1">
              Title
            </p>
            <p className="font-heading text-sm text-cinematic-text font-medium truncate">
              {story.title}
            </p>
          </div>
        )}
        {story?.category && (
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40 mb-1">
              Category
            </p>
            <p className="font-mono text-[10px] text-brand-ochre uppercase tracking-widest">
              {story.category}
            </p>
          </div>
        )}
        {story?.language && (
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40 mb-1">
              Language
            </p>
            <p className="font-mono text-[10px] text-foreground uppercase tracking-widest">
              {story.language}
            </p>
          </div>
        )}
      </section>

      {/* ── Bottom ember glow accent ─────────────────────────────────────── */}
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
