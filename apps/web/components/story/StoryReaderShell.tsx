"use client";

import * as React from "react";
import { Loader2, PanelRightOpen, PanelRightClose } from "lucide-react";
import { useStoryReader } from "./StoryReaderContext";
import { BlockStoryReader } from "./BlockStoryReader";
import { StorySidebar } from "./StorySidebar";
import { StoryRightPanel } from "./StoryRightPanel";
import { KeyboardNavigator } from "./KeyboardNavigator";
import { SceneSearchDialog } from "./SceneSearchDialog";

/**
 * StoryReaderShell — 2-panel cinematic reader with optional right panel.
 *
 * Layout:
 *   ┌────────────────────────────────────────────────┐
 *   │  StorySidebar (w-72) │ BlockStoryReader         │ [toggle →]
 *   │  Chapters / Scenes   │   Center canvas          │ StoryRightPanel
 *   └────────────────────────────────────────────────┘
 *
 * Right panel (TTS + metadata) is collapsed by default.
 * Toggle via the floating button at the top-right of the canvas.
 */
export function StoryReaderShell({ slug }: { slug: string }) {
  const { story, isLoading } = useStoryReader();
  const [rightPanelOpen, setRightPanelOpen] = React.useState(false);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-cinematic-bg gap-4">
        <Loader2 className="size-8 text-brand-ember animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Loading Story…
        </span>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-cinematic-bg gap-4">
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Story not found
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen w-full bg-cinematic-bg text-cinematic-text antialiased overflow-hidden"
      data-slot="story-reader-shell"
    >
      {/* Global keyboard shortcuts + scene search dialog */}
      <KeyboardNavigator />
      <SceneSearchDialog />

      {/* Ambient cinematic glow — top center */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-ember/5 blur-[120px] pointer-events-none z-0" />

      {/* Left sidebar — chapters & scenes navigation */}
      <StorySidebar />

      {/* Center canvas — block-based story content */}
      <div className="relative flex-1 min-w-0">
        <BlockStoryReader slug={slug} />

        {/* Right panel toggle — floats at top-right of center canvas */}
        <button
          onClick={() => setRightPanelOpen((v) => !v)}
          aria-label={rightPanelOpen ? "Close details panel" : "Open details panel"}
          className="absolute top-5 right-5 z-20 flex items-center gap-1.5 px-3 py-1.5 border border-cinematic-border bg-cinematic-panel/80 backdrop-blur-sm text-muted-foreground hover:text-cinematic-text hover:border-brand-ember/40 transition-all text-[10px] font-mono uppercase tracking-widest"
        >
          {rightPanelOpen ? (
            <PanelRightClose className="size-3.5" />
          ) : (
            <PanelRightOpen className="size-3.5" />
          )}
          {rightPanelOpen ? "Close" : "Details"}
        </button>
      </div>

      {/* Right panel — Kokoro TTS narration + metadata (collapsible) */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${
          rightPanelOpen ? "w-80 opacity-100" : "w-0 opacity-0"
        }`}
        aria-hidden={!rightPanelOpen}
      >
        {rightPanelOpen && <StoryRightPanel />}
      </div>
    </div>
  );
}
