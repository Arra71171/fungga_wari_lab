"use client";

import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { BrandLogo } from "@workspace/ui/components/BrandLogo";
import { AnimatedThemeToggler } from "@workspace/ui/components/animated-theme-toggler";
import { useStoryReader } from "./StoryReaderContext";

/**
 * StorySidebar — Left panel of the 3-panel cinematic reader.
 *
 * Reads all data from StoryReaderContext (Supabase-backed).
 * No props required. Uses `id` (not legacy `_id`) from new context.
 */
type StorySidebarProps = {
  /** Called when a scene is selected — used to close mobile drawer */
  onSceneSelect?: () => void;
};

export function StorySidebar({ onSceneSelect }: StorySidebarProps = {}) {
  const { story, chapters, currentSceneId, setCurrentSceneId } = useStoryReader();
  const [expandedChapterId, setExpandedChapterId] = React.useState<string | null>(null);

  // Auto-expand the chapter containing the active scene
  React.useEffect(() => {
    if (!currentSceneId || !chapters.length) return;
    for (const ch of chapters) {
      if ((ch.scenes ?? []).some((s) => s.id === currentSceneId)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setExpandedChapterId(ch.id);
        break;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSceneId]);

  const hasInitialized = React.useRef(false);

  // Auto-expand first chapter on initial load — runs once when chapters first arrive
  React.useEffect(() => {
    if (!hasInitialized.current && chapters.length && !expandedChapterId) {
      setExpandedChapterId(chapters[0]?.id ?? null);
      hasInitialized.current = true;
    }
  }, [chapters, expandedChapterId]);

  const allScenes = chapters.flatMap((c) => c.scenes ?? []);
  const activeSceneIndex = allScenes.findIndex((s) => s.id === currentSceneId);
  const totalScenes = allScenes.length;
  const progressPercent =
    totalScenes > 0
      ? Math.round(((Math.max(0, activeSceneIndex) + (currentSceneId ? 1 : 0)) / totalScenes) * 100)
      : 0;

  return (
    <aside
      data-slot="story-sidebar"
      className="w-full lg:w-72 h-full flex flex-col pt-6 pb-8 border-r border-cinematic-border shrink-0 bg-cinematic-panel/90 backdrop-blur-md z-10"
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-6 mb-8">
        <BrandLogo variant="icon" size="sm" className="text-brand-ember/60" />
        <span className="font-mono text-nano uppercase tracking-widest text-muted-foreground/50">
          v1
        </span>
      </div>

      {/* Story title */}
      <div className="px-6 mb-5">
        <h2 className="font-heading font-medium text-sm text-cinematic-text tracking-wide truncate">
          {story?.title ?? "Loading…"}
        </h2>
        <p className="font-mono text-nano uppercase tracking-widest text-muted-foreground/60 mt-1">
          {story?.category ?? "Manuscript"}
        </p>
      </div>

      {/* Chapter / Scene Tree */}
      <div className="flex-1 overflow-y-auto px-4 space-y-1 scrollbar-none">
        {chapters.length > 0 ? (
          chapters.map((chapter, chIdx) => {
            const isExpanded = expandedChapterId === chapter.id;
            const scenes = (chapter.scenes ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

            return (
              <div key={chapter.id} className="overflow-hidden">
                <button
                  onClick={() => {
                    setExpandedChapterId(isExpanded ? null : chapter.id);
                    if (!isExpanded && scenes.length > 0) {
                      setCurrentSceneId(scenes[0]?.id ?? null);
                      onSceneSelect?.();
                    }
                  }}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-cinematic-text hover:bg-accent rounded-none transition-colors"
                  aria-expanded={isExpanded}
                  aria-label={`Chapter ${chIdx + 1}: ${chapter.title}`}
                >
                  <span className="flex items-center gap-2 text-left truncate">
                    <span className="font-mono text-fine text-muted-foreground/40 tabular-nums shrink-0">
                      {String(chIdx + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate">{chapter.title}</span>
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="size-3.5 shrink-0" />
                  ) : (
                    <ChevronRight className="size-3.5 shrink-0" />
                  )}
                </button>

                {/* Scene list */}
                {isExpanded && scenes.length > 0 && (
                  <div className="px-2 pb-2 space-y-0.5">
                    {scenes.map((scene, scIdx) => {
                      const isActive = scene.id === currentSceneId;
                      return (
                        <button
                          key={scene.id}
                          onClick={() => {
                            setCurrentSceneId(scene.id);
                            onSceneSelect?.();
                          }}
                          aria-label={`Scene ${scIdx + 1}: ${scene.title ?? "Scene"}`}
                          aria-current={isActive ? "true" : undefined}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 text-xs rounded-none cursor-pointer transition-all text-left",
                            isActive
                              ? "bg-brand-ember/15 border-l-2 border-brand-ember text-cinematic-text font-medium"
                              : "text-muted-foreground hover:text-cinematic-text hover:bg-accent border-l-2 border-transparent"
                          )}
                        >
                          {isActive ? (
                            <div className="size-1.5 bg-brand-ember rounded-full shrink-0 shadow-[0_0_6px_var(--brand-ember)]" />
                          ) : (
                            <span className="text-fine font-mono text-muted-foreground/40 w-4 shrink-0 tabular-nums">
                              {String(scIdx + 1).padStart(2, "0")}
                            </span>
                          )}
                          <span className="truncate">
                            {scene.title || "Scene"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {isExpanded && scenes.length === 0 && (
                  <div className="px-6 pb-3">
                    <span className="font-mono text-nano uppercase tracking-widest text-muted-foreground/30">
                      No scenes yet
                    </span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          /* Skeleton while loading */
          <div className="px-4 py-6 space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-9 bg-cinematic-panel/40 animate-pulse rounded-none"
              />
            ))}
          </div>
        )}
      </div>

      {/* Reading Progress */}
      <div className="px-6 mt-auto pt-6 border-t border-cinematic-border/40 space-y-3">
        <div className="flex items-center justify-between text-nano font-mono uppercase tracking-widest text-muted-foreground">
          <span>Progress</span>
          <span className="text-cinematic-text tabular-nums">
            {currentSceneId ? Math.max(1, activeSceneIndex + 1) : 0} / {totalScenes}
          </span>
        </div>
        <div className="w-full h-px bg-border overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-ember to-brand-glow transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Bottom branding + theme toggle */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="size-1 bg-brand-ember/40 rounded-none" />
              <div className="size-1 bg-brand-ember/60 rounded-none" />
              <div className="size-1 bg-brand-ember rounded-none" />
            </div>
            <span className="font-mono text-nano uppercase tracking-widest text-muted-foreground/40">
              Fungga Wari
            </span>
          </div>
          {/* Theme toggle — controls cinematic reader light/dark */}
          <AnimatedThemeToggler
            aria-label="Toggle reader theme"
            className="size-7 border-cinematic-border/40 bg-cinematic-panel hover:bg-accent"
          />
        </div>
      </div>
    </aside>
  );
}
