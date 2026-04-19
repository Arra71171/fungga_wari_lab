"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { useStoryReader } from "./StoryReaderContext";
import { BlockStoryReader } from "./BlockStoryReader";
import { StorySidebar } from "./StorySidebar";
import { StoryRightPanel } from "./StoryRightPanel";
import { KeyboardNavigator } from "./KeyboardNavigator";
import { SceneSearchDialog } from "./SceneSearchDialog";
import { MobileReaderBar } from "./MobileReaderBar";

/**
 * StoryReaderShell — Responsive cinematic reader shell.
 *
 * Desktop (lg+):
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ StorySidebar (w-72) │ BlockStoryReader (flex-1) │ RightPanel │
 *   │ Chapters / Scenes   │ Center canvas             │ (w-80)     │
 *   └──────────────────────────────────────────────────────────────┘
 *
 *   The RightPanel header contains its own toggle button — no overlap
 *   with the center canvas sticky nav (Archive / Restart) ever.
 *
 * Mobile (<lg):
 *   ┌──────────────────────┐
 *   │   BlockStoryReader   │
 *   │   (full viewport)    │
 *   ├──────────────────────┤
 *   │   MobileReaderBar    │  ← fixed bottom bar
 *   └──────────────────────┘
 *   + Sheet drawers for chapters (left) and reader panel (bottom)
 */
export function StoryReaderShell({ slug }: { slug: string }) {
  const { story, isLoading } = useStoryReader();
  const [rightPanelOpen, setRightPanelOpen] = React.useState(true);

  // Mobile drawer states
  const [chaptersOpen, setChaptersOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

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
      /*
       * Theme-responsive cinematic reader. In dark mode: deep black.
       * In light mode: warm parchment (see globals.css :root cinematic tokens).
       * The global AnimatedThemeToggler controls this via next-themes.
       */
      className="flex h-screen w-full bg-cinematic-bg text-cinematic-text antialiased overflow-hidden"
      data-slot="story-reader-shell"
    >
      {/* Global keyboard shortcuts + scene search dialog */}
      <KeyboardNavigator />
      <SceneSearchDialog />

      {/* Ambient cinematic glow — top center (desktop only for perf) */}
      <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-ember/5 blur-[120px] pointer-events-none z-0" />

      {/* ─── Desktop: Left sidebar (hidden on mobile) ──────────────────── */}
      <div className="hidden lg:flex">
        <StorySidebar />
      </div>

      {/* ─── Mobile: Chapters drawer (Sheet left) ──────────────────────── */}
      <Sheet open={chaptersOpen} onOpenChange={setChaptersOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[85vw] max-w-80 p-0 bg-cinematic-panel border-cinematic-border"
        >
          <SheetTitle className="sr-only">Chapter Navigation</SheetTitle>
          <StorySidebar onSceneSelect={() => setChaptersOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* ─── Mobile: Reader panel drawer (Sheet bottom) ────────────────── */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent
          side="bottom"
          showCloseButton
          className="max-h-[70vh] p-0 bg-cinematic-panel border-cinematic-border rounded-t-xl"
        >
          <SheetTitle className="sr-only">Reader Settings</SheetTitle>
          <div className="overflow-y-auto max-h-[65vh]">
            <StoryRightPanel variant="mobile" />
          </div>
        </SheetContent>
      </Sheet>

      {/* ─── Center canvas ─────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <BlockStoryReader slug={slug} />
      </div>

      {/* ─── Desktop: Right panel with built-in toggle ─────────────────── */}
      {/*
       * The toggle lives INSIDE the right panel header, not floating over
       * the center canvas. This eliminates any overlap with the sticky nav.
       * When closed, a minimal collapsed strip shows the re-open button.
       */}
      <div
        className={`hidden lg:flex flex-col transition-all duration-300 ease-in-out shrink-0 ${
          rightPanelOpen ? "w-80" : "w-10"
        } overflow-hidden border-l border-cinematic-border bg-cinematic-panel/90 backdrop-blur-md`}
        aria-label="Reader panel"
      >
        {rightPanelOpen ? (
          <StoryRightPanel onClose={() => setRightPanelOpen(false)} />
        ) : (
          /* Collapsed strip — single icon to re-open */
          <div className="flex-1 flex flex-col items-center pt-5">
            <button
              onClick={() => setRightPanelOpen(true)}
              aria-label="Open details panel"
              className="size-8 flex items-center justify-center border border-cinematic-border/40 text-muted-foreground hover:text-cinematic-text hover:border-brand-ember/40 transition-all"
            >
              {/* Rotated chevron pointing left to indicate "expand right" */}
              <svg
                className="size-3.5 rotate-180"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ─── Mobile: Bottom reader bar ─────────────────────────────────── */}
      <MobileReaderBar
        onOpenChapters={() => setChaptersOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />
    </div>
  );
}
