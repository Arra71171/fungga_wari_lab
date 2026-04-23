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
  ImageIcon,
  Music,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { CoverImageUpload } from "@/components/cover-image-upload";
import { ChapterAudioUpload } from "@/components/chapter-audio-upload";
import { useSortable } from "@dnd-kit/sortable";
import dynamic from "next/dynamic";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

const RichTextEditor = dynamic(
  () =>
    import("@workspace/ui/components/editor/rich-text-editor").then(
      (mod) => mod.RichTextEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full bg-bg-surface border border-border p-4 text-muted-foreground font-mono text-xs flex items-center justify-center min-h-[400px]">
        Loading Editor…
      </div>
    ),
  }
);
import { createAsset } from "@/actions/assetActions";
import { getCloudinarySignature } from "@/actions/cloudinaryActions";
import type { ChoiceLocal, ChapterLocal } from "../page";

interface ChapterBuilderCardProps {
  id: string;
  order: number;
  title: string;
  content: string;
  illustrationUrl?: string;
  audioUrl?: string;
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
  audioUrl,
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
  const [showIllustration, setShowIllustration] = React.useState(
    !!illustrationUrl
  );
  const [showAudio, setShowAudio] = React.useState(
    !!audioUrl
  );
  const [showChoices, setShowChoices] = React.useState(choices.length > 0);

