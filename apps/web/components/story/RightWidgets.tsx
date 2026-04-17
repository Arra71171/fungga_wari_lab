"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Button } from "@workspace/ui/components/button";
import { Volume2, MessageSquare, Bookmark, Type, Play, Square, Pause, Loader2 } from "lucide-react";
import { useStoryReader } from "./StoryReaderContext";
import { useReadingPreferences } from "@/hooks/useReadingPreferences";
import { useKokoroTTS } from "@/hooks/useKokoroTTS";

export function RightWidgets() {
  const { story, currentSceneId, setCurrentSceneId } = useStoryReader();
  const { preferences, updatePreference } = useReadingPreferences();

  // Calculate upcoming scenes
  const upcomingScenes = React.useMemo(() => {
    if (!story || !story.chapters) return [];
    
    type FlattenedScene = { id: string; title: string; chapterTitle: string; status: 'past' | 'current' | 'future' };
    const allScenes: FlattenedScene[] = [];
    
    let foundCurrent = false;
    let hasCurrentScene = false;

    // Check if currentSceneId exists in the array at all
    for (const chap of story.chapters) {
      if (chap.scenes) {
        for (const s of chap.scenes) {
          if (s._id === currentSceneId) hasCurrentScene = true;
        }
      }
    }

    // Default to first scene if current scene isn't found
    const activeSceneId = (!currentSceneId || !hasCurrentScene) 
      ? story.chapters[0]?.scenes?.[0]?._id 
      : currentSceneId;

    for (const chap of story.chapters) {
      if (!chap.scenes) continue;
      for (const s of chap.scenes) {
        let status: 'past' | 'current' | 'future' = 'future';
        if (s._id === activeSceneId) {
          status = 'current';
          foundCurrent = true;
        } else if (!foundCurrent) {
          status = 'past';
        }
        
        allScenes.push({
          id: s._id,
          title: s.title,
          chapterTitle: chap.title,
          status
        });
      }
    }
    
    // We want to show current scene, and up to 2 future scenes
    const currentIndex = allScenes.findIndex(s => s.status === 'current');
    if (currentIndex === -1) return [];
    
    return allScenes.slice(Math.max(0, currentIndex - 1), currentIndex + 3);
  }, [story, currentSceneId]);

  // Find the active scene to get text for TTS
  const activeScene = React.useMemo(() => {
    if (!story || !story.chapters) return null;
    for (const chap of story.chapters) {
      if (chap.scenes) {
        const found = chap.scenes.find((s: any) => s._id === currentSceneId);
        if (found) return found;
      }
    }
    return story.chapters[0]?.scenes?.[0] || null;
  }, [story, currentSceneId]);

  // Extract text from TipTap JSON or plain text
  const sceneText = React.useMemo(() => {
    if (!activeScene) return null;
    let text = "";
    if (activeScene.content) {
      text = activeScene.content;
    } else if (activeScene.tiptapContent) {
       const extractText = (node: any): string => {
         if (node.type === "text") return node.text || "";
         if (node.content && Array.isArray(node.content)) {
           return node.content.map(extractText).join(" ") + (node.type === "paragraph" ? "\n" : "");
         }
         return "";
       };
       text = extractText(activeScene.tiptapContent);
    }
    return text || "No text available.";
  }, [activeScene]);

  const nextSize = () => {
    const sizes = ["small", "medium", "large", "xlarge"] as const;
    const curr = sizes.indexOf(preferences.fontSize as any);
    updatePreference("fontSize", sizes[(curr + 1) % sizes.length] as "small" | "medium" | "large" | "xlarge");
  };

  // Hook for Kokoro TTS
  const { state: ttsState, play: ttsPlay, pause: ttsPause, resume: ttsResume, stop: ttsStop, isReady: ttsReady } = useKokoroTTS(sceneText);

  return (
    <ScrollArea className="flex-1 w-full pb-10">
      <div className="p-4 md:p-6 flex flex-col gap-8">
        
        {/* Story Progress Tree (Upcoming nodes) */}
        <section className="flex flex-col gap-4">
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-cinematic-text flex justify-between items-center bg-cinematic-bg border border-cinematic-border/50 py-1.5 px-3 rounded-md shadow-inner">
            <span>Story Progress</span>
            <span className="text-[8px] px-2 py-0.5 rounded-full border border-brand-ember/40 text-brand-ember bg-brand-ember/10 tracking-[0.2em] uppercase shadow-[0_0_10px_rgba(var(--color-brand-ember),0.2)]">Active</span>
          </h4>
          <div className="flex flex-col gap-0 relative mt-2 pl-2">
            <div className="absolute left-[13px] top-4 bottom-4 w-[1px] bg-gradient-to-b from-cinematic-border via-brand-ember/50 to-transparent" />
            
            {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
            {upcomingScenes.map((scene: { id: string; title: string; chapterTitle: string; status: 'past' | 'current' | 'future' }, _i: number) => {
              if (scene.status === 'past') {
                return (
                  <div key={scene.id} className="pl-8 relative py-2 mb-1 cursor-pointer hover:bg-cinematic-panel-hover rounded-md transition-colors" onClick={() => setCurrentSceneId(scene.id)}>
                    <div className="absolute left-[9px] top-4 size-2 rounded-full border-2 border-brand-ember bg-cinematic-bg z-10" />
                    <p className="text-xs text-cinematic-text-dim truncate">{scene.title}</p>
                  </div>
                );
              } else if (scene.status === 'current') {
                return (
                  <div key={scene.id} className="pl-8 relative py-3 my-1">
                    <div className="absolute left-1 top-[18px] size-4 rounded-full bg-brand-ember/20 flex items-center justify-center z-10 before:w-2 before:h-2 before:bg-brand-ember before:rounded-full before:shadow-[0_0_8px_var(--color-brand-ember)]" />
                    <div className="border border-brand-ember/30 bg-brand-ember/10 p-3 rounded-lg shadow-md">
                       <p className="text-xs text-brand-ember font-bold tracking-wide truncate">{scene.title}</p>
                       <p className="text-[9px] text-cinematic-text-dim mt-1 font-mono uppercase tracking-wider">{scene.chapterTitle}</p>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={scene.id} className="pl-8 relative py-2 mt-1">
                    <div className="absolute left-[9px] top-4 size-2 rounded-full border-2 border-cinematic-border/60 bg-transparent z-10" />
                    <p className="text-xs text-cinematic-text-dim/50 italic truncate">{scene.title}</p>
                  </div>
                );
              }
            })}
          </div>
        </section>

        {/* Reading Preferences */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <div className="h-[1px] w-4 bg-brand-ember/50" />
             <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-ember/90 font-bold whitespace-nowrap drop-shadow-sm">Preferences</span>
             <div className="h-[1px] flex-1 bg-cinematic-border/50" />
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              variant="outline" 
              onClick={nextSize}
              className="w-full bg-cinematic-panel/60 backdrop-blur-md border-cinematic-border/50 hover:bg-brand-ember/5 hover:border-brand-ember/50 text-cinematic-text transition-all duration-300 h-10 px-4 flex justify-between items-center group rounded-lg"
            >
               <span className="text-xs font-medium tracking-wide flex items-center gap-2">
                 <Type className="size-3.5 opacity-70" /> Font Size
               </span>
               <span className="text-[10px] font-mono uppercase tracking-widest text-cinematic-text-dim group-hover:text-brand-ember transition-colors">
                 {preferences.fontSize}
               </span>
            </Button>
          </div>
        </section>

        {/* Scene Narrator (Kokoro TTS) */}
        <section className="flex flex-col gap-4">
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-cinematic-text flex items-center gap-2">
             <Volume2 className="size-3.5 text-brand-ember" /> 
             Scene Narrator
          </h4>
          <div className="w-full rounded-lg bg-cinematic-panel overflow-hidden relative group border border-cinematic-border p-3 flex flex-col justify-end">
             {/* Zen Brutalist pattern background */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-brand-ember),0.15)_0%,transparent_70%)]" />
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(45deg, var(--color-cinematic-border) 0, var(--color-cinematic-border) 1px, transparent 0, transparent 50%)", backgroundSize: "10px 10px" }} />
             
             <div className="relative z-10 flex flex-col gap-3 bg-cinematic-bg/80 backdrop-blur-sm p-3 rounded-md border border-cinematic-border/50">
               <div className="flex items-center justify-between">
                 <div className="flex flex-col">
                   <span className="text-xs font-bold text-cinematic-text">Kokoro-82M Oracle</span>
                   <span className="text-[9px] font-mono uppercase tracking-widest text-cinematic-text-dim mt-0.5">
                     {ttsState === "loading" ? "Initializing..." : ttsReady ? "Ready to Narrate" : "Loading Model Offline"}
                   </span>
                 </div>
                 {ttsState === "loading" && <Loader2 className="size-4 animate-spin text-brand-ember" />}
               </div>
               
               <div className="flex items-center gap-2 mt-1">
                  {ttsState !== "playing" ? (
                      <Button 
                         variant="outline" 
                         size="sm" 
                         className="flex-1 bg-brand-ember/10 border-brand-ember/30 text-brand-ember hover:bg-brand-ember hover:text-cinematic-bg transition-colors"
                         disabled={!ttsReady || ttsState === "loading"}
                         onClick={() => ttsState === "paused" ? ttsResume() : ttsPlay()}
                      >
                         <Play className="size-3 mr-1" /> {ttsState === "paused" ? "Resume" : "Play Scene"}
                      </Button>
                  ) : (
                      <Button 
                         variant="outline" 
                         size="sm" 
                         className="flex-1 bg-cinematic-panel border-cinematic-border text-cinematic-text hover:bg-cinematic-panel-hover"
                         onClick={ttsPause}
                      >
                         <Pause className="size-3 mr-1" /> Pause
                      </Button>
                  )}
                  
                  <Button 
                      variant="outline" 
                      size="icon" 
                      className="size-8 bg-cinematic-panel border-cinematic-border text-cinematic-text hover:bg-destructive hover:text-white hover:border-destructive transition-colors shrink-0"
                      onClick={ttsStop}
                      disabled={ttsState === "idle" || ttsState === "loading"}
                  >
                      <Square className="size-3" />
                  </Button>
               </div>
             </div>
          </div>
        </section>

        {/* Utilities */}
        <section className="flex flex-col gap-2 pt-6 border-t border-cinematic-border/50">
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-cinematic-text-dim mb-2 ml-1">App Tools</h4>
          {[
            { label: "Feedback", icon: MessageSquare },
            { label: "Bookmark", icon: Bookmark },
          ].map((item) => (
            <button key={item.label} className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg hover:bg-cinematic-panel-hover text-xs font-medium text-cinematic-text-dim hover:text-brand-ember transition-colors border border-transparent hover:border-cinematic-border/50">
              <span className="flex items-center gap-3">
                <item.icon className="size-3.5 opacity-80" />
                {item.label}
              </span>
            </button>
          ))}
        </section>

      </div>
    </ScrollArea>
  );
}
