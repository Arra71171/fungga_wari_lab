"use client";

import * as React from "react";
import { LeftNav } from "./LeftNav";
import { RightWidgets } from "./RightWidgets";
import { Button } from "@workspace/ui/components/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@workspace/ui/components/sheet";
import { ChevronLeft, Menu, Settings2, Maximize2, Minimize2 } from "lucide-react";
import Link from "next/link";
import { useStoryReader } from "./StoryReaderContext";
import { cn } from "@workspace/ui/lib/utils";
import { ReadingProgressBar } from "./ReadingProgressBar";

export function StoryMobileLayout({ children }: { children: React.ReactNode }) {
  const [isFabExpanded, setIsFabExpanded] = React.useState(false);
  const { story, mode, setMode } = useStoryReader();

  const isImmersive = mode === "immersive";

  return (
    <div className="flex flex-col min-h-screen bg-cinematic-bg text-cinematic-text font-sans relative">
      <ReadingProgressBar />
      
      {/* Top Bar (Hamburger, Logo, Shortcut) */}
      <header 
        className={cn(
          "sticky top-0 z-40 w-full h-14 border-b border-cinematic-border bg-cinematic-bg/80 backdrop-blur-md flex items-center justify-between px-4 transition-transform duration-500",
          isImmersive ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
        )}
      >
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-cinematic-text hover:bg-cinematic-panel">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0 border-r-cinematic-border bg-cinematic-panel flex flex-col">
            <SheetTitle className="sr-only">Chapter Navigation</SheetTitle>
            <div className="flex items-center justify-between h-14 px-4 border-b border-cinematic-border flex-shrink-0">
              <Button variant="ghost" size="sm" asChild className="text-cinematic-text hover:text-brand-ember">
                <Link href="/stories">
                  <ChevronLeft className="mr-2 size-4" />
                  Exit
                </Link>
              </Button>
            </div>
            <LeftNav />
          </SheetContent>
        </Sheet>

        <div className="flex flex-col items-center truncate max-w-[50vw]">
          {story && (
            <div className="font-heading text-sm font-black tracking-tighter uppercase text-cinematic-text truncate w-full text-center">
              {story.title}
            </div>
          )}
          <span className="text-[9px] font-mono text-cinematic-text-dim uppercase tracking-widest">
            Fungga Wari
          </span>
        </div>

        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setMode(mode === "immersive" ? "standard" : "immersive")}
          className="text-cinematic-text hover:bg-cinematic-panel"
        >
          {isImmersive ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </Button>
      </header>

      {/* Main Content (Single Column Immersive) */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-5 pt-6 pb-[200px] overflow-x-hidden">
        {children}
      </main>

      {/* Floating Action Button (FAB) + Mini Bottom Sheet Tools */}
      <div 
        className={cn(
          "fixed bottom-24 right-5 z-40 transition-all duration-500",
          isImmersive && "opacity-20 hover:opacity-100"
        )}
      >
        <Sheet open={isFabExpanded} onOpenChange={setIsFabExpanded}>
          <SheetTrigger asChild>
             <Button size="icon" className="size-14 rounded-full shadow-glow-primary bg-cinematic-panel border-2 border-brand-ember/50 hover:bg-cinematic-panel-hover text-brand-ember transition-all h-[3.5rem] w-[3.5rem]">
               <Settings2 className="size-6" />
             </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[75vh] bg-cinematic-panel border-t border-cinematic-border rounded-t-2xl p-0 flex flex-col">
             <SheetTitle className="sr-only">Tools and Controls</SheetTitle>
             <RightWidgets />
          </SheetContent>
        </Sheet>
      </div>

      {/* Hidden exit mode button for immersive mode */}
      {isImmersive && (
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setMode("standard")}
          className="fixed top-4 right-4 z-50 rounded-full shadow-lg bg-cinematic-panel/80 hover:bg-cinematic-panel text-cinematic-text backdrop-blur-md"
        >
          <Minimize2 className="size-4" />
        </Button>
      )}
    </div>
  );
}
