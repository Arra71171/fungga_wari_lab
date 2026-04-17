"use client";

import * as React from "react";
import { BlockStoryReader } from "./BlockStoryReader";
import { StoryContent } from "./StoryContent";
import { Loader2 } from "lucide-react";
import { useStoryReader } from "./StoryReaderContext";
import { KeyboardNavigator } from "./KeyboardNavigator";
import { SceneSearchDialog } from "./SceneSearchDialog";

export function StoryReaderShell({ slug }: { slug: string }) {
  const { blocks, story, isLoading } = useStoryReader();

  if (isLoading || blocks === undefined || story === undefined) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-cinematic-bg gap-4">
        <Loader2 className="size-8 text-brand-ember animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Loading Story...
        </span>
      </div>
    );
  }

  // Check if we have any legacy published scenes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasLegacyScenes = (story?.chapters as any[])?.some((c: { scenes?: unknown[] }) => c.scenes && c.scenes.length > 0);

  // If we have blocks, OR if there are no legacy scenes at all (e.g. brand new story), we use the modern BlockStoryReader
  if (blocks.length > 0 || !hasLegacyScenes) {
    return (
      <>
        <KeyboardNavigator />
        <SceneSearchDialog />
        <BlockStoryReader slug={slug} />
      </>
    );
  }

  // Legacy fallback for stories that still use the scenes data model
  return (
    <>
      <KeyboardNavigator />
      <SceneSearchDialog />
      <StoryContent slug={slug} />
    </>
  );
}
