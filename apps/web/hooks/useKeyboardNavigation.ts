import * as React from "react";
import { useStoryReader } from "@/components/story/StoryReaderContext";

export function useKeyboardNavigation() {
  const {
    story,
    blocks,
    currentSceneId,
    setCurrentSceneId,
    mode,
    setMode,
  } = useStoryReader();

  const getOrderedScenes = React.useCallback(() => {
    if (!story?.chapters || !blocks) return [];
    
    // Create a sequential list of all scene IDs in the story, based on chapter order
    const orderedSceneIds: string[] = [];
    story.chapters.forEach((chap: { scenes?: Array<{ _id?: string } | string> }) => {
      if (chap.scenes && Array.isArray(chap.scenes)) {
        chap.scenes.forEach((scene) => {
          if (scene && typeof scene === 'object' && '_id' in scene && scene._id) {
            orderedSceneIds.push(scene._id);
          } else if (typeof scene === 'string') {
            orderedSceneIds.push(scene); // Fallback in case it's unpopulated
          }
        });
      }
    });
    return orderedSceneIds;
  }, [story, blocks]);

  const goToNextScene = React.useCallback(() => {
    const scenes = getOrderedScenes();
    if (scenes.length === 0) return;

    if (!currentSceneId) {
      setCurrentSceneId(scenes[0] ?? null);
      return;
    }

    const currentIndex = scenes.indexOf(currentSceneId);
    if (currentIndex >= 0 && currentIndex < scenes.length - 1) {
      setCurrentSceneId(scenes[currentIndex + 1] ?? null);
    }
  }, [getOrderedScenes, currentSceneId, setCurrentSceneId]);

  const goToPrevScene = React.useCallback(() => {
    const scenes = getOrderedScenes();
    if (scenes.length === 0) return;

    if (!currentSceneId) {
      return; // already at beginning
    }

    const currentIndex = scenes.indexOf(currentSceneId);
    if (currentIndex > 0) {
      setCurrentSceneId(scenes[currentIndex - 1] ?? null);
    }
  }, [getOrderedScenes, currentSceneId, setCurrentSceneId]);

  const handleKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          goToNextScene();
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          goToPrevScene();
          break;
        case "f":
        case "F":
          e.preventDefault();
          // Toggle immersive mode
          setMode(mode === "immersive" ? "standard" : "immersive");
          break;
      }
    },
    [mode, setMode, goToNextScene, goToPrevScene]
  );



  React.useEffect(() => {
    // Attach listener to window
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return { goToNextScene, goToPrevScene };
}
