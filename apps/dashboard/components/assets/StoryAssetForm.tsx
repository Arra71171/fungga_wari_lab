"use client";

import * as React from "react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { toast } from "sonner";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Loader2, Plus, Trash2, UploadCloud, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { createStory } from "@/actions/storyActions";
import { createChapter, updateChapter, updateSceneContent } from "@/actions/chapterActions";
import { createAsset } from "@/actions/assetActions";
import { getCloudinarySignature } from "@/actions/cloudinaryActions";
import type { Database } from "@workspace/ui/types/supabase";
import { BrutalistCard } from "@workspace/ui/components/BrutalistCard";

type StoryCategory = Database["public"]["Enums"]["story_category"];

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

async function uploadToCloudinary(
  file: File
): Promise<{ url: string; publicId: string } | undefined> {
  if (!CLOUDINARY_CLOUD_NAME) return undefined;

  const { timestamp, signature, apiKey, folder } = await getCloudinarySignature();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error("Cloudinary upload failed");
  const data = (await res.json()) as { secure_url: string; public_id: string };
  return { url: data.secure_url, publicId: data.public_id };
}

type ChapterInput = {
  id: string;
  title: string;
  text: string;
  file: File | null;
};

const STORY_CATEGORIES: { value: StoryCategory; label: string }[] = [
  { value: "legend", label: "Folk Tale / Legend" },
  { value: "creation_myth", label: "Creation Myth" },
  { value: "historical", label: "Historical" },
  { value: "animal_fable", label: "Animal Fable" },
  { value: "moral_tale", label: "Moral Tale" },
  { value: "adventure", label: "Adventure" },
  { value: "supernatural", label: "Supernatural" },
  { value: "other", label: "Other" },
];

const STORY_LANGUAGES = [
  { value: "meiteilon", label: "Meiteilon (Manipuri)" },
  { value: "english", label: "English" },
  { value: "bilingual", label: "Bilingual" },
];

function ChapterIllustrationPreview({
  file,
}: {
  file: File;
}) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (!previewUrl) {
    return null;
  }

  return (
    <Image
      src={previewUrl}
      alt="Chapter illustration preview"
      fill
      sizes="(max-width: 1024px) 100vw, 320px"
      className="absolute inset-0 h-full w-full object-cover opacity-60 transition-opacity group-hover/upload:opacity-40"
      unoptimized
    />
  );
}

