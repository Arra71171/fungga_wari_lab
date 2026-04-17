"use client";

import React, { useRef } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import TiptapImage from "@tiptap/extension-image";
import { DialogueExtension } from "./extensions/dialogue";
import { ChoiceExtension, type SceneOption } from "./extensions/choice";
import { slashCommandConfig } from "./slash-command";
import { cn } from "@workspace/ui/lib/utils";
import type { JSONContent } from "@tiptap/core";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Quote,
  Image as ImageIcon,
  List,
  ListOrdered,
  Minus,
} from "lucide-react";

// â”€â”€â”€ Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface RichTextEditorProps {
  value?: JSONContent;
  onChange: (val: JSONContent) => void;
  className?: string;
  onImageUpload?: (file: File) => Promise<string | undefined>;
  /** Available scenes to populate the Choice extension dropdown. */
  scenes?: SceneOption[];
}

// â”€â”€â”€ Minimal Toolbar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ToolbarButton({
  onClick,
  isActive,
  label,
  children,
  disabled,
}: {
  onClick: () => void;
  isActive?: boolean;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // prevent editor losing focus
        onClick();
      }}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex items-center justify-center size-7 rounded-none transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed",
        isActive && "bg-primary/10 text-primary"
      )}
    >
      {children}
    </button>
  );
}

function EditorToolbar({
  editor,
  onImageUpload,
}: {
  editor: Editor;
  onImageUpload?: (file: File) => Promise<string | undefined>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;
    const url = await onImageUpload(file);
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-0.5 px-3 py-1.5 border border-border bg-background sticky top-0 z-10 flex-wrap">
      {/* Headings */}
      <ToolbarButton
        label="Heading 1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
      >
        <Heading1 className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
      >
        <Heading2 className="size-3.5" />
      </ToolbarButton>

      <div className="w-px h-4 bg-border mx-1" />

      {/* Inline marks */}
      <ToolbarButton
        label="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
      >
        <Bold className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
      >
        <Italic className="size-3.5" />
      </ToolbarButton>

      <div className="w-px h-4 bg-border mx-1" />

      {/* Lists */}
      <ToolbarButton
        label="Bullet list"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
      >
        <List className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Ordered list"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
      >
        <ListOrdered className="size-3.5" />
      </ToolbarButton>

      <div className="w-px h-4 bg-border mx-1" />

      {/* Blocks */}
      <ToolbarButton
        label="Blockquote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
      >
        <Quote className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Horizontal rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="size-3.5" />
      </ToolbarButton>

      {/* Image upload â€” only shown when the handler is wired */}
      {onImageUpload && (
        <>
          <div className="w-px h-4 bg-border mx-1" />
          <ToolbarButton
            label="Insert image"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="size-3.5" />
          </ToolbarButton>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            aria-label="Select image to upload"
            className="sr-only"
            onChange={handleFileChange}
          />
        </>
      )}

      <div className="ml-auto font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40 pr-1">
        Type &apos;/&apos; for slash commands
      </div>
    </div>
  );
}

// â”€â”€â”€ Main Editor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function RichTextEditor({ value, onChange, className, onImageUpload, scenes = [] }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: 'Type "/" for commands or start writing your narrative...',
        emptyEditorClass: "is-editor-empty",
      }),
      Highlight.configure({ HTMLAttributes: { class: "bg-primary/20 text-foreground" } }),
      Typography,
      TiptapImage.configure({ allowBase64: false }),
      DialogueExtension,
      ChoiceExtension.configure({ scenes }),
      slashCommandConfig,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-neutral dark:prose-invert max-w-none min-h-[500px] w-full p-8 outline-none bg-background text-foreground transition-shadow",
          // Zen Brutalist typography overrides
          "prose-headings:font-heading prose-headings:font-bold prose-headings:tracking-tight",
          "prose-h1:text-4xl prose-h1:mt-12",
          "prose-h2:text-2xl prose-h2:mt-10 prose-h2:text-primary",
          "prose-p:leading-relaxed prose-p:text-muted-foreground",
          "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground",
          "prose-ul:list-disc prose-ul:ml-6",
          "prose-ol:list-decimal prose-ol:ml-6",
          "prose-img:border prose-img:border-border",
          className
        ),
      },
      // Drag-and-drop image handling
      handleDrop(view, event) {
        const file = event.dataTransfer?.files?.[0];
        if (file && file.type.startsWith("image/") && onImageUpload) {
          event.preventDefault();
          onImageUpload(file).then((url) => {
            if (url) {
              const { schema } = view.state;
              const node = schema.nodes.image?.create({ src: url });
              if (node) {
                const tr = view.state.tr.replaceSelectionWith(node);
                view.dispatch(tr);
              }
            }
          });
          return true;
        }
        return false;
      },
      // Paste image handling
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items ?? []);
        const imageItem = items.find((item) => item.type.startsWith("image/"));
        if (imageItem && onImageUpload) {
          const file = imageItem.getAsFile();
          if (file) {
            event.preventDefault();
            onImageUpload(file).then((url) => {
              if (url) {
                const { schema } = view.state;
                const node = schema.nodes.image?.create({ src: url });
                if (node) {
                  const tr = view.state.tr.replaceSelectionWith(node);
                  view.dispatch(tr);
                }
              }
            });
            return true;
          }
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
    <div className="relative w-full max-w-4xl mx-auto flex flex-col border border-border focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 transition-shadow">
      <EditorToolbar editor={editor} onImageUpload={onImageUpload} />
      <EditorContent editor={editor} className="w-full" />
    </div>
  );
}
