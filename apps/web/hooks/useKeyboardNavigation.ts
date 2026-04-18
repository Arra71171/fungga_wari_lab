import * as React from "react";
import { useStoryReader } from "@/components/story/StoryReaderContext";

export function useKeyboardNavigation() {
  const {
    story,
    chapters,
    currentSceneId,
    setCurrentSceneId,
    mode,
    setMode,
  } = useStoryReader();

  const getOrderedSceneIds = React.useCallback((): string[] => {
    if (!story || !chapters.length) return [];
    return chapters.flatMap((ch) => (ch.scenes ?? []).map((s) => s.id));
  }, [story, chapters]);

  const goToNextScene = React.useCallback(() => {
    const scenes = getOrderedSceneIds();
    if (!scenes.length) return;

    if (!currentSceneId) {
      setCurrentSceneId(scenes[0] ?? null);
      return;
    }

    const idx = scenes.indexOf(currentSceneId);
    if (idx >= 0 && idx < scenes.length - 1) {
      setCurrentSceneId(scenes[idx + 1] ?? null);
    }
  }, [getOrderedSceneIds, currentSceneId, setCurrentSceneId]);

  const goToPrevScene = React.useCallback(() => {
    const scenes = getOrderedSceneIds();
    if (!scenes.length || !currentSceneId) return;

    const idx = scenes.indexOf(currentSceneId);
    if (idx > 0) {
      setCurrentSceneId(scenes[idx - 1] ?? null);
    }
  }, [getOrderedSceneIds, currentSceneId, setCurrentSceneId]);

  const handleKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
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
          setMode(mode === "immersive" ? "standard" : "immersive");
          break;
      }
    },
    [mode, setMode, goToNextScene, goToPrevScene]
  );

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return { goToNextScene, goToPrevScene };
}
