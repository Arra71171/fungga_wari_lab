"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Plus, PenTool, Globe, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { cn } from "@workspace/ui/lib/utils";
import { CoverImageUpload } from "@/components/cover-image-upload";
import { ChapterBuilderCard } from "./_components/chapter-builder-card";
import { BrutalistCard } from "@workspace/ui/components/BrutalistCard";
import {
  getFullStoryById,
  updateStory,
  publishStory,
  unpublishStory,
} from "@/actions/storyActions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import {
  createChapter,
  createScene,
  updateChapter,
  updateSceneContent,
  deleteChapter,
  addChoice,
  deleteChoice,
} from "@/actions/chapterActions";

// ─── Constants ─────────────────────────────────────────────────────────────

const STORY_CATEGORIES = [
  { value: "creation_myth", label: "Creation Myth" },
  { value: "animal_fable", label: "Animal Fable" },
  { value: "historical", label: "Historical" },
  { value: "legend", label: "Legend" },
  { value: "moral_tale", label: "Moral Tale" },
  { value: "romance", label: "Romance" },
  { value: "adventure", label: "Adventure" },
  { value: "supernatural", label: "Supernatural" },
  { value: "other", label: "Other" },
] as const;

const STORY_LANGUAGES = [
  { value: "meiteilon", label: "Meiteilon (Manipuri)" },
  { value: "english", label: "English" },
  { value: "bilingual", label: "Bilingual" },
] as const;

// ─── Types ─────────────────────────────────────────────────────────────────

export type ChoiceLocal = {
  id: string;
  label: string;
  nextChapterId: string;
  nextSceneId?: string;
  isNew?: boolean;
};

export type ChapterLocal = {
  id: string;
  sceneId?: string;
  order: number;
  title: string;
  content: string;
  tiptapContent?: Record<string, unknown>;
  illustrationUrl?: string;
  audioUrl?: string;
  isNew?: boolean;
  choices: ChoiceLocal[];
};

// ─── Component ─────────────────────────────────────────────────────────────

