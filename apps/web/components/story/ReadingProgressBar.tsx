"use client";

import * as React from "react";
import { useStoryReader } from "./StoryReaderContext";
import { cn } from "@workspace/ui/lib/utils";

export function ReadingProgressBar() {
  const { story, currentSceneId } = useStoryReader();

  // Calculate progress
  const progress = React.useMemo(() => {
    if (!story?.chapters || !currentSceneId) return 0;
    
    let totalScenes = 0;
    let currentIdx = -1;

    story.chapters.forEach((chap: any) => {
      if (chap.scenes && Array.isArray(chap.scenes)) {
        chap.scenes.forEach((sceneId: string) => {
          if (sceneId === currentSceneId) {
            currentIdx = totalScenes;
          }
          totalScenes++;
        });
      }
    });

    if (totalScenes === 0 || currentIdx === -1) return 0;
    return Math.max(0, Math.min(100, (currentIdx / (totalScenes - 1)) * 100));
  }, [story, currentSceneId]);

  return (
    <div className="w-full h-1 bg-cinematic-panel fixed top-0 left-0 right-0 z-50">
      <div 
        className="h-full bg-brand-ember transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
