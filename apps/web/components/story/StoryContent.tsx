"use client";

import * as React from "react";
import { useStoryReader } from "./StoryReaderContext";
import { StoryCenter } from "./StoryCenter";
import type { SceneChoice } from "./StoryCenter";
import { Loader2 } from "lucide-react";

export function StoryContent({ slug }: { slug: string }) {
  const { story, currentSceneId, setCurrentSceneId } = useStoryReader();

  React.useEffect(() => {
    // If no scene is selected but there is a story, select the first scene of the first chapter
    if (story && !currentSceneId) {
      const firstChapter = (story as any).chapters?.[0];
      const firstScene = firstChapter?.scenes?.[0];
      if (firstScene) {
        setCurrentSceneId(firstScene._id);
      }
    }
  }, [story, currentSceneId, setCurrentSceneId]);

  if (story === undefined) {
    return (
      <div className="w-full flex justify-center py-20 min-h-[100vh]">
        <Loader2 className="size-8 text-brand-ember animate-spin" />
      </div>
    );
  }

  if (story === null) {
    return (
      <div className="w-full flex justify-center py-20 min-h-[100vh] text-cinematic-text font-mono uppercase tracking-widest text-sm">
        Manuscript not found in the archive.
      </div>
    );
  }

  // Build a flat lookup of all scenes keyed by _id for fast choice resolution
  const chapters = (story as any).chapters || [];
  const allScenesById = new Map<string, any>();
  for (const chapter of chapters) {
    if (chapter.scenes) {
      for (const scene of chapter.scenes) {
        allScenesById.set(scene._id, { scene, chapter });
      }
    }
  }

  // Find the exact active scene
  let activeScene = null;

  const match = currentSceneId ? allScenesById.get(currentSceneId) : null;
  if (match) {
    const { scene, chapter } = match;
    // Map choices to the SceneChoice shape expected by StoryCenter
    const mappedChoices: SceneChoice[] = (scene.choices || []).map((c: any) => ({
      _id: c._id,
      label: c.label,
      nextSceneId: c.nextSceneId,
    }));

    activeScene = {
      ...scene,
      chapterTitle: chapter.title || `Chapter ${chapter.order}`,
      chapterOrder: chapter.order,
      choices: mappedChoices,
    };
  }

  // Fallback: if we still have no active scene, pick the first one
  if (!activeScene) {
    const sortedChapters = [...chapters].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    const firstChapter = sortedChapters[0];
    const firstScene = firstChapter?.scenes?.[0];
    if (firstScene) {
      const mappedChoices: SceneChoice[] = (firstScene.choices || []).map((c: any) => ({
        _id: c._id,
        label: c.label,
        nextSceneId: c.nextSceneId,
      }));

      activeScene = {
        ...firstScene,
        chapterTitle: firstChapter.title || `Chapter ${firstChapter.order}`,
        chapterOrder: firstChapter.order,
        choices: mappedChoices,
        _chapterId: firstChapter._id,
      };
    }
  } else if (match) {
    activeScene._chapterId = match.chapter._id;
  }

  // Calculate linear chronological progression (Next Chapter / Last Scene)
  let nextSceneId: string | undefined = undefined;
  let isLastScene = false;

  if (activeScene) {
    const sortedChapters = [...chapters].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    const currentChapterIndex = sortedChapters.findIndex(c => c._id === activeScene._chapterId);
    
    if (currentChapterIndex !== -1) {
      const currentChapter = sortedChapters[currentChapterIndex];
      const currentSceneIndex = currentChapter.scenes?.findIndex((s: any) => s._id === activeScene._id) ?? -1;

      // First, check if there is a next scene in the current chapter
      if (currentChapter.scenes && currentSceneIndex >= 0 && currentSceneIndex < currentChapter.scenes.length - 1) {
        nextSceneId = currentChapter.scenes[currentSceneIndex + 1]._id;
      } else {
        // Otherwise, find the next chapter with scenes
        for (let i = currentChapterIndex + 1; i < sortedChapters.length; i++) {
          if (sortedChapters[i].scenes && sortedChapters[i].scenes.length > 0) {
            nextSceneId = sortedChapters[i].scenes[0]._id;
            break;
          }
        }
      }
    }

    if (!nextSceneId) {
      isLastScene = true;
    }
  }

  // Handle branching transition
  const handleChoiceSelect = React.useCallback(
    (targetSceneId: string) => {
      setCurrentSceneId(targetSceneId);
      // Scroll to top for a fresh reading experience
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setCurrentSceneId]
  );

  return (
    <article className="w-full min-h-[100vh] relative">
      <StoryCenter
        scene={activeScene}
        storyTitle={story.title}
        onChoiceSelect={handleChoiceSelect}
        nextSceneId={nextSceneId}
        isLastScene={isLastScene}
      />
    </article>
  );
}

