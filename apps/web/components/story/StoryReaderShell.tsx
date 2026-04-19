"use client";

import * as React from "react";
import { Loader2, PanelRightOpen, PanelRightClose } from "lucide-react";
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
 *   ┌──────────────────────────────────────────────────────┐
 *   │ StorySidebar (w-72) │ BlockStoryReader   │ [toggle →] │
 *   │ Chapters / Scenes   │ Center canvas      │ RightPanel │
 *   └──────────────────────────────────────────────────────┘
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
      <div className="relative flex-1 min-w-0">
        <BlockStoryReader slug={slug} />

        {/* Right panel toggle — desktop only */}
        <button
          onClick={() => setRightPanelOpen((v) => !v)}
          aria-label={rightPanelOpen ? "Close details panel" : "Open details panel"}
          className="hidden lg:flex absolute top-5 right-5 z-20 items-center gap-1.5 px-3 py-1.5 border border-cinematic-border bg-cinematic-panel/80 backdrop-blur-sm text-muted-foreground hover:text-cinematic-text hover:border-brand-ember/40 transition-all text-[10px] font-mono uppercase tracking-widest"
        >
          {rightPanelOpen ? (
            <PanelRightClose className="size-3.5" />
          ) : (
            <PanelRightOpen className="size-3.5" />
          )}
          {rightPanelOpen ? "Close" : "Details"}
        </button>
      </div>

      {/* ─── Desktop: Right panel (hidden on mobile) ───────────────────── */}
      <div
        className={`hidden lg:block transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${
          rightPanelOpen ? "w-80 opacity-100" : "w-0 opacity-0"
        }`}
        aria-hidden={!rightPanelOpen}
      >
        {rightPanelOpen && <StoryRightPanel />}
      </div>

      {/* ─── Mobile: Bottom reader bar ─────────────────────────────────── */}
      <MobileReaderBar
        onOpenChapters={() => setChaptersOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />
    </div>
  );
}
