"use client";

import * as React from "react";
import { BookOpen, List, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useStoryReader } from "./StoryReaderContext";

type MobileReaderBarProps = {
  onOpenChapters: () => void;
  onOpenSettings: () => void;
};

/**
 * MobileReaderBar — Fixed bottom navigation bar for mobile readers.
 *
 * Sits in the thumb-zone at the bottom of the screen.
 * Shows progress, chapter navigation, and drawer triggers.
 * Only renders on mobile (<lg breakpoint, controlled by parent).
 */
export function MobileReaderBar({ onOpenChapters, onOpenSettings }: MobileReaderBarProps) {
  const { story, chapters, currentSceneId, setCurrentSceneId } = useStoryReader();

  // Compute scene navigation
  const allScenes = React.useMemo(
    () => chapters.flatMap((c) => c.scenes ?? []),
    [chapters]
  );
  const currentIndex = allScenes.findIndex((s) => s.id === currentSceneId);
  const totalScenes = allScenes.length;

  // Progress as percentage
  const progressPercent =
    totalScenes > 0
      ? Math.round(((Math.max(0, currentIndex) + (currentSceneId ? 1 : 0)) / totalScenes) * 100)
      : 0;

  // Find active chapter info
  const activeChapterIndex = React.useMemo(() => {
    if (!currentSceneId) return 0;
    for (let i = 0; i < chapters.length; i++) {
      if (chapters[i]?.scenes.some((s) => s.id === currentSceneId)) return i;
    }
    return 0;
  }, [chapters, currentSceneId]);

  function goToPrevScene() {
    if (currentIndex > 0) {
      const prevScene = allScenes[currentIndex - 1];
      if (prevScene) setCurrentSceneId(prevScene.id);
    }
  }

  function goToNextScene() {
    if (currentIndex < totalScenes - 1) {
      const nextScene = allScenes[currentIndex + 1];
      if (nextScene) setCurrentSceneId(nextScene.id);
    }
  }

  if (!story) return null;

  return (
    <div
      data-slot="mobile-reader-bar"
      className="fixed bottom-0 inset-x-0 z-50 lg:hidden"
    >
      {/* Progress bar — thin gradient line at top of the bar */}
      <div className="w-full h-0.5 bg-cinematic-border/20">
        <div
          className="h-full bg-gradient-to-r from-brand-ember to-brand-glow transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Bar content */}
      <div className="flex items-center justify-between px-4 py-3 bg-cinematic-panel/95 backdrop-blur-lg border-t border-cinematic-border/30">
        {/* Left: Chapters drawer trigger */}
        <button
          onClick={onOpenChapters}
          aria-label="Open chapters navigation"
          className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-cinematic-text transition-colors"
        >
          <List className="size-5" />
          <span className="font-mono text-[9px] uppercase tracking-widest">
            Ch. {String(activeChapterIndex + 1).padStart(2, "0")}
          </span>
        </button>

        {/* Center: Scene prev/next navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={goToPrevScene}
            disabled={currentIndex <= 0}
            aria-label="Previous scene"
            className={cn(
              "size-10 flex items-center justify-center border transition-colors",
              currentIndex > 0
                ? "border-cinematic-border/40 text-cinematic-text hover:border-brand-ember hover:text-brand-ember"
                : "border-transparent text-muted-foreground/30 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="size-5" />
          </button>

          {/* Scene counter */}
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground min-w-16 text-center">
            {currentSceneId ? currentIndex + 1 : 0} / {totalScenes}
          </span>

          <button
            onClick={goToNextScene}
            disabled={currentIndex >= totalScenes - 1}
            aria-label="Next scene"
            className={cn(
              "size-10 flex items-center justify-center border transition-colors",
              currentIndex < totalScenes - 1
                ? "border-cinematic-border/40 text-cinematic-text hover:border-brand-ember hover:text-brand-ember"
                : "border-transparent text-muted-foreground/30 cursor-not-allowed"
            )}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        {/* Right: Settings / Reader panel trigger */}
        <button
          onClick={onOpenSettings}
          aria-label="Open reader panel"
          className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-cinematic-text transition-colors"
        >
          <BookOpen className="size-5" />
        </button>
      </div>
    </div>
  );
}
