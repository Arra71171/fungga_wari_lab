"use client";

import * as React from "react";
import { LeftNav } from "./LeftNav";
import { RightWidgets } from "./RightWidgets";
import { StoryTopNav } from "./StoryTopNav";
import { Button } from "@workspace/ui/components/button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import { useStoryReader } from "./StoryReaderContext";

export function StoryDesktopLayout({ children }: { children: React.ReactNode }) {
  const { mode } = useStoryReader();
  const isFocusMode = mode === "focus" || mode === "immersive";
  const hideTopNav = mode === "immersive";

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen w-full overflow-hidden bg-cinematic-bg text-cinematic-text transition-colors duration-500">
        {!hideTopNav && <StoryTopNav />}
        
        <div className="flex flex-1 overflow-hidden relative">
          {/* Left Sidebar (Chapter Tree, Progress) */}
          <aside 
            className={cn(
              "flex-col border-r border-cinematic-border bg-cinematic-panel/40 backdrop-blur-md transition-all duration-500 ease-in-out z-10",
              isFocusMode ? "w-0 opacity-0 overflow-hidden border-r-0" : "w-[280px] xl:w-[320px] opacity-100 flex"
            )}
          >
            {/* Top Bar inside Sidebar for back nav */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-cinematic-border flex-shrink-0">
              <Button variant="ghost" size="sm" asChild className="text-cinematic-text hover:text-brand-ember hover:bg-cinematic-panel-hover">
                <Link href="/stories">
                  <ChevronLeft className="mr-2 size-4" />
                  Back to Archive
                </Link>
              </Button>
            </div>
            <LeftNav />
          </aside>

          {/* Main Content */}
          <main 
            className={cn(
              "flex-1 relative overflow-y-auto overflow-x-hidden flex flex-col items-center custom-scrollbar transition-all duration-500 ease-in-out",
              isFocusMode ? "max-w-4xl mx-auto" : ""
            )}
          >
            <div className={cn("w-full max-w-[860px] px-8 lg:px-12 pb-32 transition-all duration-500", !isFocusMode && "mt-0")}>
               {children}
            </div>
          </main>

          {/* Right Sidebar (Progress Tree, Reading Prefs, Tools) */}
          <aside 
            className={cn(
              "flex-col border-l border-cinematic-border bg-cinematic-panel/40 backdrop-blur-md transition-all duration-500 ease-in-out z-10",
              isFocusMode ? "w-0 opacity-0 overflow-hidden border-l-0" : "w-[300px] xl:w-[340px] opacity-100 flex"
            )}
          >
            <div className="h-16 border-b border-cinematic-border flex items-center px-6 flex-shrink-0">
               <span className="font-heading tracking-widest uppercase text-xs font-bold text-muted-foreground">Storyteller Terminal</span>
            </div>
            <RightWidgets />
          </aside>
        </div>
      </div>
    </TooltipProvider>
  );
}
