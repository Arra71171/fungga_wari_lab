"use client";

import * as React from "react";
import { Search, Maximize2, ChevronLeft, LayoutPanelLeft } from "lucide-react";
import { FungaMark } from "@workspace/ui/components/BrandLogo";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { useStoryReader } from "./StoryReaderContext";

export function StoryTopNav() {
  const { story, mode, setMode } = useStoryReader();

  const toggleFocus = () => {
    setMode(mode === "focus" ? "standard" : "focus");
  };

  return (
    <header className="h-16 w-full flex items-center justify-between px-6 bg-cinematic-panel border-b border-cinematic-border/50 sticky top-0 z-50">
      {/* Left section: Back and Explore */}
      <div className="flex items-center gap-4 flex-1">
        <Link href="/stories" className="text-cinematic-text-dim hover:text-brand-ember transition-colors flex items-center gap-1 group">
          <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-mono uppercase tracking-widest hidden sm:inline-block">Archive</span>
        </Link>
      </div>

      {/* Center: Story Title & Brand */}
      <div className="flex flex-col items-center justify-center flex-[2] truncate">
        {story && (
          <span className="font-heading font-medium tracking-wide text-base text-cinematic-text truncate max-w-full px-4">
            {story.title}
          </span>
        )}
        <Link href="/stories" className="flex items-center gap-1 group mt-0.5">
          <FungaMark size={12} className="text-brand-ember/60 group-hover:text-brand-ember transition-colors" />
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-cinematic-text-dim group-hover:text-brand-ember transition-colors">
            Fungga Wari
          </span>
        </Link>
      </div>

      {/* Right section: Reading Modes & Tools */}
      <div className="flex items-center justify-end gap-2 flex-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-cinematic-text-dim hover:text-cinematic-text hover:bg-cinematic-panel-hover rounded-none"
          title="Search in Story"
        >
          <Search className="size-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleFocus}
          className={`${mode === 'focus' ? 'text-brand-ember' : 'text-cinematic-text-dim'} hover:text-cinematic-text hover:bg-cinematic-panel-hover rounded-none`}
          title={mode === 'focus' ? "Standard Mode" : "Focus Mode"}
        >
          {mode === 'focus' ? <LayoutPanelLeft className="size-4" /> : <Maximize2 className="size-4" />}
        </Button>
      </div>
    </header>
  );
}
