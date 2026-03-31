"use client";

import { ChevronDown, ChevronRight, Search, Settings } from "lucide-react";
import * as React from "react";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function StorySidebar({ chapters, activeChapterId, progressPercent }: { chapters?: unknown[]; activeChapterId?: string; progressPercent?: number }) {
  return (
    <aside className="w-72 h-full flex flex-col pt-6 pb-8 border-r border-cinematic-border/40 shrink-0 bg-cinematic-panel/90 backdrop-blur-md z-10 sticky top-0">
      
      {/* Top Search / Logo Area */}
      <div className="flex items-center justify-between px-6 mb-8">
        <div className="size-6 bg-gradient-to-tr from-brand-ember to-cinematic-accent rounded-none shadow-sm" />
        <Search className="size-4 text-cinematic-text-dim hover:text-cinematic-text cursor-pointer transition-colors" />
      </div>

      <div className="px-6 mb-4 flex items-center justify-between">
        <h2 className="font-heading font-medium text-lg text-cinematic-text">Chapters</h2>
        <ChevronDown className="size-4 text-cinematic-text-dim" />
      </div>

      {/* Chapters List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar">
        
        {/* Active Chapter */}
        <div className="bg-cinematic-panel-hover/80 border border-cinematic-border-heavy rounded-none overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between text-cinematic-accent text-sm font-medium cursor-pointer">
            <span>Chapter 1: The Beginning</span>
            <ChevronDown className="size-4" />
          </div>
          
          <div className="px-2 pb-2 space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 text-cinematic-text text-sm bg-gradient-to-r from-cinematic-border-heavy/50 to-transparent rounded-none cursor-pointer border-l-2 border-cinematic-accent">
              <div className="size-1.5 bg-cinematic-accent rounded-none shadow-sm shadow-brand-glow/60" />
              <span>The Mysterious Village</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-cinematic-text-dim text-sm hover:text-cinematic-text rounded-none cursor-pointer transition-colors">
              <span className="text-[10px] w-1.5 flex justify-center">2</span>
              <span>Meeting the Elder</span>
            </div>
          </div>
        </div>

        {/* Inactive Chapters */}
        <div className="px-4 py-3 flex items-center justify-between text-cinematic-text-dim text-sm font-medium cursor-pointer hover:bg-cinematic-panel-hover/50 rounded-none transition-colors">
          <span>The Enchanted Forest</span>
          <ChevronRight className="size-4" />
        </div>
        <div className="px-4 py-3 flex items-center justify-between text-cinematic-text-dim text-sm font-medium cursor-pointer hover:bg-cinematic-panel-hover/50 rounded-none transition-colors">
          <span>Trials and Challenges</span>
          <ChevronRight className="size-4" />
        </div>
        <div className="px-4 py-3 flex items-center justify-between text-cinematic-text-dim text-sm font-medium cursor-pointer hover:bg-cinematic-panel-hover/50 rounded-none transition-colors">
          <span>The Final Awakening</span>
          <ChevronRight className="size-4" />
        </div>
      </div>

      {/* Chapter Progress */}
      <div className="px-6 mt-6 pt-6 border-t border-cinematic-border/40 pb-6">
        <div className="flex items-center justify-between text-xs font-mono text-cinematic-text-dim mb-2">
          <span>Chapter Progress:</span>
          <span className="text-cinematic-text">3 / 14</span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1 bg-cinematic-border rounded-none overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-ember to-cinematic-accent w-[21%] shadow-sm shadow-brand-glow/50" />
        </div>
      </div>

      {/* Bottom Branding / Actions */}
      <div className="px-6 space-y-4">
        <div className="flex items-center gap-3 text-cinematic-text-dim hover:text-cinematic-text text-sm cursor-pointer transition-colors">
          <div className="flex gap-1">
            <div className="size-1.5 rounded-none bg-current opacity-60" />
            <div className="size-1.5 rounded-none bg-current opacity-80" />
            <div className="size-1.5 rounded-none bg-current" />
          </div>
          <span>FunggaWari</span>
        </div>
        
        <div className="flex justify-between items-center text-cinematic-text-dim text-sm">
          <span>Settings</span>
          <Settings className="size-4 hover:text-cinematic-text cursor-pointer transition-colors" />
        </div>
      </div>
      
    </aside>
  );
}
