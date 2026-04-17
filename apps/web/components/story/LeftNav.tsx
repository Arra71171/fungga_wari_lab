"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { ChevronDown, Lock, Unlock, Clock, BookOpen } from "lucide-react";
import { useStoryReader } from "./StoryReaderContext";

export function LeftNav() {
  const { story, currentSceneId, setCurrentSceneId } = useStoryReader();
  const [expandedChaps, setExpandedChaps] = React.useState<Record<string, boolean>>({});

  // Auto-expand the first chapter when data loads
  React.useEffect(() => {
    if (story?.chapters && story.chapters.length > 0 && Object.keys(expandedChaps).length === 0) {
      setExpandedChaps({ [story.chapters[0]._id]: true });
    }
  }, [story, expandedChaps]);

  const toggleChap = (id: string) => {
    setExpandedChaps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!story || !story.chapters) return null;

  return (
    <ScrollArea className="flex-1 w-full pb-10">
      <div className="p-4 md:p-6 flex flex-col gap-6">
        
        {/* Navigation Section */}
        <div className="flex flex-col gap-1">
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-cinematic-text-dim mb-4">
            Storyteller's Notebook
          </h4>
          
          <div className="flex flex-col gap-2">
            {story.chapters.map((chap: any) => {
              const chapId = chap._id;
              const isExpanded = expandedChaps[chapId];
              const scenes = chap.scenes || [];
              const isLocked = scenes.length === 0;

              return (
                <div key={chapId} className="flex flex-col">
                  <button
                    onClick={() => toggleChap(chapId)}
                    disabled={isLocked}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg text-sm text-left transition-all group",
                      isExpanded 
                        ? "bg-brand-ember/10 border border-brand-ember/20 text-brand-ember" 
                        : "hover:bg-cinematic-panel-hover text-cinematic-text-dim",
                      isLocked ? "opacity-40 cursor-not-allowed bg-cinematic-bg border border-cinematic-border border-dashed" : "border border-transparent"
                    )}
                  >
                    <span className={cn("font-medium tracking-wide flex items-center gap-2", isExpanded ? "text-brand-ember drop-shadow-md" : "")}>
                       {chap.title}
                       {isLocked && <span className="text-[8px] px-1.5 py-0.5 rounded border border-cinematic-text-dim/30 text-cinematic-text-dim uppercase tracking-[0.2em]">Sealed</span>}
                    </span>
                    <div className="flex items-center gap-2">
                       {!isLocked && (
                        <ChevronDown 
                          className={cn(
                            "size-4 transition-transform text-cinematic-text-dim", 
                            isExpanded ? "rotate-180 text-brand-ember" : "-rotate-90"
                          )} 
                        />
                       )}
                       {isLocked && <Lock className="size-3 text-cinematic-text-dim/50" />}
                    </div>
                  </button>

                  <div 
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out pl-4 pr-2",
                      isExpanded ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="flex flex-col gap-1 border-l border-cinematic-border/50 ml-3 pl-3 py-1">
                      {scenes.map((scene: any) => {
                        const isCurrent = currentSceneId === scene._id;
                        return (
                          <div 
                            key={scene._id} 
                            onClick={() => setCurrentSceneId(scene._id)}
                            className={cn(
                              "cursor-pointer text-xs py-2 px-3 rounded-md transition-all flex items-center gap-3 relative",
                              isCurrent ? "bg-brand-ember/10 text-brand-ember font-bold border border-brand-ember/20" : 
                              "text-cinematic-text-dim hover:text-cinematic-text hover:bg-cinematic-panel-hover"
                            )}
                          >
                             {isCurrent && (
                                <div className="absolute -left-[13px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-ember shadow-[0_0_8px_var(--color-brand-ember)]" />
                             )}
                             {isCurrent ? <Unlock className="size-3" /> : <div className="size-1.5 rounded-full bg-cinematic-text-dim/50" />}
                             <span className="truncate flex-1">{scene.title}</span>
                             {scene.estimatedReadTime && (
                               <span className="text-[9px] font-mono text-cinematic-text-dim/60 ml-auto flex items-center gap-1">
                                 <Clock className="size-2.5" />
                                 {scene.estimatedReadTime}m
                               </span>
                             )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Progress Bar Snippet - placeholder until Context is fully wired for progress */}
        <div className="mt-auto pt-6 border-t border-cinematic-border/50 flex flex-col gap-4">
          <div className="flex flex-col gap-2 bg-cinematic-bg p-4 rounded-lg border border-cinematic-border/30">
            <h5 className="text-[10px] uppercase font-mono tracking-widest text-brand-ember/80 border-b border-cinematic-border/30 pb-2 mb-1">
              Metadata
            </h5>
            <div className="flex justify-between items-center text-xs text-cinematic-text-dim mt-1">
              <span className="flex items-center gap-1.5"><Clock className="size-3" /> Reading Time</span>
              <span className="font-mono text-cinematic-text">~12 min</span>
            </div>
            <div className="flex justify-between items-center text-xs text-cinematic-text-dim mt-1">
              <span className="flex items-center gap-1.5"><BookOpen className="size-3" /> Chapters</span>
              <span className="font-mono text-cinematic-text">{story.chapters.length}</span>
            </div>
          </div>
        </div>
        
      </div>
    </ScrollArea>
  );
}