  const handleImageUpload = async (
    file: File
  ): Promise<string | undefined> => {
    try {
      const CLOUDINARY_CLOUD_NAME =
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      if (!CLOUDINARY_CLOUD_NAME) {
        throw new Error("Missing Cloudinary configuration");
      }

      const { timestamp, signature, apiKey, folder } = await getCloudinarySignature();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

      const result = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!result.ok) {
        const errorData = (await result.json()) as {
          error?: { message?: string };
        };
        throw new Error(
          errorData.error?.message || "Failed to upload image to Cloudinary"
        );
      }

      const uploadResponse = (await result.json()) as {
        secure_url: string;
        public_id: string;
      };

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
    <div
      data-slot="chapter-builder-card"
      className="border-2 border-border-strong bg-bg-surface shadow-brutal-sm transition-colors hover:border-brand-ember/50"
    >
      {/* ── Chapter Header (always visible) ─────────────────── */}
      <div
        className={cn(
          "flex items-center gap-3 px-5 py-4 cursor-pointer select-none",
          isExpanded ? "border-b-2 border-border-strong bg-bg-panel" : ""
        )}
        onClick={() => onToggleExpand(id)}
      >
        <div className="text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-grab active:cursor-grabbing shrink-0">
          <GripVertical className="size-4" />
        </div>

        <span className="font-mono text-fine uppercase tracking-eyebrow text-brand-ember font-bold shrink-0">
          Ch {String(order).padStart(2, "0")}
        </span>

        <span className="font-heading font-medium text-foreground truncate flex-1 text-sm">
          {title || "Untitled Chapter"}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            aria-label="Delete chapter"
          >
            <Trash2 className="size-3.5" />
          </Button>
          <div className="text-muted-foreground">
            {isExpanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </div>
        </div>
      </div>

      {/* ── Expanded Blog-Post Body ───────────────────────────── */}
      {isExpanded && (
        <div className="px-6 py-8 space-y-8">
          {/* Chapter Title */}
          <div className="space-y-2">
            <Label className="text-fine font-mono uppercase tracking-label text-muted-foreground">
              Chapter Title
            </Label>
            <Input
              value={title}
              onChange={(e) => onUpdate(id, "title", e.target.value)}
              placeholder="e.g. The Discovery of the Bamboo Grove"
              className="font-heading text-xl h-12 bg-transparent border-x-0 border-t-0 border-b-2 border-border-strong rounded-none px-0 focus-visible:ring-0 focus-visible:border-brand-ember/50 placeholder:text-muted-foreground/30 text-foreground"
            />
          </div>

          {/* Optional Illustration — collapsed by default unless one exists */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowIllustration((v) => !v)}
              className="flex items-center gap-2 text-fine font-mono uppercase tracking-label text-muted-foreground hover:text-brand-ember transition-colors"
            >
              <ImageIcon className="size-3" />
              <span>Chapter Illustration</span>
              <span className="text-muted-foreground/40">
                {showIllustration ? "▴ hide" : "▾ add"}
              </span>
            </button>

            {showIllustration && (
              <div className="flex justify-center">
                <div className="w-48 space-y-2">
                  <div className="border-2 border-border-strong bg-bg-panel h-full min-h-[200px]">
                    <CoverImageUpload
                      value={illustrationUrl}
                      onChange={(url) => onUpdate(id, "illustrationUrl", url)}
                      className="w-full h-full aspect-[3/4]"
                    />
                  </div>
                  <p className="text-fine text-muted-foreground font-mono text-center leading-relaxed">
                    Portrait format · 3∶4 ratio required
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Optional Audio — collapsed by default unless one exists */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowAudio((v) => !v)}
              className="flex items-center gap-2 text-fine font-mono uppercase tracking-label text-muted-foreground hover:text-brand-ember transition-colors"
            >
              <Music className="size-3" />
              <span>Chapter Audio / Narration</span>
              <span className="text-muted-foreground/40">
                {showAudio ? "▴ hide" : "▾ add"}
              </span>
            </button>

            {showAudio && (
              <div className="space-y-2 max-w-xl">
                <Label className="text-fine text-muted-foreground font-mono">Audio URL</Label>
                <ChapterAudioUpload
                  value={audioUrl}
                  onChange={(url) => onUpdate(id, "audioUrl", url)}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Story Content — the main blog-post editor */}
          <div className="space-y-3">
            <Label className="text-fine font-mono uppercase tracking-label text-brand-ember font-bold">
              Story Content
            </Label>
            <div className="text-tight-label text-muted-foreground font-mono bg-bg-surface px-4 py-2 border-l-2 border-brand-ember/40 leading-relaxed">
              Write the narrative for this chapter. Use bold, italics, and
              headings to shape the reading experience.
            </div>
            <RichTextEditor
              value={tiptapContent}
              onChange={(updatedContent) =>
                onUpdateTiptap(
                  id,
                  updatedContent as Record<string, unknown>
                )
              }
              onImageUpload={handleImageUpload}
              className="w-full bg-bg-panel border-2 border-border-strong rounded-none min-h-[480px]"
            />

            {/* Plain-text fallback — collapsed dev tool */}
            <details>
              <summary className="text-fine uppercase tracking-widest font-mono text-muted-foreground/40 cursor-pointer hover:text-muted-foreground mt-4">
                Plain-text fallback (dev)
              </summary>
              <Textarea
                value={content}
                onChange={(e) => onUpdate(id, "content", e.target.value)}
                placeholder="Raw text representation…"
                className="mt-2 min-h-[80px] resize-y bg-bg-panel border-2 border-border-strong rounded-none focus-visible:ring-1 focus-visible:ring-brand-ember/50 font-mono text-xs p-3 text-muted-foreground"
              />
            </details>
          </div>

          {/* Branching Choices — collapsed by default */}
          <div className="border-t-2 border-border-strong pt-6 space-y-4">
            <button
              type="button"
              onClick={() => setShowChoices((v) => !v)}
              className="flex items-center gap-2 text-fine font-mono uppercase tracking-label text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              <SplitSquareHorizontal className="size-3 text-brand-ember" />
              <span>Branching Choices</span>
              {choices.length > 0 && (
                <span className="ml-1 text-brand-ember font-bold">
                  ({choices.length})
                </span>
              )}
              <span className="ml-auto text-muted-foreground/40">
                {showChoices ? "▴ hide" : "▾ show"}
              </span>
            </button>

            {showChoices && (
              <div className="space-y-4 pl-2">
                {choices.length === 0 ? (
                  <p className="text-tight-label text-muted-foreground font-mono">
                    No branches yet. The story will progress linearly to the
                    next chapter.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {choices.map((choice) => (
                      <div
                        key={choice.id}
                        className="flex items-start gap-3 bg-bg-surface p-3 border-2 border-border-strong border-l-4 border-l-brand-ember/50"
                      >
                        <div className="space-y-2 flex-1">
                          <Label className="text-nano font-mono uppercase text-muted-foreground">
                            Choice Text
                          </Label>
                          <Input
                            value={choice.label}
                            onChange={(e) =>
                              onUpdateChoice &&
                              onUpdateChoice(choice.id, "label", e.target.value)
                            }
                            placeholder="e.g. Enter the dark forest"
                            className="h-8 text-xs bg-bg-panel border-2 border-border-strong rounded-none focus-visible:ring-1 focus-visible:ring-brand-ember/50"
                          />
                        </div>
                        <div className="space-y-2 flex-1">
                          <Label className="text-nano font-mono uppercase text-muted-foreground">
                            Next Chapter
                          </Label>
                          <Select
                            value={choice.nextChapterId}
                            onValueChange={(value) =>
                              onUpdateChoice &&
                              onUpdateChoice(
                                choice.id,
                                "nextChapterId",
                                value
                              )
                            }
                          >
                            <SelectTrigger className="flex h-8 w-full border-2 border-border-strong bg-bg-panel px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-ember/50 text-foreground rounded-none">
                              <SelectValue placeholder="Select chapter…" />
                            </SelectTrigger>
                            <SelectContent className="border-2 border-border-strong rounded-none shadow-brutal-sm bg-bg-surface">
                              {allChapters
                                .filter((c) => c.id !== id)
                                .map((target) => (
                                  <SelectItem key={target.id} value={target.id} className="font-mono text-xs focus:bg-primary focus:text-primary-foreground rounded-none cursor-pointer">
                                    Ch {target.order}:{" "}
                                    {target.title || "Untitled"}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            onDeleteChoice && onDeleteChoice(choice.id)
                          }
                          className="mt-6 text-muted-foreground hover:text-destructive size-7"
                          aria-label="Remove choice"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddChoice}
                  className="rounded-none border-2 border-border-strong bg-bg-surface h-8 text-fine uppercase font-mono tracking-wider hover:border-brand-ember hover:bg-brand-ember/10"
                >
                  <Plus className="size-3 mr-1" /> Add Choice
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
