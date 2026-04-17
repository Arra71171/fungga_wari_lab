"use client";

import * as React from "react";
import { BlockStoryReader } from "./BlockStoryReader";

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

  return (
    <>
      <KeyboardNavigator />
      <SceneSearchDialog />
      <BlockStoryReader slug={slug} />
    </>
  );
}