export function StoryAssetForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<StoryCategory>("legend");
  const [language, setLanguage] = useState("meiteilon");
  const [chapters, setChapters] = useState<ChapterInput[]>([
    { id: crypto.randomUUID(), title: "", text: "", file: null },
  ]);

  const addChapter = () => {
    setChapters((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: "", text: "", file: null },
    ]);
  };

  const removeChapter = (id: string) => {
    if (chapters.length === 1) return;
    setChapters((prev) => prev.filter((c) => c.id !== id));
  };

  const updateLocalChapter = (
    id: string,
    field: keyof ChapterInput,
    value: string | File | null
  ) => {
    setChapters((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Validation Failed", {
        description: "Story title is required.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Create the story
      const storyId = await createStory({
        title,
        description: description || undefined,
        category,
        language,
        tags: [],
      });

      // 2. Create chapters sequentially with illustrations
      for (let i = 0; i < chapters.length; i++) {
        const ch = chapters[i]!;

        const { chapterId, sceneId } = await createChapter({
          storyId,
          title: ch.title || `Chapter ${i + 1}`,
          order: i + 1,
        });

        // 3. Upload illustration to Cloudinary and register asset
        let illustrationUrl: string | undefined;
        if (ch.file) {
          const uploaded = await uploadToCloudinary(ch.file);
          if (uploaded) {
            illustrationUrl = uploaded.url;
            // Register in asset library
            await createAsset({
              title: ch.file.name,
              url: uploaded.url,
              publicId: uploaded.publicId,
              type: "illustration",
              storyId,
            });
          }
        }

        // 4. Update chapter with content/illustration
        await updateChapter(chapterId, {
          content: ch.text || undefined,
          illustration_url: illustrationUrl ?? null,
        });
        await updateSceneContent(sceneId, {
          content: ch.text || undefined,
          title: ch.title || `Chapter ${i + 1}`,
        });
      }

      toast.success("Story Bundle Created", {
        description: `"${title}" has been added to the archive.`,
      });

      router.push(`/stories`);
    } catch (error) {
      console.error(error);
      toast.error("Upload Failed", {
        description: "Failed to create the story bundle.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BrutalistCard variant="panel" padding="none">
      <form
        onSubmit={handleSubmit}
        className="p-6 md:p-8 space-y-8 relative"
      >
      <div>
        <h2 className="text-xl font-heading text-brand-ochre uppercase font-light tracking-wide mb-1">
          Story Bundle
        </h2>
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          Upload manuscript and per-chapter illustrations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="font-mono text-fine uppercase text-muted-foreground tracking-widest">
            Story Title *
          </Label>
          <Input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-bg-base border-border rounded-none h-12"
            placeholder="e.g. Khamba Thoibi"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="font-mono text-fine uppercase text-muted-foreground tracking-widest">
              Category
            </Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as StoryCategory)}
            >
              <SelectTrigger className="bg-bg-base border-border rounded-none h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-bg-panel border-border rounded-none">
                {STORY_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="font-mono text-fine uppercase text-muted-foreground tracking-widest">
              Language
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-bg-base border-border rounded-none h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-bg-panel border-border rounded-none">
                {STORY_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="font-mono text-fine uppercase text-muted-foreground tracking-widest">
          Brief Description / Synopsis
        </Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-bg-base border-border rounded-none resize-none h-24"
          placeholder="What is this story about?"
        />
      </div>

      <div className="space-y-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-sm text-foreground uppercase tracking-wider">
            Chapters
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addChapter}
            className="rounded-none border-border hover:bg-bg-overlay font-mono text-xs uppercase tracking-widest h-8"
          >
            <Plus className="size-3 mr-2" /> Add Chapter
          </Button>
        </div>

        {chapters.map((chapter, index) => (
          <div
            key={chapter.id}
            className="relative border border-border bg-bg-panel p-5 group transition-colors hover:border-brand-ember/30"
          >
            {chapters.length > 1 && (
              <button
                type="button"
                onClick={() => removeChapter(chapter.id)}
                aria-label={`Remove chapter ${index + 1}`}
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="size-4" />
              </button>
            )}

            <div className="font-mono text-fine text-brand-ochre uppercase tracking-label mb-4">
              Chapter {index + 1}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="space-y-2">
                  <Label className="font-mono text-fine uppercase text-muted-foreground tracking-widest">
                    Chapter Title
                  </Label>
                  <Input
                    value={chapter.title}
                    onChange={(e) =>
                      updateLocalChapter(chapter.id, "title", e.target.value)
                    }
                    className="bg-bg-base border-border rounded-none h-10"
                    placeholder={`Chapter ${index + 1}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-fine uppercase text-muted-foreground tracking-widest">
                    Manuscript Text
                  </Label>
                  <Textarea
                    value={chapter.text}
                    onChange={(e) =>
                      updateLocalChapter(chapter.id, "text", e.target.value)
                    }
                    className="bg-bg-base border-border rounded-none resize-none h-40 font-serif leading-relaxed text-sm p-4"
                    placeholder="Paste chapter text here..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-fine uppercase text-muted-foreground tracking-widest">
                  Illustration
                </Label>
                <label className="relative flex w-full aspect-[3/4] min-h-56 flex-col items-center justify-center overflow-hidden border border-dashed border-border bg-bg-base transition-colors hover:border-brand-ember/50 hover:bg-bg-overlay/80 cursor-pointer group/upload">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 w-full h-full">
                    {chapter.file ? (
                      <div className="flex flex-col items-center justify-center h-full w-full">
                        <div className="flex-1 w-full relative mb-3 overflow-hidden border border-border">
                          <ChapterIllustrationPreview file={chapter.file} />
                        </div>
                        <p className="max-w-48 truncate bg-bg-base/80 px-2 text-xs font-mono text-brand-ochre">
                          {chapter.file.name}
                        </p>
                        <p className="text-nano font-mono text-muted-foreground mt-1 uppercase tracking-widest">
                          Click to change
                        </p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="size-8 text-muted-foreground mb-3 group-hover/upload:text-brand-ember transition-colors" />
                        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1 group-hover/upload:text-foreground">
                          Upload Image
                        </p>
                        <p className="text-fine text-muted-foreground/60">
                          JPG, PNG, WEBP
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        updateLocalChapter(chapter.id, "file", e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-border flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-none font-mono tracking-widest uppercase bg-brand-ember hover:bg-brand-ember/90 text-primary-foreground h-12 px-8 min-w-[200px] shadow-brutal hover:translate-y-0.5 hover:shadow-none transition-all"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin mr-2" />
          ) : (
            <BookOpen className="size-4 mr-2" />
          )}
          {isSubmitting ? "Uploading Bundle..." : "Create Story Bundle"}
        </Button>
      </div>

      {isSubmitting && (
        <div className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center border border-brand-ember/20">
          <Loader2 className="size-12 text-brand-ember animate-spin mb-4" />
          <p className="font-mono text-sm tracking-widest text-brand-ochre uppercase animate-pulse">
            Processing Story Bundle Data...
          </p>
        </div>
      )}
    </form>
    </BrutalistCard>
  );
}
