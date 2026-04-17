"use client";

import * as React from "react";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import {
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  SplitSquareHorizontal,
  Plus,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { CoverImageUpload } from "@/components/cover-image-upload";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
  () => import("@workspace/ui/components/editor/rich-text-editor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="w-full bg-bg-surface border border-border p-4 text-muted-foreground font-mono text-xs flex items-center justify-center min-h-[400px]">
        Loading Editor Component...
      </div>
    ),
  }
);
import { createAsset } from "@/actions/assetActions";
import type { ChoiceLocal, ChapterLocal } from "../page";

interface ChapterBuilderCardProps {
  id: string;
  order: number;
  title: string;
  content: string;
  illustrationUrl?: string;
  tiptapContent?: Record<string, unknown>;
  choices?: ChoiceLocal[];
  allChapters?: ChapterLocal[];
  isExpanded?: boolean;
  onUpdate: (id: string, field: string, value: string) => void;
  onUpdateTiptap: (id: string, content: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onAddChoice?: () => void;
  onUpdateChoice?: (choiceId: string, field: string, value: string) => void;
  onDeleteChoice?: (choiceId: string) => void;
}

export function ChapterBuilderCard({
  id,
  order,
  title,
  content,
  tiptapContent,
  illustrationUrl,
  choices = [],
  allChapters = [],
  isExpanded = true,
  onUpdate,
  onUpdateTiptap,
  onDelete,
  onToggleExpand,
  onAddChoice,
  onUpdateChoice,
  onDeleteChoice,
}: ChapterBuilderCardProps) {
  const handleImageUpload = async (file: File): Promise<string | undefined> => {
    try {
      const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        throw new Error("Missing Cloudinary configuration");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

      const result = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!result.ok) {
        const errorData = await result.json() as { error?: { message?: string } };
        throw new Error(errorData.error?.message || "Failed to upload image to Cloudinary");
      }

      const uploadResponse = await result.json() as {
        secure_url: string;
        public_id: string;
      };

      // Register the asset in Supabase
      await createAsset({
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
        title: file.name,
        type: "illustration",
      });

      return uploadResponse.secure_url;
    } catch (err) {
      console.error("Editor image upload failed:", err);
      return undefined;
    }
  };

