"use client";

import { ChevronDown, ChevronRight, Search, Settings } from "lucide-react";
import * as React from "react";

type Scene = {
  _id: string;
  title: string;
  order: number;
};

type Chapter = {
  _id: string;
  title: string;
  order: number;
  scenes: Scene[];
};

type StorySidebarProps = {
  chapters?: Chapter[];
  activeSceneId?: string | null;
  onSceneSelect?: (sceneId: string) => void;
};

export function StorySidebar({ chapters, activeSceneId, onSceneSelect }: StorySidebarProps) {
  const [expandedChapterId, setExpandedChapterId] = React.useState<string | null>(
    chapters?.[0]?._id ?? null
  );

  // Auto-expand the chapter containing the active scene
  React.useEffect(() => {
    if (!activeSceneId || !chapters) return;
    for (const ch of chapters) {
      if (ch.scenes.some((s) => s._id === activeSceneId)) {
        setExpandedChapterId(ch._id);
        break;
      }
    }
  }, [activeSceneId, chapters]);

  const allScenes = chapters?.flatMap((c) => c.scenes) ?? [];
  const activeSceneIndex = allScenes.findIndex((s) => s._id === activeSceneId);
  const totalScenes = allScenes.length;
  const progressPercent =
    totalScenes > 0 ? Math.round(((activeSceneIndex + 1) / totalScenes) * 100) : 0;

  return (
    <aside className="w-72 h-full flex flex-col pt-6 pb-8 border-r border-cinematic-border/40 shrink-0 bg-cinematic-panel/90 backdrop-blur-md z-10 sticky top-0">

      {/* Top Logo / Search */}
      <div className="flex items-center justify-between px-6 mb-8">
        <div className="size-6 bg-gradient-to-tr from-brand-ember to-cinematic-accent rounded-none shadow-sm" />
        <Search className="size-4 text-cinematic-text-dim hover:text-cinematic-text cursor-pointer transition-colors" />
      </div>

      <div className="px-6 mb-4 flex items-center justify-between">
        <h2 className="font-heading font-medium text-lg text-cinematic-text">Chapters</h2>
        <ChevronDown className="size-4 text-cinematic-text-dim" />
      </div>

      {/* Chapters List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
        {chapters && chapters.length > 0 ? (
          chapters
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((chapter) => {
              const isExpanded = expandedChapterId === chapter._id;
              return (
                <div key={chapter._id} className="overflow-hidden">
                  {/* Chapter Header */}
                  <button
                    onClick={() => setExpandedChapterId(isExpanded ? null : chapter._id)}
                    className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium cursor-pointer text-cinematic-text-dim hover:text-cinematic-text hover:bg-cinematic-panel-hover/50 rounded-none transition-colors"
                  >
                    <span className="text-left">{chapter.title}</span>
                    {isExpanded ? (
                      <ChevronDown className="size-4 shrink-0" />
                    ) : (
                      <ChevronRight className="size-4 shrink-0" />
                    )}
                  </button>

                  {/* Scenes */}
                  {isExpanded && (
                    <div className="px-2 pb-2 space-y-1">
                      {chapter.scenes
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((scene, i) => {
                          const isActive = scene._id === activeSceneId;
                          return (
                            <button
                              key={scene._id}
                              onClick={() => onSceneSelect?.(scene._id)}
                              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-none cursor-pointer transition-colors text-left ${
                                isActive
                                  ? "bg-gradient-to-r from-cinematic-border-heavy/50 to-transparent border-l-2 border-cinematic-accent text-cinematic-text"
                                  : "text-cinematic-text-dim hover:text-cinematic-text hover:bg-cinematic-panel-hover/30"
                              }`}
                            >
                              {isActive ? (
                                <div className="size-1.5 bg-cinematic-accent rounded-none shadow-sm shadow-brand-glow/60 shrink-0" />
                              ) : (
                                <span className="text-[10px] w-1.5 flex justify-center shrink-0">{i + 1}</span>
                              )}
                              <span className="truncate">{scene.title}</span>
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })
        ) : (
          /* Loading / empty state */
          <div className="px-4 py-6 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 bg-cinematic-panel-hover/40 animate-pulse rounded-none" />
            ))}
          </div>
        )}
      </div>

      {/* Chapter Progress */}
      <div className="px-6 mt-6 pt-6 border-t border-cinematic-border/40 pb-6">
        <div className="flex items-center justify-between text-xs font-mono text-cinematic-text-dim mb-2">
          <span>Progress:</span>
          <span className="text-cinematic-text">
            {activeSceneIndex >= 0 ? activeSceneIndex + 1 : 0} / {totalScenes}
          </span>
        </div>
        <div className="w-full h-1 bg-cinematic-border rounded-none overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-ember to-cinematic-accent shadow-sm shadow-brand-glow/50 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
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
