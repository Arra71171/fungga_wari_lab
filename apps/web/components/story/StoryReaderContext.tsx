"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useViewTracking } from "@/hooks/useViewTracking";

export type ReadingMode = "standard" | "focus" | "immersive";

// ─── Scene shape coming from Supabase ────────────────────────────────────────

type SceneRow = {
  id: string;
  title: string | null;
  order: number;
  content: string | null;
  tiptap_content: Record<string, unknown> | null;
  illustration_url: string | null;
  is_draft: boolean;
  version: number;
  reading_time: number | null;
  excerpt: string | null;
  choices: Array<{
    id: string;
    label: string;
    next_scene_id: string;
  }>;
};

type ChapterWithScenes = {
  id: string;
  title: string;
  order: number;
  illustration_url: string | null;
  tiptap_content: Record<string, unknown> | null;
  scenes: SceneRow[];
};

export type StoryShape = {
  id: string;
  /** Legacy alias — components that still use _id will work */
  _id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  language: string;
  status: string;
  cover_image_url: string | null;
  tags: string[] | null;
  moral: string | null;
  attributed_author: string | null;
  author_id: string;
  chapter_count: number | null;
  view_count: number | null;
  read_count: number | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  chapters: ChapterWithScenes[];
};

interface StoryReaderContextValue {
  story: StoryShape | null;
  chapters: ChapterWithScenes[];
  activeScene: SceneRow | null;
  isLoading: boolean;
  mode: ReadingMode;
  setMode: (mode: ReadingMode) => void;
  currentSceneId: string | null;
  setCurrentSceneId: (id: string | null) => void;
}

const StoryReaderContext = React.createContext<StoryReaderContextValue | undefined>(undefined);

export function StoryReaderProvider({ children, initialStory }: { children: React.ReactNode; initialStory?: StoryShape | null }) {
  const params = useParams();
  const slug = params.slug as string;

  const [story, setStory] = React.useState<StoryShape | null | undefined>(
    initialStory === null ? undefined : initialStory
  );
  const supabase = React.useMemo(() => createClient(), []);

  const initialStoryRef = React.useRef(initialStory);

  React.useEffect(() => {
    async function loadData() {
      if (!slug || initialStoryRef.current) return;

      const { data: storyData, error: storyError } = await supabase
        .from("stories")
        .select(`
          id, title, slug, description, category, language, status,
          cover_image_url, tags, moral, attributed_author, author_id,
          chapter_count, view_count, read_count, published_at,
          created_at, updated_at,
          chapters (
            id, title, "order", illustration_url, tiptap_content,
            scenes (
              id, title, "order", content, tiptap_content, illustration_url,
              is_draft, version, reading_time, excerpt
            )
          )
        `)
        .eq("slug", slug)
        .single();

      if (storyError || !storyData) {
        console.error("Error fetching story:", JSON.stringify(storyError, null, 2));
        setStory(null);
        return;
      }

      // Sort chapters and scenes by order
      // Cast via unknown to handle Supabase SelectQueryError on nested choices join
      const sortedChapters: ChapterWithScenes[] = ((storyData.chapters ?? []) as unknown as ChapterWithScenes[])
        .sort((a, b) => a.order - b.order)
        .map((ch) => ({
          ...ch,
          scenes: (ch.scenes ?? []).sort((a, b) => a.order - b.order),
        }));

      const mappedStory: StoryShape = {
        ...(storyData as Omit<StoryShape, "_id" | "chapters">),
        _id: storyData.id,
        chapters: sortedChapters,
      };

      setStory(mappedStory);
    }

    loadData();
  }, [slug, supabase]);

  // Fire view event once the story ID resolves
  useViewTracking(story?.id ?? undefined);

  const [mode, setMode] = React.useState<ReadingMode>("standard");
  const [currentSceneId, setCurrentSceneIdState] = React.useState<string | null>(
    initialStory?.chapters?.[0]?.scenes?.[0]?.id ?? null
  );

  // Set currentSceneId from localStorage only if it exists
  React.useEffect(() => {
    if (!story || story.chapters.length === 0) return;

    const storageKey = `fungga:scene:${story.id}`;
    const saved = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;

    if (saved) {
      // Verify the saved scene still exists
      const allScenes = story.chapters.flatMap((ch) => ch.scenes);
      if (allScenes.some((s) => s.id === saved)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentSceneIdState(saved);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);

  const setCurrentSceneId = React.useCallback(
    (id: string | null) => {
      setCurrentSceneIdState(id);
      if (story?.id && typeof window !== "undefined") {
        const storageKey = `fungga:scene:${story.id}`;
        if (id) {
          localStorage.setItem(storageKey, id);
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    },
    // story?.id keeps the callback stable when unrelated story fields change
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    [story?.id]
  );

  // Derive the active scene from chapters
  const activeScene = React.useMemo<SceneRow | null>(() => {
    if (!story || !currentSceneId) return null;
    for (const ch of story.chapters) {
      const found = ch.scenes.find((s) => s.id === currentSceneId);
      if (found) return found;
    }
    return null;
  }, [story, currentSceneId]);

  const isLoading = story === undefined;

  const value = React.useMemo<StoryReaderContextValue>(
    () => ({
      story: story ?? null,
      chapters: story?.chapters ?? [],
      activeScene,
      isLoading,
      mode,
      setMode,
      currentSceneId,
      setCurrentSceneId,
    }),
    [story, activeScene, isLoading, mode, currentSceneId, setCurrentSceneId]
  );

  return <StoryReaderContext.Provider value={value}>{children}</StoryReaderContext.Provider>;
}

export function useStoryReader() {
  const context = React.useContext(StoryReaderContext);
  if (context === undefined) {
    throw new Error("useStoryReader must be used within a StoryReaderProvider");
  }
  return context;
}
