"use client";

import * as React from "react";
import Image from "next/image";
import { AlignJustify } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

// ─── Tiptap JSON Types ────────────────────────────────────────────────────────

type TiptapMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

type TiptapNode = {
  type: string;
  text?: string;
  content?: TiptapNode[];
  attrs?: Record<string, unknown>;
  marks?: TiptapMark[];
};

type TiptapDoc = {
  type: "doc";
  content?: TiptapNode[];
};

type Scene = {
  _id: string;
  title?: string;
  tiptapContent?: TiptapDoc;
  illustrationUrl?: string;
};

// ─── Tiptap Block Renderer ────────────────────────────────────────────────────

function renderMark(text: string, marks: TiptapMark[]): React.ReactNode {
  let node: React.ReactNode = text;
  for (const mark of marks) {
    if (mark.type === "bold") node = <strong>{node}</strong>;
    else if (mark.type === "italic") node = <em>{node}</em>;
    else if (mark.type === "strike") node = <s>{node}</s>;
    else if (mark.type === "code") node = <code className="font-mono bg-secondary px-1 py-0.5 text-primary text-sm">{node}</code>;
  }
  return node;
}

function TiptapInline({ node }: { node: TiptapNode }): React.ReactNode {
  if (node.type === "text") {
    const text = node.text ?? "";
    if (node.marks && node.marks.length > 0) {
      return renderMark(text, node.marks);
    }
    return text;
  }
  if (node.type === "hardBreak") return <br />;
  return null;
}

function TiptapBlock({ node, index }: { node: TiptapNode; index: number }): React.ReactElement | null {
  const key = index;
  const inlineChildren = node.content?.map((child, i) => (
    <React.Fragment key={i}>
      <TiptapInline node={child} />
    </React.Fragment>
  ));

  switch (node.type) {
    case "paragraph":
      return (
        <p key={key} className="text-cinematic-text text-lg md:text-xl leading-relaxed tracking-wide font-heading">
          {inlineChildren ?? null}
        </p>
      );

    case "heading": {
      const level = (node.attrs?.level as number) ?? 2;
      if (level <= 2) {
        return (
          <h2 key={key} className="font-heading text-2xl md:text-3xl font-black uppercase tracking-tight text-cinematic-accent mt-6 mb-2">
            {inlineChildren}
          </h2>
        );
      }
      return (
        <h3 key={key} className="font-heading text-xl font-bold uppercase tracking-tight text-cinematic-text mt-4 mb-1">
          {inlineChildren}
        </h3>
      );
    }

    case "blockquote":
      return (
        <blockquote
          key={key}
          className="border-l-4 border-cinematic-accent pl-5 py-1 my-4 text-cinematic-text-dim italic text-lg font-heading leading-relaxed"
        >
          {node.content?.map((child, i) => (
            <TiptapBlock key={i} node={child} index={i} />
          ))}
        </blockquote>
      );

    case "bulletList":
      return (
        <ul key={key} className="list-none space-y-2 my-4">
          {node.content?.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-cinematic-text font-heading text-lg leading-relaxed">
              <span className="text-cinematic-accent mt-1.5">✦</span>
              <span>{item.content?.map((child, j) => <TiptapBlock key={j} node={child} index={j} />)}</span>
            </li>
          ))}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={key} className="list-none space-y-2 my-4 counter-reset-item">
          {node.content?.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-cinematic-text font-heading text-lg leading-relaxed">
              <span className="text-cinematic-accent font-mono text-sm w-5 text-right mt-1 shrink-0">{i + 1}.</span>
              <span>{item.content?.map((child, j) => <TiptapBlock key={j} node={child} index={j} />)}</span>
            </li>
          ))}
        </ol>
      );

    case "horizontalRule":
      return <p key={key} className="text-cinematic-text-dim text-center my-6 tracking-[0.5em]">✧ ✧ ✧</p>;

    case "listItem":
    case "doc":
      return (
        <React.Fragment key={key}>
          {node.content?.map((child, i) => <TiptapBlock key={i} node={child} index={i} />)}
        </React.Fragment>
      );

    default:
      return null;
  }
}

function TiptapRenderer({ doc }: { doc?: TiptapDoc }) {
  if (!doc || !doc.content || doc.content.length === 0) {
    return (
      <p className="text-cinematic-text-dim font-mono text-sm italic">
        — No content in this scene yet —
      </p>
    );
  }
  return (
    <div className="space-y-6">
      {doc.content.map((node, i) => (
        <TiptapBlock key={i} node={node} index={i} />
      ))}
    </div>
  );
}

// ─── StoryCanvas ──────────────────────────────────────────────────────────────

type StoryCanvasProps = {
  scene?: Scene | null;
};

export function StoryCanvas({ scene }: StoryCanvasProps) {
  return (
    <main className="flex-1 h-full overflow-y-auto relative hidden-scrollbar bg-cinematic-bg">

      {/* Top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-ember/5 blur-[120px] rounded-none pointer-events-none" />

      <div className="max-w-4xl mx-auto px-8 py-12 relative z-10 min-h-full flex flex-col">

        {/* Breadcrumb / Top Action */}
        <header className="flex items-start justify-between mb-8">
          <div className="text-cinematic-text-dim text-sm font-mono tracking-widest uppercase">
            {scene ? scene.title ?? "Untitled Scene" : "Select a Scene"}
          </div>
          <Button variant="ghost" size="icon" className="text-cinematic-text-dim hover:text-cinematic-text hover:bg-transparent transition-colors">
            <AlignJustify className="size-5" />
          </Button>
        </header>

        {!scene ? (
          /* Empty / no scene selected */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-32 text-center">
            <div className="size-16 border border-cinematic-border flex items-center justify-center">
              <AlignJustify className="size-7 text-cinematic-text-dim" />
            </div>
            <p className="font-mono text-cinematic-text-dim text-sm uppercase tracking-widest">
              Select a scene to begin reading.
            </p>
          </div>
        ) : (
          <>
            {/* Title */}
            <h1 className="font-heading text-4xl md:text-5xl font-medium text-cinematic-accent mb-8 tracking-tight drop-shadow-sm">
              {scene.title ?? "Untitled Scene"}
            </h1>

            {/* Illustration */}
            <div className="relative w-full aspect-video rounded-none overflow-hidden mb-10 border border-cinematic-border-heavy/50 shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-t from-cinematic-bg via-transparent to-transparent z-10" />
              {scene.illustrationUrl ? (
                <Image
                  src={scene.illustrationUrl}
                  alt={scene.title ?? "Scene illustration"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-cinematic-panel-hover flex items-center justify-center">
                  <div
                    className="absolute inset-0 opacity-40 mix-blend-overlay"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOCIgbnVtT2N0YXZlcz0iNCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==")`,
                    }}
                  />
                  <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-brand-ember/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-cinematic-bg to-transparent z-20" />
                  <div className="relative z-20 flex flex-col items-center">
                    <span className="font-mono text-cinematic-text-dim/50 text-sm tracking-widest uppercase">
                      Cinematic Asset Frame
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Story Content — renders real Tiptap JSON */}
            <div className="max-w-3xl">
              <TiptapRenderer doc={scene.tiptapContent} />
            </div>

            <div className="pb-32" />
          </>
        )}
      </div>
    </main>
  );
}
