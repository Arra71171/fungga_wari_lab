"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { useStoryReader } from "./StoryReaderContext";
import { BlockStoryReader } from "./BlockStoryReader";
import { StorySidebar } from "./StorySidebar";
import { StoryRightPanel } from "./StoryRightPanel";
import { KeyboardNavigator } from "./KeyboardNavigator";
import { SceneSearchDialog } from "./SceneSearchDialog";

/**
 * StoryReaderShell — Orchestrates the 3-panel cinematic reader layout.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────┐
 *   │  StorySidebar (w-72) │ BlockStoryReader │ StoryRightPanel│
 *   │  Chapters / Scenes   │   Center canvas  │  TTS + Meta    │
 *   └──────────────────────────────────────────────────────────┘
 *
 * Data is provided by StoryReaderProvider (from PaywallGate / layout).
 */
export function StoryReaderShell({ slug }: { slug: string }) {
  const { story, isLoading } = useStoryReader();

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
      <BlockStoryReader slug={slug} />

      {/* Right panel — Kokoro TTS narration + metadata */}
      <StoryRightPanel />
    </div>
  );
}
