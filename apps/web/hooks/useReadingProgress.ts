"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "fungga-wari-reading-progress";

type ReadingProgressMap = Record<string, {
  slug: string;
  progress: number;       // 0–100
  lastReadAt: number;     // timestamp
  chapterIndex?: number;
  blockIndex?: number;
}>;

function getProgressMap(): ReadingProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReadingProgressMap) : {};
  } catch {
    return {};
  }
}

function saveProgressMap(map: ReadingProgressMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // localStorage may be unavailable (private browsing, quota)
  }
}

/**
 * useReadingProgress — persists per-story reading progress in localStorage.
 *
 * Returns:
 *  - progress: current 0–100 value
 *  - updateProgress: setter to save new progress
 *  - allProgress: full map for "continue reading" features
 */
export function useReadingProgress(slug: string) {
  // Lazy initializer: reads localStorage once at mount — avoids setState-in-effect
  // for the initial render while remaining SSR-safe (getProgressMap returns {} on server)
  const [progress, setProgress] = useState(() => getProgressMap()[slug]?.progress ?? 0);

  // Re-sync from localStorage only when slug changes after initial mount
  const prevSlugRef = useRef(slug);
  useEffect(() => {
    if (prevSlugRef.current === slug) return;
    prevSlugRef.current = slug;
    const map = getProgressMap();

    setProgress(map[slug]?.progress ?? 0);
  }, [slug]);

  const updateProgress = useCallback(
    (newProgress: number, chapterIndex?: number, blockIndex?: number) => {
      const map = getProgressMap();
      map[slug] = {
        slug,
        progress: Math.min(100, Math.max(0, newProgress)),
        lastReadAt: Date.now(),
        chapterIndex,
        blockIndex,
      };
      saveProgressMap(map);
      setProgress(newProgress);
    },
    [slug],
  );

  const clearProgress = useCallback(() => {
    const map = getProgressMap();
    delete map[slug];
    saveProgressMap(map);
    setProgress(0);
  }, [slug]);

  return { progress, updateProgress, clearProgress };
}

/**
 * getAllReadingProgress — returns reading progress for all stories.
 * Useful for "Continue Reading" sections.
 */
export function getAllReadingProgress(): ReadingProgressMap {
  return getProgressMap();
}
