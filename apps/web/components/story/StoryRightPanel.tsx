"use client";

import { ChevronDown, MessageSquare, Play, Volume2, Bookmark, CheckCircle, Flag } from "lucide-react";
import * as React from "react";
import { Button } from "@workspace/ui/components/button";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function StoryRightPanel({ choices, onSelectChoice, metadata }: { choices?: unknown[]; onSelectChoice?: (id: string) => void; metadata?: Record<string, string> }) {
  return (
    <aside className="w-[300px] h-full flex flex-col px-6 pt-6 pb-8 border-l border-cinematic-border/40 shrink-0 bg-cinematic-panel/90 backdrop-blur-md z-10 sticky top-0 mt-4 md:mt-0">
      
      {/* Story Progress Accordion */}
      <h3 className="font-heading font-medium text-cinematic-text mb-4 text-sm tracking-wide flex items-center justify-between">
        Story Sequence
        <ChevronDown className="size-4 text-cinematic-text-dim" />
      </h3>

      <div className="space-y-1 mb-8">
        <div className="border border-cinematic-accent bg-cinematic-panel-hover/80 rounded-none p-3">
          <div className="flex items-center justify-between text-cinematic-accent text-xs font-mono font-bold">
            <span className="flex items-center gap-2">
              <ChevronDown className="size-3" />
              The Mysterious Village
            </span>
          </div>
          
          <div className="pl-5 pt-3 space-y-2 text-cinematic-text-dim text-xs font-mono">
            <div className="flex items-center gap-2 hover:text-cinematic-text cursor-pointer">
              <span className="text-cinematic-text-dim/50">+</span> Meeting the Elder
            </div>
            <div className="flex items-center gap-2 hover:text-cinematic-text cursor-pointer">
              <span className="text-cinematic-text-dim/50">+</span> The Strange Stone
            </div>
          </div>
        </div>
      </div>

      {/* Team Workflow Actions */}
      <h3 className="font-heading font-medium text-cinematic-text-dim mb-4 text-sm tracking-wide">
        Team Workflow
      </h3>
      
      <div className="space-y-2 mb-8 flex flex-col">
        <Button variant="outline" className="w-full justify-start h-auto py-3 rounded-none border-cinematic-border-heavy bg-transparent text-cinematic-text hover:border-cinematic-accent/50 hover:bg-cinematic-panel-hover transition-colors flex items-center gap-3 group">
          <CheckCircle className="size-4 text-cinematic-text-dim group-hover:text-cinematic-accent" />
          Approve Translation
        </Button>
        <Button variant="outline" className="w-full justify-start h-auto py-3 rounded-none border-cinematic-border-heavy bg-transparent text-cinematic-text hover:border-cinematic-accent/50 hover:bg-cinematic-panel-hover transition-colors flex items-center gap-3 group">
          <Flag className="size-4 text-cinematic-text-dim group-hover:text-destructive" />
          Flag Historical Accuracy
        </Button>
      </div>

      {/* Audio Narration Widget */}
      <div className="flex items-center gap-2 text-cinematic-accent text-xs font-mono font-bold mb-3 uppercase tracking-wider">
        <Volume2 className="size-4" /> Audio Review
      </div>
      
      <div className="bg-transparent border border-cinematic-border-heavy p-2 rounded-none mb-8 relative group">
        <div className="w-full h-24 rounded-none bg-black/40 overflow-hidden relative mb-2">
          {/* Aesthetic waveform/audio background */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ember/20 to-transparent" />
          <div className="w-full h-full flex items-center justify-center opacity-30 px-2 space-x-1">
            {React.useMemo(() => [...Array(20)].map((_, i) => (
              <div key={i} className="flex-1 bg-cinematic-accent rounded-none" style={{ height: `${Math.max(10, (i * 17) % 80)}%` }} />
            )), [])}
          </div>
          {/* Play Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-8 rounded-none bg-cinematic-bg border border-cinematic-accent/30 flex items-center justify-center pl-1 cursor-pointer hover:border-cinematic-accent hover:bg-cinematic-accent/10 transition-all">
              <Play className="size-4 text-cinematic-accent" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-2 text-[10px] font-mono font-bold text-cinematic-text-dim">
          <span>0:12</span>
          <div className="flex-1 h-1 bg-cinematic-border rounded-none relative">
            <div className="absolute left-0 top-0 h-full w-1/4 bg-cinematic-accent rounded-none shadow-sm shadow-brand-glow/50">
               <div className="absolute right-0 top-1/2 -translate-y-1/2 size-2 bg-white rounded-none translate-x-1" />
            </div>
          </div>
          <span>3:35</span>
        </div>
      </div>

      {/* Utilities / Meta Actions */}
      <div className="space-y-2 mt-auto flex flex-col">
        <Button variant="ghost" className="w-full justify-between h-auto py-3 text-cinematic-text-dim hover:text-cinematic-text hover:bg-cinematic-panel-hover rounded-none transition-colors text-sm">
          <div className="flex items-center gap-3">
            <MessageSquare className="size-4" />
            Feedback
          </div>
          <ChevronRight className="size-4 opacity-50" />
        </Button>
        
        <Button variant="ghost" className="w-full justify-between h-auto py-3 text-cinematic-text-dim hover:text-cinematic-text hover:bg-cinematic-panel-hover rounded-none transition-colors text-sm">
          <div className="flex items-center gap-3">
            <Bookmark className="size-4" />
            Save for Review
          </div>
          <ChevronRight className="size-4 opacity-50" />
        </Button>

        {/* Team Chat replaces Ask AI */}
        <Button variant="outline" className="w-full justify-between h-auto py-3 text-cinematic-accent hover:text-cinematic-accent hover:bg-cinematic-accent/10 border border-cinematic-accent/20 bg-cinematic-accent/5 rounded-none transition-colors text-sm font-medium shadow-sm shadow-brand-glow/10">
          <div className="flex items-center gap-3">
            <MessageSquare className="size-4" />
            Team Discussion
          </div>
          <ChevronRight className="size-4 opacity-50" />
        </Button>
      </div>

    </aside>
  );
}

// Just to fix ChevronRight inside this component without another import line
function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