  return (
    <div className="border border-border bg-bg-panel group transition-colors hover:border-brand-ember/30">
      {/* Header (Always Visible) */}
      <div
        className={cn(
          "flex items-center gap-4 p-4 cursor-pointer",
          isExpanded ? "border-b border-border/50 bg-bg-surface" : ""
        )}
        onClick={() => onToggleExpand(id)}
      >
        <div className="text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing p-1">
          <GripVertical className="size-4" />
        </div>

        <div className="flex-1 flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-brand-ember font-bold">
            Chapter {order}
          </span>
          <span className="font-heading font-medium text-foreground truncate max-w-sm">
            {title || "Untitled Chapter"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isExpanded && illustrationUrl && (
            <div className="size-6 border border-border overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={illustrationUrl}
                alt="Thumbnail preview"
                className="w-full h-full object-cover grayscale opacity-50"
              />
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
          >
            <Trash2 className="size-4" />
          </Button>

          <Button variant="ghost" size="icon" className="text-muted-foreground">
            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Left: Illustration */}
          <div className="space-y-3">
            <Label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground flex justify-between">
              <span>Illustration</span>
              <span className="text-brand-ember/50">3:4</span>
            </Label>
            <CoverImageUpload
              value={illustrationUrl}
              onChange={(url) => onUpdate(id, "illustrationUrl", url)}
              className="w-full h-auto aspect-[3/4]"
            />
            <p className="text-[10px] text-muted-foreground font-mono leading-relaxed mt-2 text-center">
              Provide an authentic folk-art style illustration. Must be portrait format.
            </p>
          </div>

          {/* Right: Content Fields */}
          <div className="space-y-6 flex flex-col">
            <div className="space-y-2">
              <Label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Chapter Title
              </Label>
              <Input
                value={title}
                onChange={(e) => onUpdate(id, "title", e.target.value)}
                placeholder="e.g. The Discovery of the Bamboo Grove"
                className="font-heading text-lg h-12 bg-transparent"
              />
            </div>

            <div className="space-y-4 flex-1 flex flex-col pt-4">
              <Label className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-ember font-bold">
                Story Content
              </Label>
              <div className="text-xs text-muted-foreground font-mono bg-bg-surface p-3 border border-border border-l-4 border-l-primary/30">
                <span className="text-primary mr-2 font-bold">—</span>
                This acts as the canonical narrative core. Use headers, bold text, or italics to
                construct the chapter visually.
              </div>
              <RichTextEditor
                value={tiptapContent}
                onChange={(updatedContent) => onUpdateTiptap(id, updatedContent as Record<string, unknown>)}
                onImageUpload={handleImageUpload}
                className="w-full bg-bg-surface border-border p-4 text-foreground rounded-none min-h-[400px]"
              />
              {/* Developer plain-text fallback */}
              <div className="pt-8">
                <details className="group">
                  <summary className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground cursor-pointer hover:text-brand-ember mb-2">
                    Developer Excerpt Fallback (Plain Text)
                  </summary>
                  <Textarea
                    value={content}
                    onChange={(e) => onUpdate(id, "content", e.target.value)}
                    placeholder="Raw text representation (optional)..."
                    className="flex-1 min-h-[100px] resize-y bg-bg-panel font-mono text-xs p-3 text-muted-foreground opacity-50 focus:opacity-100 transition-opacity"
                  />
                </details>
              </div>
            </div>

            {/* Branching Choices Block */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <SplitSquareHorizontal className="size-3 text-brand-ember" />
                  Branching Choices
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddChoice}
                  className="rounded-none border-border h-7 text-[10px] uppercase font-mono tracking-wider hover:border-brand-ember"
                >
                  <Plus className="size-3 mr-1" /> Add Choice
                </Button>
              </div>

              {choices.length === 0 ? (
                <div className="text-[10px] text-muted-foreground font-mono">
                  No branches. Narrative will linearly progress to the next chapter.
                </div>
              ) : (
                <div className="space-y-3">
                  {choices.map((choice) => (
                    <div
                      key={choice.id}
                      className="flex items-start gap-3 bg-bg-surface p-3 border border-border border-l-2 border-l-brand-ember"
                    >
                      <div className="space-y-2 flex-1">
                        <Label className="text-[9px] font-mono uppercase text-muted-foreground">
                          Choice Text
                        </Label>
                        <Input
                          value={choice.label}
                          onChange={(e) =>
                            onUpdateChoice && onUpdateChoice(choice.id, "label", e.target.value)
                          }
                          placeholder="e.g. Enter the dark forest"
                          className="h-8 text-xs bg-bg-panel border-border"
                        />
                      </div>
                      <div className="space-y-2 flex-1">
                        <Label className="text-[9px] font-mono uppercase text-muted-foreground">
                          Target Destination
                        </Label>
                        <select
                          value={choice.nextChapterId}
                          onChange={(e) =>
                            onUpdateChoice &&
                            onUpdateChoice(choice.id, "nextChapterId", e.target.value)
                          }
                          className="flex h-8 w-full border border-border bg-bg-panel px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-ember/50 text-foreground"
                          aria-label="Target destination"
                        >
                          <option value="">Select Chapter...</option>
                          {allChapters
                            .filter((c) => c.id !== id)
                            .map((target) => (
                              <option key={target.id} value={target.id}>
                                Chapter {target.order}: {target.title || "Untitled"}
                              </option>
                            ))}
                        </select>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteChoice && onDeleteChoice(choice.id)}
                        className="mt-6 text-muted-foreground hover:text-destructive size-7"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
