"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Flame, Music } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { BrandLogo } from "@workspace/ui/components/BrandLogo";
import { AnimatedThemeToggler } from "@workspace/ui/components/animated-theme-toggler";
import { useStoryReader } from "./StoryReaderContext";

// ─── TipTap → Plain Block Renderer ──────────────────────────────────────────

type TipTapNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
};

/** Extract plain text recursively from a TipTap node */
function extractText(node: TipTapNode): string {
  if (node.type === "text") return node.text ?? "";
  if (!node.content) return "";
  return node.content.map(extractText).join("");
}

function isInternalHref(href: string | undefined): boolean {
  return Boolean(href && (href.startsWith("/") || href.startsWith("#")));
}

/** Render a single TipTap node to a React element */
function renderTipTapNode(node: TipTapNode, index: number): React.ReactNode {
  switch (node.type) {
    case "doc":
      return (
        <React.Fragment key={index}>
          {node.content?.map((child, i) => renderTipTapNode(child, i))}
        </React.Fragment>
      );

    case "paragraph": {
      const text = extractText(node);
      if (!text.trim()) return <div key={index} className="h-4" aria-hidden />;
      return (
        <p key={index} className="font-sans text-base md:text-lg leading-[1.9] text-cinematic-text mb-6">
          {renderInlineContent(node.content ?? [])}
        </p>
      );
    }

    case "heading": {
      const level = (node.attrs?.level as number) ?? 2;
      const text = extractText(node);
      const Tag = `h${Math.min(level, 6)}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      const sizeMap: Record<number, string> = {
        1: "font-display text-4xl md:text-5xl font-black tracking-tight mb-8 mt-12",
        2: "font-heading text-2xl md:text-3xl font-bold tracking-tight mb-6 mt-10",
        3: "font-heading text-xl font-semibold tracking-tight mb-4 mt-8",
        4: "font-heading text-lg font-medium mb-3 mt-6",
        5: "font-heading text-base font-medium mb-2 mt-4",
        6: "font-mono text-sm uppercase tracking-widest mb-2 mt-4 text-muted-foreground",
      };
      return (
        <Tag key={index} className={cn("text-cinematic-text", sizeMap[level] ?? sizeMap[2])}>
          {text}
        </Tag>
      );
    }

    case "blockquote":
      return (
        <blockquote
          key={index}
          className="border-l-2 border-brand-ember pl-6 my-8 italic text-cinematic-text/80 font-sans text-base leading-[1.9]"
        >
          {node.content?.map((child, i) => renderTipTapNode(child, i))}
        </blockquote>
      );

    case "horizontalRule":
      return (
        <div key={index} className="flex items-center justify-center gap-4 my-12" aria-hidden>
          <div className="size-1 bg-brand-ember/40 rounded-none" />
          <div className="size-1 bg-brand-ember/60 rounded-none" />
          <div className="size-1 bg-brand-ember rounded-none shadow-[0_0_4px_var(--brand-ember)]" />
        </div>
      );

    case "bulletList":
      return (
        <ul key={index} className="list-disc pl-6 space-y-2 mb-5 text-cinematic-text font-sans text-base">
          {node.content?.map((child, i) => renderTipTapNode(child, i))}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={index} className="list-decimal pl-6 space-y-2 mb-5 text-cinematic-text font-sans text-base">
          {node.content?.map((child, i) => renderTipTapNode(child, i))}
        </ol>
      );

    case "listItem":
      return (
        <li key={index} className="leading-relaxed">
          {node.content?.map((child, i) => renderTipTapNode(child, i))}
        </li>
      );

    case "image": {
      const src = node.attrs?.src as string | undefined;
      const alt = (node.attrs?.alt as string | undefined) ?? "";
      if (!src) return null;
      return (
        <Image
          key={index}
          src={src}
          alt={alt}
          width={1200}
          height={1600}
          sizes="(max-width: 768px) 100vw, 768px"
          className="w-full h-auto aspect-[3/4] object-cover my-8 border border-cinematic-border/20"
          unoptimized
        />
      );
    }

    case "codeBlock":
      return (
        <pre
          key={index}
          className="bg-cinematic-panel/80 border border-cinematic-border/20 rounded-none p-4 my-6 overflow-x-auto"
        >
          <code className="font-mono text-sm text-brand-glow">
            {extractText(node)}
          </code>
        </pre>
      );

    case "hardBreak":
      return <br key={index} />;

    default:
      // Unknown node types: try to extract text
      if (node.content) {
        return (
          <React.Fragment key={index}>
            {node.content.map((child, i) => renderTipTapNode(child, i))}
          </React.Fragment>
        );
      }
      return null;
  }
}

/** Render inline content nodes (text with marks) */
function renderInlineContent(nodes: TipTapNode[]): React.ReactNode {
  return nodes.map((node, i) => {
    if (node.type !== "text") return renderTipTapNode(node, i);
    let element: React.ReactNode = node.text ?? "";
    if (node.marks) {
      for (const mark of node.marks) {
        switch (mark.type) {
          case "bold":
            element = <strong key={i}>{element}</strong>;
            break;
          case "italic":
            element = <em key={i}>{element}</em>;
            break;
          case "underline":
            element = <u key={i}>{element}</u>;
            break;
          case "strike":
            element = <s key={i}>{element}</s>;
            break;
          case "code":
            element = (
              <code
                key={i}
                className="font-mono text-sm bg-cinematic-panel px-1 py-0.5 rounded-none text-brand-glow"
              >
                {element}
              </code>
            );
            break;
          case "link": {
            const href = mark.attrs?.href as string | undefined;
            const className =
              "text-brand-ember underline underline-offset-2 hover:text-brand-glow transition-colors";
            const isInternal = isInternalHref(href);

            element = href ? (
              <Link
                key={i}
                href={href}
                className={className}
                target={isInternal ? undefined : "_blank"}
                rel={isInternal ? undefined : "noopener noreferrer"}
              >
                {element}
              </Link>
            ) : (
              <span key={i}>{element}</span>
            );
            break;
          }
        }
      }
    }
    return <React.Fragment key={i}>{element}</React.Fragment>;
  });
}

// ─── Choice renderer ──────────────────────────────────────────────────────────

type Choice = { id: string; label: string; next_scene_id: string };

function ChoiceButtons({
  choices,
  onChoose,
}: {
  choices: Choice[];
  onChoose: (sceneId: string) => void;
}) {
  if (!choices.length) return null;
  return (
    <div className="flex flex-col items-center gap-3 py-16 px-4" aria-label="Story choices">
      <p className="font-mono text-fine uppercase tracking-widest text-muted-foreground mb-2">
        Choose your path
      </p>
      {choices.map((choice) => (
        <button
          key={choice.id}
          onClick={() => {
            onChoose(choice.next_scene_id);
          }}
          className="w-full max-w-sm px-6 py-3 border border-cinematic-border/40 hover:border-brand-ember text-left text-sm font-sans text-cinematic-text hover:text-cinematic-text hover:bg-brand-ember/5 transition-all rounded-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type BlockStoryReaderProps = { slug: string };

function BlockStoryReader({ slug }: BlockStoryReaderProps) {
  const { activeScene, chapters, story, currentSceneId, setCurrentSceneId } = useStoryReader();

  // Refs for scrollable containers — needed because on mobile the scroll target
  // is the inner div (overflow-y-auto), NOT the window.
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const mainRef = React.useRef<HTMLElement>(null);

  // Derive first scene ID for "restart" logic
  const firstSceneId = chapters[0]?.scenes[0]?.id ?? null;

  // Derive the active chapter — done before any early returns so hooks always
  // run in the same order regardless of story state.
  let activeChapter = chapters[0] ?? null;
  let activeChapterIndex = 0;

  if (currentSceneId) {
    activeChapter = null;
    for (let i = 0; i < chapters.length; i++) {
      if (chapters[i]?.scenes.some((s) => s.id === currentSceneId)) {
        activeChapter = chapters[i] ?? null;
        activeChapterIndex = i;
        break;
      }
    }
  }

  // Determine the current scene index within the active chapter
  const activeSceneIndex = activeChapter
    ? activeChapter.scenes.findIndex((s) => s.id === currentSceneId)
    : -1;

  // Is this the very last chapter?
  const isLastChapter = activeChapterIndex === chapters.length - 1;

  // Is there a next chapter to navigate to?
  const hasNextChapter = !isLastChapter && chapters.length > 1;

  // Is this scene a dead end (no choices)?
  const isDeadEnd =
    activeScene !== null &&
    (!activeScene.choices || activeScene.choices.length === 0);

  // Next chapter info
  const nextChapter = hasNextChapter ? (chapters[activeChapterIndex + 1] ?? null) : null;
  const nextChapterFirstScene = nextChapter?.scenes[0] ?? null;

  // Is there a next scene within the same chapter?
  const hasNextScene =
    activeChapter !== null &&
    activeSceneIndex >= 0 &&
    activeSceneIndex < activeChapter.scenes.length - 1;
  const nextScene = hasNextScene ? activeChapter?.scenes[activeSceneIndex + 1] : null;

  // Prefer scene content → fall back to chapter-level tiptap_content
  const sceneHasContent = activeScene && (activeScene.tiptap_content || activeScene.content);
  const chapterFallbackContent = !sceneHasContent && activeChapter?.tiptap_content ? activeChapter.tiptap_content : null;
  const hasContent = sceneHasContent || chapterFallbackContent;

  // Scroll helper — scrolls the actual scrollable containers, not the window
  const scrollContentToTop = React.useCallback(() => {
    setTimeout(() => {
      // Scroll the text content container
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: "auto" });
      // On mobile, also scroll the main (flex-col) container so the illustration
      // is visible and the content starts from the top
      mainRef.current?.scrollTo({ top: 0, behavior: "auto" });
    }, 10);
  }, []);

  // Automatically scroll to top whenever the scene changes
  React.useEffect(() => {
    scrollContentToTop();
  }, [currentSceneId, scrollContentToTop]);

  // ── Empty state — all hooks are above, safe to return early here ──────────
  if (!story) return null;

  // Navigation handler
  function goToNext() {
    if (hasNextScene && nextScene) {
      setCurrentSceneId(nextScene.id);
    } else if (hasNextChapter && nextChapterFirstScene) {
      setCurrentSceneId(nextChapterFirstScene.id);
    }
    // Scrolling is now handled automatically by the useEffect
  }

  return (
    <main
      ref={mainRef}
      className="flex-1 h-full flex flex-col lg:flex-row bg-cinematic-bg relative z-10 overflow-y-auto lg:overflow-hidden"
      data-slot="block-story-reader"
      data-story-slug={slug}
    >
      {/* ── Cinematic Hero Illustration (Left Pane on Desktop) ─────────── */}
      <div 
        className={cn(
          "relative w-full shrink-0 border-b lg:border-b-0 lg:border-r border-cinematic-border/20 flex flex-col items-center justify-center bg-cinematic-bg overflow-hidden",
          activeChapter?.illustration_url ? "h-[40vh] sm:h-[45vh] lg:h-full lg:w-[45%]" : "hidden lg:flex lg:w-1/3 lg:h-full"
        )}
      >
        {activeChapter?.illustration_url ? (
          <>
            {/* Blurred background to fill the pane */}
            <div className="absolute inset-0 opacity-30 dark:opacity-20 blur-[60px] scale-110 pointer-events-none" aria-hidden>
              <Image
                src={activeChapter.illustration_url}
                alt=""
                fill
                className="object-cover"
              />
            </div>

            {/* Uncropped Illustration Container */}
            <div className="relative w-full h-full p-4 lg:p-8 flex flex-col items-center justify-center z-10">
              {/* Ensures the image maintains a strict 3:4 aspect ratio and fits within its container */}
              <div className="relative w-full max-w-[540px] 2xl:max-w-[640px] h-auto aspect-[3/4] max-h-full rounded-sm overflow-hidden shadow-brutal ring-1 ring-border/20 mx-auto">
                <Image
                  src={activeChapter.illustration_url}
                  alt={activeChapter.title ?? "Chapter illustration"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                
                {/* Cinematic gradient overlay & Text */}
                <div
                  className="absolute inset-0 illustration-gradient-overlay pointer-events-none"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-8 px-6 pointer-events-none text-center">
                  <span className="font-mono text-nano md:text-fine uppercase tracking-caps text-brand-ember/90 mb-2 drop-shadow-md">
                    Chapter {String(activeChapterIndex + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-heading text-2xl lg:text-3xl font-black uppercase tracking-tight text-illustration-title leading-tight drop-shadow-lg">
                    {activeChapter.title}
                  </h2>
                </div>
              </div>
            </div>
          </>
        ) : activeChapter ? (
          <div className="text-center px-6 relative z-10">
            <span className="font-mono text-fine uppercase tracking-caps text-brand-ember/60 mb-3 block">
              Chapter {String(activeChapterIndex + 1).padStart(2, "0")}
            </span>
            <h2 className="font-heading text-3xl font-black uppercase tracking-tight text-cinematic-text leading-tight">
              {activeChapter.title}
            </h2>
            <div className="flex items-center justify-center gap-3 mt-6" aria-hidden>
              <div className="w-8 h-px bg-brand-ember/30" />
              <div className="size-1 bg-brand-ember/60" />
              <div className="w-8 h-px bg-brand-ember/30" />
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Story Content (Right Pane on Desktop, Scrollable) ──────────── */}
      <div ref={scrollContainerRef} className="flex-1 w-full lg:h-full flex flex-col overflow-y-auto scrollbar-none relative bg-cinematic-bg pb-16 lg:pb-0">
        {/* Minimal top nav */}
        <nav
          className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-8 py-3 bg-cinematic-bg/80 backdrop-blur-md shrink-0"
          aria-label="Story navigation"
        >
          <Link
            href="/stories"
            className="flex items-center gap-2 text-muted-foreground/60 hover:text-brand-ember transition-colors group"
            aria-label="Back to manuscripts archive"
          >
            <ArrowLeft className="size-3.5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-nano font-mono uppercase tracking-widest">
              Archive
            </span>
          </Link>

          {/* Chapter indicator (mobile only, since desktop has it on the left) */}
          <div className="lg:hidden">
            {activeChapter && (
              <span className="text-nano font-mono uppercase tracking-widest text-muted-foreground/40">
                {String(activeChapterIndex + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:block">
              <AnimatedThemeToggler />
            </div>
            {currentSceneId && firstSceneId && currentSceneId !== firstSceneId ? (
              <button
                onClick={() => {
                  if (window.confirm("Restart this story? Your current progress will be lost.")) {
                    if (firstSceneId) setCurrentSceneId(firstSceneId);
                    scrollContentToTop();
                  }
                }}
                className="text-nano font-mono uppercase tracking-widest text-muted-foreground/40 hover:text-brand-ember transition-colors"
                aria-label="Restart story"
              >
                Restart
              </button>
            ) : (
              <div className="w-12" aria-hidden />
            )}
          </div>
        </nav>

        {/* Content Body */}
        <div className="flex-1 max-w-2xl mx-auto w-full px-5 sm:px-6 md:px-12 pt-16 sm:pt-20 md:pt-28 lg:pt-36 pb-20 lg:pb-24">
          
          {/* Chapter Audio Player */}
          {activeChapter?.audio_url && (
            <div className="mb-10 lg:mb-14 border border-cinematic-border/20 bg-cinematic-panel/30 p-4 lg:p-5 rounded-none backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <Music className="size-3.5 text-brand-ember" />
                <span className="font-mono text-nano uppercase tracking-widest text-brand-ember/90">Chapter Audio</span>
              </div>
              <audio 
                controls 
                className="w-full h-10 rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ember/50" 
                src={activeChapter.audio_url} 
                preload="metadata"
              />
            </div>
          )}
          {hasContent ? (
            <>
              {/* TipTap rich content */}
              {activeScene?.tiptap_content ? (
                renderTipTapNode(activeScene.tiptap_content as TipTapNode, 0)
              ) : chapterFallbackContent ? (
                renderTipTapNode(chapterFallbackContent as TipTapNode, 0)
              ) : (
                /* Plain text fallback */
                <div className="whitespace-pre-wrap font-sans text-base leading-[1.9] text-cinematic-text">
                  {activeScene?.content}
                </div>
              )}

              {/* Choices */}
              {activeScene?.choices && activeScene.choices.length > 0 && (
                <div className="mt-12">
                  <ChoiceButtons
                    choices={activeScene.choices}
                    onChoose={setCurrentSceneId}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
              <BrandLogo variant="icon" size="lg" className="text-muted-foreground/20" />
              <div className="space-y-2">
                <p className="font-heading text-xl text-muted-foreground">
                  No content yet
                </p>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60">
                  This story is being crafted
                </p>
              </div>
            </div>
          )}

          {/* ── Continue Reading / The End ─────────────────────────────────── */}
          {isDeadEnd && hasContent && (
            <div className="mt-16 md:mt-24">
              {/* NOT the last chapter → Continue to next chapter */}
              {(hasNextScene || hasNextChapter) ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-6 border-t border-cinematic-border/10">
                  <div className="flex items-center gap-3" aria-hidden>
                    <div className="w-12 h-px bg-brand-ember/20" />
                    <div className="size-1.5 bg-brand-ember/40" />
                    <div className="w-12 h-px bg-brand-ember/20" />
                  </div>

                  {nextChapter && !hasNextScene && (
                    <div className="space-y-2">
                      <p className="font-mono text-nano uppercase tracking-eyebrow text-muted-foreground/50">
                        Next — Chapter {String(activeChapterIndex + 2).padStart(2, "0")}
                      </p>
                      <p className="font-heading text-lg md:text-xl font-bold uppercase tracking-tight text-cinematic-text/80 max-w-sm mx-auto">
                        {nextChapter.title}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={goToNext}
                    className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 sm:py-3 mt-2 border border-brand-ember/30 hover:border-brand-ember text-sm font-mono uppercase tracking-widest text-brand-ember/70 hover:text-brand-ember hover:bg-brand-ember/5 transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    aria-label={hasNextScene ? "Continue reading" : `Continue to chapter ${activeChapterIndex + 2}`}
                  >
                    Continue Reading
                    <ChevronDown className="size-4 group-hover:translate-y-0.5 transition-transform" />
                  </button>
                </div>
              ) : (
                /* LAST chapter, LAST scene → The End */
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-8 relative z-10 border-t border-cinematic-border/10">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
                    <div className="w-64 h-64 bg-brand-ember/5 blur-[80px] rounded-full" />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 blur-xl bg-brand-ember/20 rounded-full scale-150" />
                    <Flame className="relative size-8 text-brand-ember" aria-hidden="true" />
                  </div>

                  <div className="space-y-3 relative">
                    <p className="font-display text-3xl font-black uppercase tracking-widest text-cinematic-text">
                      The End
                    </p>
                    {story.moral && (
                      <p className="font-sans text-sm italic text-cinematic-text/60 max-w-sm mx-auto leading-relaxed mt-4">
                        &ldquo;{story.moral}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 relative">
                    <button
                      onClick={() => {
                        if (firstSceneId) setCurrentSceneId(firstSceneId);
                        scrollContentToTop();
                      }}
                      className="text-fine font-mono uppercase tracking-widest text-muted-foreground hover:text-brand-ember border border-border/30 hover:border-brand-ember px-5 py-2.5 transition-colors"
                    >
                      Read Again
                    </button>
                    <Link
                      href="/stories"
                      className="text-fine font-mono uppercase tracking-widest text-muted-foreground hover:text-brand-ember transition-colors px-5 py-2.5"
                    >
                      Archive
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export { BlockStoryReader };
