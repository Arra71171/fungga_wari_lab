"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useViewTracking } from "@/hooks/useViewTracking";

export type ReadingMode = "standard" | "focus" | "immersive";

interface StoryReaderContextValue {
  story: any;
  blocks: any[] | undefined;
  isLoading: boolean;
  mode: ReadingMode;
  setMode: (mode: ReadingMode) => void;
  // Progress state
  currentSceneId: string | null;
  setCurrentSceneId: (id: string | null) => void;
}

const StoryReaderContext = React.createContext<StoryReaderContextValue | undefined>(undefined);

export function StoryReaderProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const slug = params.slug as string;

  const [story, setStory] = React.useState<any>(undefined);
  const [blocks, setBlocks] = React.useState<any[] | undefined>(undefined);
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    async function loadData() {
      if (!slug) return;
      
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .select(`
          *,
          chapters (
            id,
            title,
            order,
            scenes (
              id,
              title,
              order
            )
          )
        `)
        .eq('slug', slug)
        .single();
        
      if (storyError) {
        console.error("Error fetching story:", storyError);
        setStory(null);
        setBlocks([]);
        return;
      }
      
      // Need mapped _id for view tracking and other components
      // We also map the chapters and scenes to ensure _id is present for legacy UI components
      const mappedStory = { 
        ...storyData, 
        _id: storyData.id,
        chapters: ((storyData.chapters as any[]) || [])
          .sort((a, b) => a.order - b.order)
          .map(c => ({
            ...c,
            _id: c.id,
            scenes: ((c.scenes as any[]) || [])
              .sort((a, b) => a.order - b.order)
              .map(s => ({
                ...s,
                _id: s.id
              }))
          }))
      };
      setStory(mappedStory);

      const { data: blocksData, error: blocksError } = await supabase
        .from('blocks')
        .select('*')
        .eq('story_id', storyData.id)
        .order('order', { ascending: true });

      if (blocksError) {
        console.error("Error fetching blocks:", blocksError);
        setBlocks([]);
        return;
      }

      // Map scene_id to sceneId for existing UI logic
      const mappedBlocks = blocksData.map(b => ({
        ...b,
        sceneId: b.scene_id,
        chapterId: b.chapter_id,
        storyId: b.story_id
      }));
      setBlocks(mappedBlocks);
    }
    loadData();
  }, [slug, supabase]);

  // Fire view event once the story ID resolves
  useViewTracking(story?._id);

  const [mode, setMode] = React.useState<ReadingMode>("standard");
  const [currentSceneId, setCurrentSceneIdState] = React.useState<string | null>(null);

  // Load from local storage or default to first scene
  React.useEffect(() => {
    if (story?._id && blocks && blocks.length > 0) {
      const storageKey = `fungga:scene:${story._id}`;
      const savedSceneId = localStorage.getItem(storageKey);
      
      if (savedSceneId) {
        // Verify the saved scene still exists in blocks
        if (blocks.some(b => b.sceneId === savedSceneId)) {
          setCurrentSceneIdState(savedSceneId);
          return;
        }
      }
      
      // Fallback to first scene
      if (!currentSceneId) {
        const firstSceneBlock = blocks.find(b => b.sceneId);
        if (firstSceneBlock?.sceneId) {
          setCurrentSceneIdState(firstSceneBlock.sceneId);
        }
      }
    }
  }, [story?._id, blocks, currentSceneId]);

  const setCurrentSceneId = React.useCallback((id: string | null) => {
    setCurrentSceneIdState(id);
    if (story?._id) {
      const storageKey = `fungga:scene:${story._id}`;
      if (id) {
        localStorage.setItem(storageKey, id);
      } else {
        localStorage.removeItem(storageKey);
      }
    }
  }, [story]);

  const isLoading = story === undefined || blocks === undefined;

  const value = React.useMemo(
    () => ({
      story,
      blocks,
      isLoading,
      mode,
      setMode,
      currentSceneId,
      setCurrentSceneId,
    }),
    [story, blocks, isLoading, mode, currentSceneId, setCurrentSceneId]
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
