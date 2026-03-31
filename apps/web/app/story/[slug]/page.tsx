"use client";

import * as React from "react";
import { StorySidebar } from "@/components/story/StorySidebar";
import { StoryCanvas } from "@/components/story/StoryCanvas";
import { StoryRightPanel } from "@/components/story/StoryRightPanel";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Loader2 } from "lucide-react";

export default function StoryPlayerPage({ params }: { params: { slug: string } }) {
  const storyData = useQuery(api.stories?.getFullBySlug, { slug: params.slug });

  if (storyData === undefined) {
    return (
      <div className="flex h-screen w-full bg-cinematic-bg text-cinematic-text items-center justify-center">
        <Loader2 className="size-8 animate-spin text-cinematic-accent" />
      </div>
    );
  }

  // If no story found, we could show a 404, but for the mockup we'll just pass null
  // down to the components so they can handle it or show the beautiful skeleton state.

  return (
    <div className="flex h-screen w-full bg-cinematic-bg text-cinematic-text antialiased overflow-hidden font-mono selection:bg-brand-ember/30">
      
      {/* Cinematic subtle ambient light (like the screenshot background) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(60,30,10,0.1),transparent_70%)] pointer-events-none" />

      <StorySidebar chapters={storyData?.chapters ?? undefined} />
      <StoryCanvas story={(storyData as Record<string, unknown>) ?? undefined} />
      <StoryRightPanel choices={[]} />
      
    </div>
  );
}
