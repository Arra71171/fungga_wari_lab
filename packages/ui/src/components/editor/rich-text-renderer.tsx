"use client";

import React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { motion } from "framer-motion";
import { DialogueBlock } from "@workspace/ui/components/DialogueBlock";

import { ChoiceBlock } from "@workspace/ui/components/story-blocks";

import { type JSONContent } from "@tiptap/core";

export type { JSONContent };

// --- Node Types ---

export function ParagraphNode({ children }: { children: React.ReactNode }) {
  return (
    <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">
      {children}
    </p>
  );
}

export function HeadingNode({ level, children }: { level: number; children: React.ReactNode }) {
  const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
  const classes = cn(
    "font-heading font-bold tracking-tight text-foreground",
    level === 1 && "text-4xl mt-12 mb-6",
    level === 2 && "text-2xl mt-10 mb-4 text-primary",
    level === 3 && "text-xl mt-8 mb-3"
  );
  return <Tag className={classes}>{children}</Tag>;
}

export function FolkQuoteNode({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="border-l-4 border-primary pl-6 py-2 my-6 bg-accent/20 italic text-muted-foreground shadow-brutal-sm">
      {children}
    </blockquote>
  );
}

export function ListNode({ children, ordered }: { children: React.ReactNode; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={cn("pl-6 space-y-2 my-4 text-muted-foreground", ordered ? "list-decimal" : "list-disc")}>
      {children}
    </Tag>
  );
}

export function ListItemNode({ children }: { children: React.ReactNode }) {
  return <li className="pl-2">{children}</li>;
}

// --- Semantic Parser ---

const renderMarks = (node: JSONContent, children: React.ReactNode) => {
  if (!node.marks || node.marks.length === 0) return children;

  return node.marks.reduce((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong className="font-semibold text-foreground">{acc}</strong>;
      case "italic":
        return <em className="italic">{acc}</em>;
      case "strike":
        return <s className="line-through">{acc}</s>;
      case "highlight": // the Tiptap Highlight extension
        return <mark className="bg-primary/20 text-foreground px-1 py-0.5 rounded-sm">{acc}</mark>;
      default:
        return acc;
    }
  }, children);
};

const renderNode = (node: JSONContent, index: number): React.ReactNode => {
  if (node.type === "text") {
    return renderMarks(node, <React.Fragment key={index}>{node.text}</React.Fragment>);
  }

  const children = node.content ? node.content.map((child, i) => renderNode(child, i)) : null;

  switch (node.type) {
    case "paragraph":
      return <ParagraphNode key={index}>{children || <br />}</ParagraphNode>;
    case "heading":
      return <HeadingNode key={index} level={node.attrs?.level || 2}>{children}</HeadingNode>;
    case "blockquote":
      return <FolkQuoteNode key={index}>{children}</FolkQuoteNode>;
    case "bulletList":
      return <ListNode key={index} ordered={false}>{children}</ListNode>;
    case "orderedList":
      return <ListNode key={index} ordered={true}>{children}</ListNode>;
    case "listItem":
      return <ListItemNode key={index}>{children}</ListItemNode>;
    case "dialogue":
      return (
        <DialogueBlock
          key={index}
          characterName={node.attrs?.character || "Unknown"}
          avatarUrl={node.attrs?.avatarUrl || "/avatars/default.png"}
          quote={node.attrs?.quote || "..."}
          align="left"
        />
      );
    case "choice":
      return (
        <ChoiceBlock
          key={index}
          options={[
            {
              label: node.attrs?.label || "Continue",
              nextSceneId: node.attrs?.nextSceneId,
            }
          ]}
          onChoose={(opt) => {
            if (opt.nextSceneId) {
              window.dispatchEvent(new CustomEvent('story:choice', { detail: { sceneId: opt.nextSceneId } }));
            }
          }}
        />
      );
    default:
      // Fallback for unknown nodes
      if (children) return <React.Fragment key={index}>{children}</React.Fragment>;
      return null;
  }
};

export function RichTextRenderer({ content }: { content: JSONContent | null }) {
  if (!content || !content.content) {
    return <div className="text-muted-foreground italic opacity-50">Empty scene.</div>;
  }

  return (
    <motion.div 
      className="w-full max-w-3xl mx-auto py-12 space-y-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.15,
          },
        },
      }}
    >
      {content.content.map((node, i) => (
        <motion.div 
          key={i}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
          }}
        >
          {renderNode(node, i)}
        </motion.div>
      ))}
    </motion.div>
  );
}
