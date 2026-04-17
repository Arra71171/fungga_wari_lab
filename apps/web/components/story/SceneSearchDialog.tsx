"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Search } from "lucide-react";
import { useStoryReader } from "./StoryReaderContext";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { cn } from "@workspace/ui/lib/utils";

export function SceneSearchDialog() {
  const { story, currentSceneId, setCurrentSceneId } = useStoryReader();
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Compute all searchable scenes
  const scenesList = React.useMemo(() => {
    if (!story?.chapters) return [];
    const list: { id: string; title: string; chapterTitle: string }[] = [];
    
    // We assume block.props.title doesn't exist directly on story structure here, 
    // but scenes are just structural nodes. For an immersive reader, we might just 
    // display "Chapter 1 - Scene 2" etc.
    let chapterNum = 1;
    story.chapters.forEach((chap: any) => {
      let sceneNum = 1;
      if (chap.scenes && Array.isArray(chap.scenes)) {
        chap.scenes.forEach((sceneId: string) => {
          list.push({
            id: sceneId,
            title: `Scene ${sceneNum}`,
            chapterTitle: chap.title || `Chapter ${chapterNum}`,
          });
          sceneNum++;
        });
      }
      chapterNum++;
    });

    return list;
  }, [story]);

  const filtered = React.useMemo(() => {
    if (!query) return scenesList;
    const lower = query.toLowerCase();
    return scenesList.filter(
      (s) =>
        s.title.toLowerCase().includes(lower) ||
        s.chapterTitle.toLowerCase().includes(lower)
    );
  }, [scenesList, query]);

  if (!story) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-cinematic-panel border-cinematic-border p-0 overflow-hidden text-cinematic-text">
        <DialogTitle className="sr-only">Search Scenes</DialogTitle>
        <div className="flex items-center border-b border-cinematic-border px-3">
          <Search className="size-4 text-muted-foreground mr-2" />
          <Input 
            placeholder="Search scenes or chapters..." 
            className="flex-1 border-0 focus-visible:ring-0 bg-transparent rounded-none h-12 text-sm text-cinematic-text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <ScrollArea className="max-h-[300px]">
          <div className="p-2 flex flex-col gap-1">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-sm font-mono text-muted-foreground">
                No scenes found.
              </div>
            ) : (
              filtered.map((s) => (
                <button
                  key={s.id}
                  className={cn(
                    "flex flex-col items-start px-3 py-2 text-sm rounded-md transition-colors",
                    s.id === currentSceneId 
                      ? "bg-brand-ember/20 text-brand-ember" 
                      : "hover:bg-cinematic-bg text-cinematic-text"
                  )}
                  onClick={() => {
                    setCurrentSceneId(s.id);
                    setIsOpen(false);
                    setQuery("");
                  }}
                >
                  <span className="font-heading font-semibold">{s.title}</span>
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mt-1">
                    {s.chapterTitle}
                  </span>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
