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
import {
  getFullStoryById,
  updateStory,
  publishStory,
  unpublishStory,
} from "@/actions/storyActions";
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

  // -- Fetch story on mount --
  React.useEffect(() => {
    let cancelled = false;
    getFullStoryById(storyId).then((story) => {
      if (cancelled || !story) return;
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
  }, [storyId]);

  // -- Handlers --

  const handleAddChapter = () => {
    const newOrder = chapters.length + 1;
    const tempId = `temp-${Date.now()}`;
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

  const handleDeleteChapter = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this chapter? This action cannot be undone."
    );
    if (!confirmed) return;

    const chapter = chapters.find((ch) => ch.id === id);
    if (!chapter) return;

    setChapters((prev) => {
      const filtered = prev.filter((ch) => ch.id !== id);
      return filtered.map((ch, i) => ({ ...ch, order: i + 1 }));
    });

    if (!chapter.isNew && !id.startsWith("temp-")) {
      setPendingChapterDeletions((prev) => [...prev, id]);
    }
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
                  id: `temp-choice-${Date.now()}`,
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
      router.push("/stories");
    } catch (err) {
      console.error("Failed to save:", err);
      toast.error("Save Failed", { description: "Could not update the manuscript." });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!isReady) return;
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="The Tale of the Bamboo Cutter"
              className="font-heading text-4xl font-bold h-16 border-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-transparent placeholder:text-muted-foreground/30"
            />

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 mt-6">
              <div className="space-y-2">
                <Label className="text-fine font-mono uppercase tracking-widest text-muted-foreground">
                  Cover Art
                </Label>
                <CoverImageUpload
                  value={coverImageUrl}
                  onChange={setCoverImageUrl}
                  className="w-full aspect-[3/4]"
                />
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
                    className="min-h-[100px] resize-none border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-fine font-mono uppercase tracking-widest text-muted-foreground">
                      Category
                    </Label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="flex h-10 w-full border border-border bg-transparent px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-ember/50 text-foreground"
                      aria-label="Story category"
                    >
                      {STORY_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-fine font-mono uppercase tracking-widest text-muted-foreground">
                      Language
                    </Label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="flex h-10 w-full border border-border bg-transparent px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-ember/50 text-foreground"
                      aria-label="Story language"
                    >
                      {STORY_LANGUAGES.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-border" />

          {/* Chapters Builder */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-2xl font-bold">Chapters</h2>
                <p className="text-xs font-mono text-muted-foreground tracking-wide mt-1">
                  Compose the linear sequence of your story.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddChapter}
                className="rounded-none border-border hover:border-brand-ember hover:bg-brand-ember/10"
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
                  onDelete={handleDeleteChapter}
                  onToggleExpand={handleToggleExpand}
                  onAddChoice={() => handleAddChoice(ch.id)}
                  onUpdateChoice={(cId: string, f: string, v: string) =>
                    handleUpdateChoice(ch.id, cId, f, v)
                  }
                  onDeleteChoice={(cId: string) => handleDeleteChoice(ch.id, cId)}
                />
              ))}

              {chapters.length === 0 && (
                <div className="border border-dashed border-border p-12 text-center bg-bg-surface group">
                  <p className="text-sm font-mono text-muted-foreground mb-4">
                    No chapters yet.
                  </p>
                  <Button
                    variant="default"
                    onClick={handleAddChapter}
                    className="bg-brand-ember hover:bg-brand-ember/90 text-primary-foreground rounded-none"
                  >
                    <Plus className="size-4 mr-2" /> Start the first chapter
                  </Button>
                </div>
              )}
            </div>
          </div>

          <hr className="border-border" />

          {/* Post-Story Metadata */}
          <div className="space-y-8 bg-bg-surface p-8 border border-border">
            <h2 className="font-heading text-xl font-bold">Closing Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-fine font-mono uppercase tracking-widest text-muted-foreground">
                  Moral of the Story
                </Label>
                <Textarea
                  value={moral}
                  onChange={(e) => setMoral(e.target.value)}
                  placeholder="What is the key takeaway?"
                  className="min-h-[100px] border-border"
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
                    className="border-border h-11"
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
                    className="border-border h-11"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
