"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Image from "@tiptap/extension-image";
import { DialogueExtension } from "./extensions/dialogue";
import { slashCommandConfig } from "./slash-command";
import { cn } from "@workspace/ui/lib/utils";
import type { JSONContent } from "@tiptap/core";

export interface RichTextEditorProps {
  value?: JSONContent;
  onChange: (val: JSONContent) => void;
  className?: string;
  onImageUpload?: (file: File) => Promise<string | undefined>;
}

export function RichTextEditor({ value, onChange, className, onImageUpload }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands or start writing your narrative...",
        emptyEditorClass: "is-editor-empty",
      }),
      Highlight.configure({ HTMLAttributes: { class: "bg-primary/20 text-foreground" } }),
      Typography,
      Image,
      DialogueExtension,
      slashCommandConfig,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-neutral dark:prose-invert max-w-none min-h-[500px] w-full p-8 border border-border shadow-brutal outline-none bg-background text-foreground focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 transition-shadow",
          // Zen Brutalist Layout Overrides
          "prose-headings:font-heading prose-headings:font-bold prose-headings:tracking-tight",
          "prose-h1:text-4xl prose-h1:mt-12",
          "prose-h2:text-2xl prose-h2:mt-10 prose-h2:text-primary",
          "prose-p:leading-relaxed prose-p:text-muted-foreground",
          "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground",
          "prose-ul:list-disc prose-ul:ml-6",
          "prose-ol:list-decimal prose-ol:ml-6",
          className
        ),
      },
      handleDrop(view, event) {
        const file = event.dataTransfer?.files?.[0];
        if (file && file.type.startsWith("image/") && onImageUpload) {
          event.preventDefault();
          onImageUpload(file).then((url) => {
            if (url) {
              const { schema } = view.state;
              const node = schema.nodes.image?.create({ src: url });
              if (node) {
                const transaction = view.state.tr.replaceSelectionWith(node);
                view.dispatch(transaction);
              }
            }
          });
          return true;
        }
        return false;
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getJSON());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col gap-4">
      {/* Optional Minimal Floating Toolbar could go here, but Slash Commands handle 90% of UX */}
      <EditorContent editor={editor} className="w-full" />
    </div>
  );
}
