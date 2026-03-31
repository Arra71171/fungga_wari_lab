"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { StorySidebar } from "./StorySidebar";
import { StoryRightPanel } from "./StoryRightPanel";
import { StorySceneRenderer } from "./StorySceneRenderer";
import { Id, Doc } from "../../../../convex/_generated/dataModel";

interface StoryPlayerShellProps {
  storySlug: string;
}

/**
 * Read the saved progress scene ID from localStorage (SSR-safe).
 * Called once as the lazy initializer for useState.
 */
function readSavedScene(slug: string): Id<"scenes"> | null {
  if (typeof window === "undefined") return null;
  const cached = localStorage.getItem(`fungga_progress_${slug}`);
  return cached ? (cached as Id<"scenes">) : null;
}

export function StoryPlayerShell({ storySlug }: StoryPlayerShellProps) {
  const story = useQuery(api.stories.getFullBySlug, { slug: storySlug });
  const storyId = story?._id;

  const chapters = useQuery(
    api.chapters.getByStoryId,
    storyId ? { storyId: storyId as Id<"stories"> } : "skip"
  );
  const firstScene = useQuery(
    api.scenes.getFirstSceneByStoryId,
    storyId ? { storyId: storyId as Id<"stories"> } : "skip"
  );

  // Lazy init from localStorage — no useEffect required.
  // Falls back to firstScene once it loads (computed in render, never in effects).
  const [manualSceneId, setManualSceneId] = useState<Id<"scenes"> | null>(
    () => readSavedScene(storySlug)
  );

  // Resolve: manual selection wins; else fallback to first scene from server
  const activeSceneId: Id<"scenes"> | null =
    manualSceneId ?? (firstScene ? (firstScene._id as Id<"scenes">) : null);

  // Persist on first auto-select (once firstScene arrives and nothing was saved)
  if (firstScene && !manualSceneId) {
    const key = `fungga_progress_${storySlug}`;
    if (typeof window !== "undefined" && !localStorage.getItem(key)) {
      localStorage.setItem(key, firstScene._id);
    }
  }

  const sceneQuery = useQuery(
    api.scenes.getSceneDetails,
    activeSceneId ? { sceneId: activeSceneId } : "skip"
  );

  const handleChoice = (nextSceneId: string) => {
    const id = nextSceneId as Id<"scenes">;
    setManualSceneId(id);
    localStorage.setItem(`fungga_progress_${storySlug}`, nextSceneId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (story === undefined) {
    return (
      <div className="h-svh w-full flex items-center justify-center bg-background">
        <div className="animate-pulse h-8 w-32 bg-muted/50 rounded" />
      </div>
    );
  }

  if (story === null) {
    return (
      <div className="h-svh w-full flex items-center justify-center bg-background text-foreground font-mono text-sm">
        Story not found.
      </div>
    );
  }

  const sidebarChapters =
    chapters?.map((c: Doc<"chapters">) => ({
      _id: c._id,
      title: c.title,
      order: c.order,
      scenes: [] as { _id: string; title: string; order: number }[],
    })) ?? [];

  return (
    <div className="flex h-svh w-full bg-background text-foreground overflow-hidden">
      <div className="hidden lg:block h-full">
        <StorySidebar
          chapters={sidebarChapters}
          activeSceneId={activeSceneId}
          onSceneSelect={(id) => handleChoice(id)}
        />
      </div>

      <main className="flex-1 h-full overflow-y-auto px-4 md:px-8 relative scroll-smooth">
        <StorySceneRenderer scene={sceneQuery?.scene ?? null} />
      </main>

      <div className="hidden md:block h-full">
        <StoryRightPanel
          choices={sceneQuery?.choices ?? []}
          onSelectChoice={handleChoice}
          metadata={{
            author: "Fungga Wari Lab",
            language: String((story as Doc<"stories">)?.language ?? "Unknown").toUpperCase(),
            category: String((story as Doc<"stories">)?.category ?? "Unknown").toUpperCase(),
          }}
        />
      </div>
    </div>
  );
}
