"use client";

import * as React from "react";
import { StorySidebar } from "@/components/story/StorySidebar";
import { StoryCanvas } from "@/components/story/StoryCanvas";
import { StoryRightPanel } from "@/components/story/StoryRightPanel";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Loader2 } from "lucide-react";

type TiptapMark = { type: string; attrs?: Record<string, unknown> };
type TiptapNode = {
  type: string;
  text?: string;
  content?: TiptapNode[];
  attrs?: Record<string, unknown>;
  marks?: TiptapMark[];
};
type TiptapDoc = { type: "doc"; content?: TiptapNode[] };

type Scene = {
  _id: string;
  title: string;
  order: number;
  tiptapContent?: TiptapDoc;
  illustrationUrl?: string;
};

type Chapter = {
  _id: string;
  title: string;
  order: number;
  scenes: Scene[];
};

export default function StoryPlayerPage({ params }: { params: { slug: string } }) {
  const storyData = useQuery(api.stories.getFullBySlug, { slug: params.slug });
  const [activeSceneId, setActiveSceneId] = React.useState<string | null>(null);

  // Auto-select the first scene when story data loads
  React.useEffect(() => {
    if (!storyData || activeSceneId) return;
    const firstScene = storyData.chapters?.[0]?.scenes?.[0];
    if (firstScene) {
      setActiveSceneId(firstScene._id);
    }
  }, [storyData, activeSceneId]);

  // Derive the active scene from the full data
  const chapters = (storyData?.chapters ?? []) as Chapter[];
  const allScenes = chapters.flatMap((c) => c.scenes);
  const activeScene = allScenes.find((s) => s._id === activeSceneId) ?? null;

  if (storyData === undefined) {
    return (
      <div className="flex h-screen w-full bg-background text-foreground items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (storyData === null) {
    return (
      <div className="flex h-screen w-full bg-background text-foreground items-center justify-center flex-col gap-4">
        <p className="font-mono text-muted-foreground uppercase tracking-widest text-sm">
          Story not found.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-cinematic-bg text-cinematic-text antialiased overflow-hidden font-mono selection:bg-brand-ember/30">

      {/* Cinematic ambient light */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(60,30,10,0.1),transparent_70%)] pointer-events-none" />

      <StorySidebar
        chapters={chapters}
        activeSceneId={activeSceneId}
        onSceneSelect={setActiveSceneId}
      />

      <StoryCanvas scene={activeScene} />

      <StoryRightPanel choices={[]} />
    </div>
  );
}
