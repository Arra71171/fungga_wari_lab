"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import Link from "next/link";
import { StoryRenderer } from "@workspace/ui/components/story-renderer";
import { useStoryReader } from "./StoryReaderContext";
import type { BlockData } from "@workspace/ui/components/story-blocks";
import { ArrowLeft, Loader2, Flame } from "lucide-react";
import { BrandLogo } from "@workspace/ui/components/BrandLogo";
import { BookmarkToggle } from "./BookmarkToggle";
import { StoryMapSidebar } from "./StoryMapSidebar";

type BlockStoryReaderProps = {
  slug: string;
};

/**
 * Block-based story reader for the public web app.
 * Fetches blocks by story slug and renders them using
 * the shared StoryRenderer in cinematic viewer mode.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function BlockStoryReader({ slug: _slug }: BlockStoryReaderProps) {
  const { blocks, story, currentSceneId, setCurrentSceneId } = useStoryReader();

  React.useEffect(() => {
    const handleChoice = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.sceneId) {
        setCurrentSceneId(customEvent.detail.sceneId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('story:choice', handleChoice);
    return () => window.removeEventListener('story:choice', handleChoice);
  }, [setCurrentSceneId]);

  const firstSceneId = React.useMemo(() => {
    return blocks?.find(b => b.sceneId)?.sceneId;
  }, [blocks]);

  // Detect dead-ends: current scene has no choice blocks leftover
  const isDeadEnd = React.useMemo(() => {
    if (!currentSceneId || !blocks) return false;
    const sceneBlocks = blocks.filter(b => b.sceneId === currentSceneId);
    // A dead-end is a scene with content but zero choice-type blocks
    return sceneBlocks.length > 0 && !sceneBlocks.some(b => b.type === "choice");
  }, [currentSceneId, blocks]);

  if (blocks === undefined || !story) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="size-8 text-brand-ember animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Loading story…
        </span>
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <BrandLogo variant="icon" size="lg" className="text-muted-foreground/20" />
        <div className="space-y-2">
          <p className="font-heading text-xl text-muted-foreground">
            No content yet
          </p>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60">
            This story is being crafted
          </p>
        </div>
      </div>
    );
  }

  // Cast Convex documents to BlockData shape
  let blockData: BlockData[] = blocks.map((b) => ({
    _id: b._id,
    type: b.type as BlockData["type"],
    order: b.order,
    props: b.props as Record<string, unknown>,
    storyId: b.storyId,
    chapterId: b.chapterId ?? undefined,
    sceneId: b.sceneId ?? undefined,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  }));

  // If a scene is active, strictly filter blocks to that scene. 
  // Non-scene blocks (like global headers) can optionally be kept if needed in the future.
  if (currentSceneId) {
    blockData = blockData.filter(b => b.sceneId === currentSceneId);
  }

  return (
    <article className="w-full min-h-screen bg-cinematic-bg">
      {/* Back to Archive nav */}
      <nav className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-cinematic-bg/80 backdrop-blur-md border-b border-border/10">
        <Link
          href="/stories"
          className="flex items-center gap-2 text-muted-foreground hover:text-brand-ember transition-colors group"
          aria-label="Back to manuscripts archive"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-mono uppercase tracking-widest">
            Archive
          </span>
        </Link>
        <BrandLogo variant="icon" size="sm" className="text-muted-foreground/40 absolute left-1/2 -translate-x-1/2" />
        <div className="flex items-center gap-4 z-50">
          <StoryMapSidebar />
          {currentSceneId && firstSceneId && currentSceneId !== firstSceneId && (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to restart this story? Your progress will be reset.")) {
                  setCurrentSceneId(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-brand-ember transition-colors"
            >
              Restart
            </button>
          )}
          <BookmarkToggle storyId={story._id as any} />
        </div>
      </nav>

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-ember/5 blur-[100px] pointer-events-none" />

      <StoryRenderer
        blocks={blockData}
        mode="viewer"
        className="py-16 md:py-24 text-cinematic-text"
      />

      {/* Story end / dead-end screen */}
      {isDeadEnd && (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-8">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-brand-ember/20 rounded-full scale-150" />
            <Flame className="relative size-12 text-brand-ember" aria-hidden />
          </div>
          <div className="space-y-3">
            <p className="font-heading text-2xl font-black uppercase tracking-widest text-foreground">
              End of Path
            </p>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground max-w-xs">
              This thread of the tale has reached its conclusion
            </p>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setCurrentSceneId(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-brand-ember border border-border hover:border-brand-ember px-4 py-2 transition-colors"
            >
              Begin Anew
            </button>
            <Link
              href="/stories"
              className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-brand-ember transition-colors"
            >
              Return to Archive
            </Link>
          </div>
        </div>
      )}
    </article>
  );
}

export { BlockStoryReader };
