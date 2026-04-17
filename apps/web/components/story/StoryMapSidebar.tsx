"use client";

import * as React from "react";
import { useStoryReader } from "./StoryReaderContext";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@workspace/ui/components/sheet";
import { Map } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export function StoryMapSidebar() {
  const { story, currentSceneId, setCurrentSceneId } = useStoryReader();
  const [open, setOpen] = React.useState(false);

  if (!story || !story.chapters) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-brand-ember transition-colors flex items-center gap-2">
          <Map className="size-3" />
          Map
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-cinematic-bg border-l border-border/10 w-80 p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-border/10">
          <SheetTitle className="font-heading text-lg font-black uppercase tracking-widest text-brand-ember">
            Story Map
          </SheetTitle>
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            Navigate the manuscript
          </p>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
          <div className="space-y-8">
            {story.chapters.map((chapter: any, index: number) => (
              <div key={chapter._id} className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-muted-foreground/50 tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-heading text-sm uppercase tracking-wider text-muted-foreground">
                    {chapter.title}
                  </h3>
                </div>
                
                {chapter.scenes && chapter.scenes.length > 0 ? (
                  <div className="pl-6 border-l border-brand-ember/20 ml-2 space-y-3">
                    {chapter.scenes.map((scene: any) => {
                      const isActive = scene._id === currentSceneId;
                      return (
                        <button
                          key={scene._id}
                          onClick={() => {
                            setCurrentSceneId(scene._id);
                            setOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 text-left group transition-all",
                            isActive ? "opacity-100 translate-x-1" : "opacity-50 hover:opacity-100 hover:translate-x-1"
                          )}
                        >
                          <div className={cn(
                            "size-1.5 rounded-full shrink-0",
                            isActive ? "bg-brand-ember shadow-[0_0_8px_rgba(255,165,0,0.5)]" : "bg-muted-foreground/50 group-hover:bg-brand-ember/50"
                          )} />
                          <span className={cn(
                            "font-mono text-[10px] uppercase tracking-widest truncate",
                            isActive ? "text-brand-ember font-bold" : "text-muted-foreground"
                          )}>
                            {scene.title || "Scene"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="pl-6 border-l border-border/10 ml-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/30">
                      Fragments lost to time
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
