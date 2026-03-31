
"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { StorySidebar } from "./StorySidebar";
import { StoryRightPanel } from "./StoryRightPanel";
import { StorySceneRenderer } from "./StorySceneRenderer";
import { Id, Doc } from "../../../../convex/_generated/dataModel";

interface StoryPlayerShellProps {
  storySlug: string;
}

export function StoryPlayerShell({ storySlug }: StoryPlayerShellProps) {
  const story = useQuery(api.stories.getFullBySlug, { slug: storySlug });
  
  // Need storyId to proceed
  const storyId = story?._id;

  const chapters = useQuery(api.chapters.getByStoryId, storyId ? { storyId: storyId as Id<"stories"> } : "skip");
  const firstScene = useQuery(api.scenes.getFirstSceneByStoryId, storyId ? { storyId: storyId as Id<"stories"> } : "skip");

  const [activeSceneId, setActiveSceneId] = useState<Id<"scenes"> | null>(null);

  // Sync with localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && storySlug) {
      const cached = localStorage.getItem(`fungga_progress_${storySlug}`);
      if (cached && !activeSceneId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveSceneId(cached as Id<"scenes">);
      }
    }
  }, [storySlug, activeSceneId]);

  // If activeSceneId is null but firstScene is loaded, set it
  useEffect(() => {
    if (!activeSceneId && firstScene) {
      const cached = localStorage.getItem(`fungga_progress_${storySlug}`);
      if (!cached) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveSceneId(firstScene._id as Id<"scenes">);
        localStorage.setItem(`fungga_progress_${storySlug}`, firstScene._id);
      }
    }
  }, [firstScene, activeSceneId, storySlug]);

  const sceneQuery = useQuery(api.scenes.getSceneDetails, activeSceneId ? { sceneId: activeSceneId } : "skip");
  
  const handleChoice = (nextSceneId: string) => {
    setActiveSceneId(nextSceneId as Id<"scenes">);
    localStorage.setItem(`fungga_progress_${storySlug}`, nextSceneId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  if (story === undefined) {
    return <div className="h-svh w-full flex items-center justify-center bg-background"><div className="animate-pulse h-8 w-32 bg-muted/50 rounded" /></div>;
  }
  
  if (story === null) {
    return <div className="h-svh w-full flex items-center justify-center bg-background text-foreground">Story not found.</div>;
  }

  // Formatting sidebar chapters
  const sidebarChapters = chapters?.map((c: Doc<"chapters">) => ({
    _id: c._id,
    title: c.title,
    order: c.order,
    scenes: [] as { _id: string; title: string; order: number }[],
  })) || [];

  return (
    <div className="flex h-svh w-full bg-background text-foreground overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="hidden lg:block h-full">
        <StorySidebar
          chapters={sidebarChapters}
          activeSceneId={activeSceneId}
          onSceneSelect={(id) => handleChoice(id)}
        />
      </div>

      {/* CENTER CANVAS */}
      <main className="flex-1 h-full overflow-y-auto px-4 md:px-8 relative scroll-smooth">
        <StorySceneRenderer scene={sceneQuery?.scene || null} />
      </main>

      {/* RIGHT SIDEBAR */}
      <div className="hidden md:block h-full">
        <StoryRightPanel 
          choices={sceneQuery?.choices || []} 
          onSelectChoice={handleChoice} 
          metadata={{
            author: "Loading...", // In a real app we'd fetch teamMembers
            language: String((story as Doc<"stories">)?.language || "Unknown").toUpperCase(),
            category: String((story as Doc<"stories">)?.category || "Unknown").toUpperCase()
          }}
        />
      </div>
    </div>
  );
}