export default function DraftEditorPage({
  params,
}: {
  params: Promise<{ storyId: string }>;
}) {
  const { storyId } = React.use(params);
  const router = useRouter();

  // -- Data --
  const [dbStory, setDbStory] = React.useState<Awaited<ReturnType<typeof getFullStoryById>>>(null);
  const [isReady, setIsReady] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);

  // Story fields
  const [title, setTitle] = React.useState("");
  const [coverImageUrl, setCoverImageUrl] = React.useState("");
  const [moral, setMoral] = React.useState("");
  const [attributedAuthor, setAttributedAuthor] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [language, setLanguage] = React.useState("meiteilon");

  // Chapters
  const [chapters, setChapters] = React.useState<ChapterLocal[]>([]);
  const [expandedChapterIds, setExpandedChapterIds] = React.useState<Set<string>>(new Set());
  const [pendingChapterDeletions, setPendingChapterDeletions] = React.useState<string[]>([]);
  const [pendingChoiceDeletions, setPendingChoiceDeletions] = React.useState<string[]>([]);
  const [titleError, setTitleError] = React.useState("");
  const [chapterToDelete, setChapterToDelete] = React.useState<string | null>(null);

  // -- Fetch story on mount --
  React.useEffect(() => {
    let cancelled = false;
    getFullStoryById(storyId).then((story) => {
      if (cancelled) return;
      if (!story) {
        toast.error("Manuscript not found or unauthorized");
        router.replace("/stories");
        return;
      }
      setDbStory(story);

      setTitle(story.title);
      setCoverImageUrl(story.cover_image_url || "");
      setMoral(story.moral || "");
      setAttributedAuthor(story.attributed_author || "");
      setDescription(story.description || "");
      setTags((story.tags || []).join(", "));
      setCategory(story.category || "other");
      setLanguage(story.language || "meiteilon");

      const mappedChapters: ChapterLocal[] = (story.chapters || []).map((c) => {
        const primaryScene = c.scenes && c.scenes.length > 0 ? c.scenes[0] : null;
        const sceneChoices = primaryScene?.choices ?? [];

        return {
          id: c.id,
          sceneId: primaryScene?.id,
          order: c.order,
          title: c.title,
          content: primaryScene?.content || c.content || "",
          tiptapContent: (primaryScene?.tiptap_content || c.tiptap_content) as Record<string, unknown> | undefined,
          illustrationUrl: c.illustration_url ?? undefined,
          audioUrl: c.audio_url ?? undefined,
          choices: sceneChoices.map((choice: { id: string; label: string; next_scene_id?: string }) => ({
            id: choice.id,
            label: choice.label,
            nextSceneId: choice.next_scene_id,
            nextChapterId:
              (story.chapters || []).find(
                (ch) => ch.scenes?.[0]?.id === choice.next_scene_id
              )?.id || "",
          })),
        };
      });

      setChapters(mappedChapters);
      if (mappedChapters.length > 0) {
        setExpandedChapterIds(new Set([mappedChapters[0]!.id]));
      }
      setIsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [storyId, router]);

  // -- Handlers --

  const handleAddChapter = () => {
    const newOrder = chapters.length + 1;
    const tempId = `temp-${crypto.randomUUID()}`;
    const newChapter: ChapterLocal = {
      id: tempId,
      order: newOrder,
      title: "",
      content: "",
      isNew: true,
      choices: [],
    };
    setChapters([...chapters, newChapter]);
    setExpandedChapterIds(new Set([tempId]));
  };

  const handleUpdateChapter = (id: string, field: string, value: string) => {
    setChapters(
      chapters.map((ch) => (ch.id === id ? { ...ch, [field]: value } : ch))
    );
  };

  const handleUpdateChapterTiptap = (id: string, content: Record<string, unknown>) => {
    setChapters(
      chapters.map((ch) => (ch.id === id ? { ...ch, tiptapContent: content } : ch))
    );
  };

  const handleDeleteChapterClick = (id: string) => {
    setChapterToDelete(id);
  };

  const handleConfirmDeleteChapter = () => {
    // Capture the ID immediately — Radix fires onOpenChange(false) synchronously
    // on the same tick as onClick, which can null chapterToDelete before we read it.
    const id = chapterToDelete;
    if (!id) return;

    const chapter = chapters.find((ch) => ch.id === id);
    if (!chapter) {
      setChapterToDelete(null);
      return;
    }

    // Optimistic UI — remove immediately from local state
    setChapters((prev) => {
      const filtered = prev.filter((ch) => ch.id !== id);
      return filtered.map((ch, i) => ({ ...ch, order: i + 1 }));
    });

    // Queue for DB deletion on next Save (only persisted chapters, not temp ones)
    if (!chapter.isNew && !id.startsWith("temp-")) {
      setPendingChapterDeletions((prev) => [...prev, id]);
    }

    setChapterToDelete(null);
  };

  const handleAddChoice = (chapterId: string) => {
    setChapters(
      chapters.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              choices: [
                ...ch.choices,
                {
                  id: `temp-choice-${crypto.randomUUID()}`,
                  label: "",
                  nextChapterId: "",
                  isNew: true,
                },
              ],
            }
          : ch
      )
    );
  };

  const handleUpdateChoice = (
    chapterId: string,
    choiceId: string,
    field: string,
    value: string
  ) => {
    setChapters(
      chapters.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              choices: ch.choices.map((c) =>
                c.id === choiceId ? { ...c, [field]: value } : c
              ),
            }
          : ch
      )
    );
  };

  const handleDeleteChoice = (chapterId: string, choiceId: string) => {
    if (!choiceId.startsWith("temp-choice-")) {
      setPendingChoiceDeletions((prev) => [...prev, choiceId]);
    }
    setChapters(
      chapters.map((ch) =>
        ch.id === chapterId
          ? { ...ch, choices: ch.choices.filter((c) => c.id !== choiceId) }
          : ch
      )
    );
  };

  const handleToggleExpand = (id: string) => {
    const next = new Set(expandedChapterIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedChapterIds(next);
  };

  /** Core save logic — persist metadata + chapters */
  const persistDraft = async () => {
    // 1. Update story metadata
    await updateStory(storyId, {
      title,
      cover_image_url: coverImageUrl || undefined,
      moral: moral || undefined,
      description: description || undefined,
      attributed_author: attributedAuthor || undefined,
      category: (category || undefined) as never,
      language: language || undefined,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    });

    // 2. Delete pending choices
    for (const choiceId of pendingChoiceDeletions) {
      if (!choiceId.startsWith("temp-")) {
        try {
          await deleteChoice(choiceId);
        } catch {
          // ignore
        }
      }
    }
    setPendingChoiceDeletions([]);

    // 3. Delete pending chapters
    for (const chapterId of pendingChapterDeletions) {
      if (!chapterId.startsWith("temp-")) {
        try {
          await deleteChapter(chapterId);
        } catch {
          // ignore
        }
      }
    }
    setPendingChapterDeletions([]);

    const updatedChapters = [...chapters];
    const chapterIdToSceneId: Record<string, string> = {};

    // 4. Upsert chapters
    for (let i = 0; i < updatedChapters.length; i++) {
      const ch = updatedChapters[i]!;

      if (ch.isNew) {
        const { chapterId: newChapterId, sceneId: newSceneId } = await createChapter({
          storyId,
          title: ch.title || `Chapter ${ch.order}`,
          order: ch.order,
        });

        // Update the new chapter with content
        await updateChapter(newChapterId, {
          title: ch.title || `Chapter ${ch.order}`,
          order: ch.order,
          illustration_url: ch.illustrationUrl ?? null,
          audio_url: ch.audioUrl ?? null,
        });

        await updateSceneContent(newSceneId, {
          tiptap_content: ch.tiptapContent,
          content: ch.content,
          title: ch.title || `Chapter ${ch.order}`,
        });

        chapterIdToSceneId[ch.id] = newSceneId;
        chapterIdToSceneId[newChapterId] = newSceneId;

        updatedChapters[i] = {
          ...ch,
          id: newChapterId,
          sceneId: newSceneId,
          isNew: false,
        };
      } else {
        // Save chapter metadata (title, order, illustration) to chapters table
        await updateChapter(ch.id, {
          title: ch.title,
          order: ch.order,
          illustration_url: ch.illustrationUrl ?? null,
          audio_url: ch.audioUrl ?? null,
        });

        let sceneId = ch.sceneId;
        if (!sceneId) {
          sceneId = await createScene({
            chapterId: ch.id,
            title: ch.title || `Chapter ${ch.order}`,
            order: 1,
          });

          updatedChapters[i] = {
            ...updatedChapters[i]!,
            sceneId,
          };
        }

        await updateSceneContent(sceneId, {
          tiptap_content: ch.tiptapContent,
          content: ch.content,
          title: ch.title || `Chapter ${ch.order}`,
        });
        chapterIdToSceneId[ch.id] = sceneId;
      }
    }

    // 5. Upsert choices
    for (let i = 0; i < updatedChapters.length; i++) {
      const ch = updatedChapters[i]!;
      const currentSceneId = ch.sceneId || chapterIdToSceneId[ch.id];
      if (!currentSceneId) continue;

      for (const choice of ch.choices) {
        const nextSceneId = chapterIdToSceneId[choice.nextChapterId];
        if (!nextSceneId) continue;

        if (choice.isNew) {
          await addChoice({
            sceneId: currentSceneId,
            label: choice.label,
            nextSceneId,
          });
        }
        // Existing choice updates would require updateChoice — add if needed
      }
    }

    setChapters(updatedChapters);
  };

  const handleSave = async () => {
    if (!isReady) return;
    setIsSaving(true);
    try {
      await persistDraft();
      toast.success("Manuscript Saved", {
        description: "The draft has been securely updated.",
      });
      // Stay on the draft page — do NOT navigate away on save
    } catch (err) {
      console.error("Failed to save:", err);
      toast.error("Save Failed", { description: "Could not update the manuscript." });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!isReady) return;
    // TC012: Require a non-default title before publishing
    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle === "Untitled Manuscript") {
      setTitleError("A real title is required before publishing.");
      toast.error("Title Required", {
        description: "Please give your story a proper title before publishing.",
      });
      return;
    }
    setTitleError("");
    setIsPublishing(true);
    try {
      await persistDraft();
      await publishStory(storyId);
      toast.success("Story Published", {
        description: "The manuscript has been published to the archive.",
      });
      router.push("/stories");
    } catch (err) {
      console.error("Failed to publish:", err);
      toast.error("Publishing Failed", { description: "Could not publish the manuscript." });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!isReady) return;
    setIsPublishing(true);
    try {
      await unpublishStory(storyId);
      setDbStory((prev) => prev ? { ...prev, status: "draft" } : prev);
      toast.info("Story Sealed", {
        description: "The manuscript has been returned to drafts.",
      });
    } catch (err) {
      console.error("Failed to unpublish:", err);
      toast.error("Action Failed", { description: "Could not unpublish the manuscript." });
    } finally {
      setIsPublishing(false);
    }
  };

  const isPublished = dbStory?.status === "published";

  if (!dbStory || !isReady) {
    return (
      <div className="flex items-center justify-center h-full bg-bg-panel">
        <Loader2 className="size-8 text-brand-ember animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 bg-bg-panel text-foreground">
      {/* ─── TOP BAR ────────────────────────────────────────── */}
      <div className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0 bg-bg-surface sticky top-0 z-10">
        <Link
          href="/stories"
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3" />
          Archive
        </Link>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "text-fine font-mono uppercase tracking-widest px-2 py-0.5 border",
              isPublished
                ? "text-status-active border-status-active/30 bg-status-active/10"
                : "text-muted-foreground border-border"
            )}
          >
            {isSaving ? "Saving..." : isPublished ? "Published" : "Draft"}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || isPublishing}
            className="rounded-none border-border hover:border-brand-ember px-5"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Save className="size-4 mr-2" />
            )}
            Save
          </Button>
          {isPublished ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnpublish}
              disabled={isSaving || isPublishing}
              className="rounded-none border-border hover:border-destructive hover:text-destructive px-5"
            >
              {isPublishing ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <EyeOff className="size-4 mr-2" />
              )}
              Unpublish
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handlePublish}
              disabled={isSaving || isPublishing}
              className="bg-brand-ember hover:bg-brand-ember/90 text-primary-foreground rounded-none px-5"
            >
              {isPublishing ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Globe className="size-4 mr-2" />
              )}
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* ─── EDITOR CONTINUOUS SCROLL ─────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
          {/* Cover & Title Block */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <PenTool className="size-4 text-brand-ember" />
              <span className="text-fine font-mono uppercase tracking-caps text-brand-ember font-bold">
                Manuscript Core
              </span>
            </div>

            <Input
              id="story-title-input"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError("");
              }}
              placeholder="The Tale of the Bamboo Cutter"
              className="font-heading text-4xl font-bold h-16 border-2 border-border-strong bg-bg-surface px-4 shadow-brutal-sm focus-visible:ring-2 focus-visible:ring-brand-ember/50 placeholder:text-muted-foreground/30 text-foreground"
            />
            {titleError && (
              <p className="font-mono text-fine text-destructive uppercase tracking-wider pl-4 border-l-2 border-destructive">
                {titleError}
              </p>
            )}

            <BrutalistCard variant="panel" padding="md" className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 mt-6 bg-bg-panel border-border-strong">
              <div className="space-y-2">
                <Label className="text-fine font-mono uppercase tracking-widest text-muted-foreground">
                  Cover Art
                </Label>
                <div className="border-2 border-border-strong bg-bg-surface h-full min-h-[250px]">
                  <CoverImageUpload
                    value={coverImageUrl}
                    onChange={setCoverImageUrl}
                    className="w-full h-full aspect-[3/4]"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-fine font-mono uppercase tracking-widest text-muted-foreground">
                    Short Description
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief summary of the story..."
                    className="min-h-[100px] resize-none border-2 border-border-strong bg-bg-surface rounded-none focus-visible:ring-1 focus-visible:ring-brand-ember/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-fine font-mono uppercase tracking-widest text-muted-foreground">
                      Category
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="flex h-10 w-full border-2 border-border-strong bg-bg-surface px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-ember/50 text-foreground rounded-none">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-border-strong rounded-none shadow-brutal-sm bg-bg-surface">
                        {STORY_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value} className="font-mono text-sm focus:bg-primary focus:text-primary-foreground rounded-none cursor-pointer">
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-fine font-mono uppercase tracking-widest text-muted-foreground">
                      Language
                    </Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="flex h-10 w-full border-2 border-border-strong bg-bg-surface px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-ember/50 text-foreground rounded-none">
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-border-strong rounded-none shadow-brutal-sm bg-bg-surface">
                        {STORY_LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value} className="font-mono text-sm focus:bg-primary focus:text-primary-foreground rounded-none cursor-pointer">
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </BrutalistCard>
          </div>

          <hr className="border-2 border-border-strong" />

          {/* Chapters Builder */}
          <BrutalistCard variant="panel" padding="md" className="space-y-6 bg-bg-panel border-border-strong">
            <div className="flex items-center justify-between border-b-2 border-border-strong pb-4 mb-4">
              <div>
                <h2 className="font-heading text-2xl font-black uppercase tracking-tighter text-foreground">Chapters</h2>
                <p className="text-xs font-mono text-muted-foreground tracking-wide mt-1">
                  Compose the linear sequence of your story.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddChapter}
                className="rounded-none border-2 border-border-strong hover:border-brand-ember hover:bg-brand-ember/10 font-mono tracking-widest uppercase text-xs shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <Plus className="size-4 mr-2" /> Add Chapter
              </Button>
            </div>

            <div className="space-y-4">
              {chapters.map((ch) => (
                <ChapterBuilderCard
                  key={ch.id}
                  id={ch.id}
                  order={ch.order}
                  title={ch.title}
                  content={ch.content}
                  tiptapContent={ch.tiptapContent}
                  illustrationUrl={ch.illustrationUrl}
                  choices={ch.choices}
                  allChapters={chapters}
                  isExpanded={expandedChapterIds.has(ch.id)}
                  onUpdate={handleUpdateChapter}
                  onUpdateTiptap={handleUpdateChapterTiptap}
                  onDelete={handleDeleteChapterClick}
                  onToggleExpand={handleToggleExpand}
                  onAddChoice={() => handleAddChoice(ch.id)}
                  onUpdateChoice={(cId: string, f: string, v: string) =>
                    handleUpdateChoice(ch.id, cId, f, v)
                  }
                  onDeleteChoice={(cId: string) => handleDeleteChoice(ch.id, cId)}
                />
              ))}

              {chapters.length === 0 && (
                <div className="border-2 border-dashed border-border-strong p-12 text-center bg-bg-surface group hover:border-brand-ember/50 transition-colors">
                  <p className="text-sm font-mono text-muted-foreground mb-4 uppercase tracking-widest">
                    No chapters yet.
                  </p>
                  <Button
                    variant="default"
                    onClick={handleAddChapter}
                    className="bg-brand-ember hover:bg-brand-ember/90 text-primary-foreground rounded-none shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    <Plus className="size-4 mr-2" /> Start the first chapter
                  </Button>
                </div>
              )}
            </div>
          </BrutalistCard>

          <hr className="border-2 border-border-strong" />

          {/* Post-Story Metadata */}
          <BrutalistCard variant="panel" padding="md" className="space-y-8 bg-bg-panel border-border-strong">
            <h2 className="font-heading text-xl font-black uppercase tracking-tighter text-foreground border-b-2 border-border-strong pb-4">Closing Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-fine font-mono uppercase tracking-widest text-muted-foreground">
                  Moral of the Story
                </Label>
                <Textarea
                  value={moral}
                  onChange={(e) => setMoral(e.target.value)}
                  placeholder="What is the key takeaway?"
                  className="min-h-[100px] border-2 border-border-strong bg-bg-surface rounded-none focus-visible:ring-1 focus-visible:ring-brand-ember/50"
                />
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-fine font-mono uppercase tracking-widest text-muted-foreground">
                    Original Attribution
                  </Label>
                  <Input
                    value={attributedAuthor}
                    onChange={(e) => setAttributedAuthor(e.target.value)}
                    placeholder="e.g. As told by Ene Ibetombi"
                    className="h-11 border-2 border-border-strong bg-bg-surface rounded-none focus-visible:ring-1 focus-visible:ring-brand-ember/50"
                  />
                  <p className="text-fine text-muted-foreground font-mono">
                    Who is the real-world source of this folk tale?
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-fine font-mono uppercase tracking-widest text-muted-foreground">
                    Tags
                  </Label>
                  <Input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="folklore, bamboo, ritual"
                    className="h-11 border-2 border-border-strong bg-bg-surface rounded-none focus-visible:ring-1 focus-visible:ring-brand-ember/50"
                  />
                </div>
              </div>
            </div>
          </BrutalistCard>
        </div>
      </div>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={!!chapterToDelete} onOpenChange={(open) => !open && setChapterToDelete(null)}>
        <AlertDialogContent className="border-2 border-border-strong bg-bg-surface rounded-none shadow-brutal">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading uppercase tracking-tight text-foreground">Remove Chapter?</AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-sm text-muted-foreground">
              Are you sure you want to remove this chapter? This will also remove any scenes and choices inside it. This action cannot be undone once saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              id="chapter-delete-cancel-btn"
              className="rounded-none border-2 border-border-strong font-mono uppercase tracking-wider hover:bg-bg-panel hover:text-foreground"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              id="chapter-delete-confirm-btn"
              onClick={handleConfirmDeleteChapter}
              className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono uppercase tracking-wider border-2 border-transparent"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
