"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Flame } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { BrandLogo } from "@workspace/ui/components/BrandLogo";
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
        <p key={index} className="font-sans text-base leading-[1.9] text-cinematic-text mb-5">
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
        <Tag key={index} className={cn("text-foreground", sizeMap[level] ?? sizeMap[2])}>
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
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={index}
          src={src}
          alt={alt}
          className="w-full aspect-[3/4] object-cover my-8 border border-cinematic-border/20"
          loading="lazy"
        />
      );
    }

    case "codeBlock":
      return (
        <pre key={index} className="bg-black/40 border border-cinematic-border/20 rounded-none p-4 my-6 overflow-x-auto">
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
              <code key={i} className="font-mono text-sm bg-black/30 px-1 py-0.5 rounded-none text-brand-glow">
                {element}
              </code>
            );
            break;
          case "link": {
            const href = mark.attrs?.href as string | undefined;
            element = (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-ember underline underline-offset-2 hover:text-brand-glow transition-colors"
              >
                {element}
              </a>
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
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Choose your path
      </p>
      {choices.map((choice) => (
        <button
          key={choice.id}
          onClick={() => {
            onChoose(choice.next_scene_id);
            window.scrollTo({ top: 0, behavior: "smooth" });
            window.dispatchEvent(
              new CustomEvent("story:choice", { detail: { sceneId: choice.next_scene_id } })
            );
          }}
          className="w-full max-w-sm px-6 py-3 border border-border hover:border-brand-ember text-left text-sm font-sans text-cinematic-text hover:text-foreground hover:bg-brand-ember/5 transition-all rounded-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type BlockStoryReaderProps = { slug: string };

function BlockStoryReader({ slug: _slug }: BlockStoryReaderProps) {
  const { activeScene, chapters, story, currentSceneId, setCurrentSceneId } = useStoryReader();

  // Derive first scene ID for "restart" logic
  const firstSceneId = chapters[0]?.scenes[0]?.id ?? null;

  // Is this the last scene (no choices) → dead end
  const isDeadEnd =
    activeScene !== null &&
    (!activeScene.choices || activeScene.choices.length === 0);

  // ── Empty states ─────────────────────────────────────────────────────────
  if (!story) return null;

  // Derive the active chapter for fallback content
  const activeChapter = React.useMemo(() => {
    if (!currentSceneId) return chapters[0] ?? null;
    for (const ch of chapters) {
      if (ch.scenes.some((s) => s.id === currentSceneId)) return ch;
    }
    return null;
  }, [chapters, currentSceneId]);

  // Prefer scene content → fall back to chapter-level tiptap_content
  const sceneHasContent = activeScene && (activeScene.tiptap_content || activeScene.content);
  const chapterFallbackContent = !sceneHasContent && activeChapter?.tiptap_content ? activeChapter.tiptap_content : null;
  const hasContent = sceneHasContent || chapterFallbackContent;

  return (
    <main
      className="flex-1 h-full overflow-y-auto flex flex-col bg-cinematic-bg relative z-10 scrollbar-none"
      data-slot="block-story-reader"
    >
      {/* ── Top nav bar ────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-cinematic-bg/60 backdrop-blur-md border-b border-border/10 shrink-0"
        aria-label="Story navigation"
      >
        <Link
          href="/stories"
          className="flex items-center gap-2 text-muted-foreground hover:text-brand-ember transition-colors group"
          aria-label="Back to manuscripts archive"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-mono uppercase tracking-widest">
            Archive
          </span>
        </Link>

        <BrandLogo
          variant="icon"
          size="sm"
          className="text-muted-foreground/40 absolute left-1/2 -translate-x-1/2"
        />

        {currentSceneId && firstSceneId && currentSceneId !== firstSceneId ? (
          <button
            onClick={() => {
              if (window.confirm("Restart this story? Your current progress will be lost.")) {
                setCurrentSceneId(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-brand-ember transition-colors"
            aria-label="Restart story"
          >
            Restart
          </button>
        ) : (
          <div className="w-14" aria-hidden />
        )}
      </nav>

      {/* ── Scene content ─────────────────────────────────────────────── */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-16 md:py-20">
        {/* Scene title */}
        {activeScene?.title && (
          <p className="font-mono text-[10px] uppercase tracking-widest text-brand-ember/60 mb-8">
            {activeScene.title}
          </p>
        )}

        {hasContent ? (
          <>
            {/* TipTap rich content — scene-level first, chapter fallback second */}
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
              <ChoiceButtons
                choices={activeScene.choices}
                onChoose={setCurrentSceneId}
              />
            )}
          </>
        ) : (
          /* No content state */
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
      </div>

      {/* ── Dead-end / path conclusion screen ────────────────────────── */}
      {isDeadEnd && hasContent && (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-8 relative z-10 shrink-0">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-brand-ember/20 rounded-full scale-150" />
            <Flame className="relative size-12 text-brand-ember" aria-hidden="true" />
          </div>
          <div className="space-y-3">
            <p className="font-heading text-2xl font-black uppercase tracking-widest text-foreground">
              End of Path
            </p>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground max-w-xs">
              This thread of the tale has reached its conclusion
            </p>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setCurrentSceneId(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-brand-ember border border-border hover:border-brand-ember px-4 py-2 transition-colors"
              aria-label="Restart story from beginning"
            >
              Begin Anew
            </button>
            <Link
              href="/stories"
              className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-brand-ember transition-colors"
            >
              Return to Archive
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

export { BlockStoryReader };
