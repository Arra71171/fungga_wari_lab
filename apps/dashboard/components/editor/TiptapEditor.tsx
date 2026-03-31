"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { DialogueExtension } from "./extensions/dialogue";
import Image from "@tiptap/extension-image";
import { Button } from "@workspace/ui/components/button";
import { Bold, Italic, MessageCircle, Save } from "lucide-react";
import { ImageUploadWidget } from "./ImageUpload";

interface TiptapEditorProps {
  initialContent?: string | any;
  onSave?: (json: any) => void;
  isSaving?: boolean;
}

export function TiptapEditor({ initialContent, onSave, isSaving }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      DialogueExtension,
      Image,
    ],
    content: initialContent || "<p>Start writing your scene here...</p>",
  });

  if (!editor) {
    return null;
  }

  const handleSave = () => {
    if (onSave) {
      // We pass the JSON structure so we can process it into blocks for Convex
      onSave(editor.getJSON());
    }
  };

  const addDialogue = () => {
    const characterName = prompt("Character Name:", "Elder");
    if (!characterName) return;
    
        const quote = prompt("What do they say?", "Long ago...");
    if (!quote) return;
    
    editor.chain().focus().setDialogue({
      character: characterName,
      avatarUrl: "/avatars/default.png",
      quote: quote,
    }).run();
  };

  const handleImageUploaded = (url: string) => {
    editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="flex flex-col border rounded-none focus-within:ring-2 focus-within:ring-primary/20 bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-border bg-muted/40 p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-secondary text-primary" : ""}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-secondary text-primary" : ""}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-2" />
        <Button
          variant="ghost"
          size="sm"
          onClick={addDialogue}
          className="font-mono"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Dialogue
        </Button>
        <ImageUploadWidget onUploadSuccess={handleImageUploaded} />
        
        <div className="flex-1" />
        
        <Button
          variant="default"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="font-mono"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Scene"}
        </Button>
      </div>

      {/* Editor Content */}
      <div className="min-h-[400px] prose prose-sm md:prose-base dark:prose-invert max-w-none p-6 outline-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
