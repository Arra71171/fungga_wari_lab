"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  GripVertical,
  FileText,
  ChevronRight,
  Save,
  Layers,
  Maximize2,
  Minimize2,
  LayoutGrid,
  Type,
  Pencil,
  ImageIcon,
} from "lucide-react";
import { BrandLogo } from "@workspace/ui/components/BrandLogo";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
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
import { BlockEditorPanel } from "@/components/stories/BlockEditorPanel";
import { CoverImageUpload } from "@/components/cover-image-upload";
import type { Database } from "@workspace/ui/types/supabase";

// Server actions
import { getStoryById, updateStory as updateStoryAction } from "@/actions/storyActions";
import {
  getChaptersByStory,
  getScenesByChapter,
  getSceneById,
  createScene as createSceneAction,
  createChapter as createChapterAction,
  updateSceneContent,
  updateScene as updateSceneAction,
} from "@/actions/chapterActions";
import { createAsset } from "@/actions/assetActions";

// ─── Types ────────────────────────────────────────────────────────────────────

type JSONContent = Record<string, unknown>;
type StoryRow = Awaited<ReturnType<typeof getStoryById>>;
type ChapterRow = Database["public"]["Tables"]["chapters"]["Row"];
type SceneListItem = Database["public"]["Tables"]["scenes"]["Row"];
type SceneWithContent = Awaited<ReturnType<typeof getSceneById>>;

const CATEGORIES = [
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

const LANGUAGES = [
  { value: "Meiteilon", label: "Meiteilon" },
  { value: "English", label: "English" },
  { value: "Hindi", label: "Hindi" },
] as const;

// ─── Page Component ───────────────────────────────────────────────────────────

export default function StoryEditorPage() {
  const params = useParams();
  const router = useRouter();
  const rawStoryId = params?.storyId;

  // Guard: redirect "new" to the create page
  React.useEffect(() => {
    if (rawStoryId === "new") {
      router.replace("/stories/new");
    }
  }, [rawStoryId, router]);

  const isValidId =
    typeof rawStoryId === "string" &&
    rawStoryId.length > 0 &&
    !rawStoryId.startsWith("[") &&
    rawStoryId !== "new";
  const storyId = isValidId ? rawStoryId : "";

  // ── Data state ──────────────────────────────────────────────────────────────
  const [story, setStory] = React.useState<StoryRow | null | undefined>(
    undefined // undefined = loading, null = not found
  );
  const [chapters, setChapters] = React.useState<ChapterRow[] | undefined>(
    undefined
  );
  const [sceneList, setSceneList] = React.useState<SceneListItem[]>([]);
  const [activeSceneData, setActiveSceneData] =
    React.useState<SceneWithContent | null>(null);

  const [activeChapterId, setActiveChapterId] = React.useState<string | null>(
    null
  );
  const [activeSceneId, setActiveSceneId] = React.useState<string | null>(null);
  const [focusMode, setFocusMode] = React.useState(false);
  const [editorMode, setEditorMode] = React.useState<"tiptap" | "blocks">(
    "tiptap"
  );
  const [editingMeta, setEditingMeta] = React.useState(false);

  // ── Fetch story ─────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!isValidId) return;
    let cancelled = false;
    getStoryById(storyId).then((data) => {
      if (!cancelled) setStory(data);
    });
    return () => {
      cancelled = true;
    };
  }, [storyId, isValidId]);

  // ── Fetch chapters ──────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!isValidId) return;
    let cancelled = false;
    getChaptersByStory(storyId).then((data) => {
      if (!cancelled) setChapters(data as ChapterRow[]);
    });
    return () => {
      cancelled = true;
    };
  }, [storyId, isValidId]);

  // ── Auto-select first chapter ───────────────────────────────────────────────
  React.useEffect(() => {
    if (chapters && chapters.length > 0 && !activeChapterId) {
      setActiveChapterId(chapters[0]!.id);
    }
  }, [chapters, activeChapterId]);

  // ── Fetch scenes for active chapter ────────────────────────────────────────
  const refreshSceneList = React.useCallback(async (chapterId: string) => {
    const data = await getScenesByChapter(chapterId);
    setSceneList(data as SceneListItem[]);
  }, []);

  React.useEffect(() => {
    if (!activeChapterId) {
      setSceneList([]);
      return;
    }
    refreshSceneList(activeChapterId);
  }, [activeChapterId, refreshSceneList]);

  // ── Auto-select first scene ─────────────────────────────────────────────────
  React.useEffect(() => {
    if (sceneList.length > 0) {
      setActiveSceneId((prev) => prev ?? sceneList[0]!.id);
    } else {
      setActiveSceneId(null);
    }
  }, [sceneList]);

  // ── Fetch full scene content when active scene changes ──────────────────────
  React.useEffect(() => {
    if (!activeSceneId) {
      setActiveSceneData(null);
      return;
    }
    let cancelled = false;
    getSceneById(activeSceneId).then((data) => {
      if (!cancelled) setActiveSceneData(data ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [activeSceneId]);

  // ── Change active chapter → reset scene selection ───────────────────────────
  const handleChapterChange = (chapterId: string | undefined) => {
    const id = chapterId || null;
    setActiveChapterId(id);
    setActiveSceneId(null);
    setActiveSceneData(null);
  };

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleEditorChange = React.useCallback(
    async (content: JSONContent) => {
      if (!activeSceneId) return;
      await updateSceneContent(activeSceneId, {
        tiptap_content: content,
      });
    },
    [activeSceneId]
  );

  const handleAddScene = async () => {
    if (!activeChapterId) return;
    const newOrder = sceneList.length + 1;
    const newId = await createSceneAction({
      chapterId: activeChapterId,
      title: `Scene ${newOrder}`,
      order: newOrder,
    });
    // Refresh scene list and select the new scene
    await refreshSceneList(activeChapterId);
    setActiveSceneId(newId);
  };

  const handleAddChapter = async () => {
    const newOrder = (chapters?.length ?? 0) + 1;
    const newId = await createChapterAction({
      storyId,
      title: `Chapter ${newOrder}`,
      order: newOrder,
    });
    // Refresh chapters and select new one
    const updated = await getChaptersByStory(storyId);
    setChapters(updated as ChapterRow[]);
    setActiveChapterId(newId);
    setActiveSceneId(null);
    setSceneList([]);
  };

  // Upload image to Cloudinary and register in Supabase
  const handleImageUpload = React.useCallback(
    async (file: File): Promise<string | undefined> => {
      try {
        const CLOUDINARY_CLOUD_NAME =
          process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const CLOUDINARY_UPLOAD_PRESET =
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
          throw new Error("Missing Cloudinary configuration");
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );

        if (!res.ok) {
          const errorData = (await res.json()) as {
            error?: { message?: string };
          };
          throw new Error(errorData.error?.message || "Upload failed");
        }

        const uploadResponse = (await res.json()) as {
          secure_url: string;
          public_id: string;
        };

        await createAsset({
          url: uploadResponse.secure_url,
          publicId: uploadResponse.public_id,
          title: file.name,
          type: "illustration",
          storyId,
        });

        return uploadResponse.secure_url;
      } catch (err) {
        console.error("[Image Upload] Failed:", err);
        return undefined;
      }
    },
    [storyId]
  );

  // Handle story metadata inline updates
  const handleMetaUpdate = async (field: string, value: unknown) => {
    if (!isValidId) return;
    await updateStoryAction(
      storyId,
      { [field]: value } as never
    );
    // Optimistic local update
    setStory((prev) =>
      prev ? { ...prev, [field]: value } : prev
    );
  };

  // ── Loading / error states ──────────────────────────────────────────────────

  if (!isValidId) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="size-8 text-brand-ember animate-spin" />
      </div>
    );
  }

  if (story === undefined || chapters === undefined) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="size-8 text-brand-ember animate-spin" />
      </div>
    );
  }

  if (story === null) {
    return (
      <div className="p-10 text-destructive font-mono uppercase tracking-widest">
        Manuscript not found
      </div>
    );
  }

  const activeChapter = chapters.find((c) => c.id === activeChapterId);

  return (
    <div
      className={cn(
        "flex w-full h-full overflow-hidden animate-in fade-in duration-500 transition-colors",
        focusMode
          ? "bg-cinematic-bg text-cinematic-text"
          : "bg-bg-base text-foreground"
      )}
    >
      {/* ═══ PANE 1: Chapter & Scene Navigation ═══ */}
      <div
        className={cn(
          "border-r flex flex-col shrink-0 transition-all duration-500 ease-in-out",
          focusMode
            ? "w-0 opacity-0 overflow-hidden border-transparent"
            : "w-64 border-border-subtle bg-bg-panel"
        )}
      >
        <div className="flex flex-col border-b border-border-subtle shrink-0">
          <Link
            href="/stories"
            className="flex items-center gap-2 p-3 text-xs font-mono tracking-widest uppercase text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border-b border-border-subtle"
          >
            <ChevronRight className="size-3 rotate-180" />
            Back to Dashboard
          </Link>
          <div className="p-4 space-y-1">
            <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
              Active Manuscript
            </div>
            <h2 className="font-heading text-base font-bold text-foreground leading-tight truncate">
              {story.title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={cn(
                  "text-[9px] uppercase font-mono tracking-wider px-1.5 py-0.5 border",
                  story.status === "published"
                    ? "bg-status-active/10 text-status-active border-status-active/20"
                    : "bg-muted/50 text-muted-foreground border-border"
                )}
              >
                {story.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {/* Chapters — Accordion-based */}
          <div className="flex items-center justify-between px-2 mb-2 text-brand-ember/80">
            <span className="text-xs uppercase font-mono tracking-widest">
              Chapters
            </span>
            <button
              onClick={handleAddChapter}
              aria-label="Add chapter"
              className="size-6 flex items-center justify-center hover:bg-secondary rounded-none text-brand-ember transition-colors"
            >
              <Plus className="size-3" />
            </button>
          </div>

          {chapters.length === 0 ? (
            <div className="text-xs text-muted-foreground font-mono p-4 border border-dashed border-border text-center space-y-3">
              <FileText className="size-8 text-muted-foreground/20 mx-auto" />
              <p>No chapters yet</p>
              <Button
                onClick={handleAddChapter}
                className="w-full gap-2 rounded-none border border-brand-ember/30 bg-brand-ember/10 text-brand-ember hover:bg-brand-ember/20 font-mono text-[10px] tracking-widest uppercase"
                size="sm"
              >
                <Plus className="size-3" />
                Add First Chapter
              </Button>
            </div>
          ) : (
            <Accordion
              type="single"
              collapsible
              value={activeChapterId ?? undefined}
              onValueChange={handleChapterChange}
              className="space-y-1"
            >
              {chapters.map((chapter, idx) => (
                <AccordionItem
                  key={chapter.id}
                  value={chapter.id}
                  className="border-none"
                >
                  <AccordionTrigger
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 text-sm rounded-none border-l-2 transition-all duration-200 hover:no-underline hover:bg-secondary",
                      activeChapterId === chapter.id
                        ? "border-brand-ember bg-brand-ember/10"
                        : "border-transparent"
                    )}
                  >
                    <GripVertical className="size-3 text-muted-foreground/30 shrink-0" />
                    <span
                      className={cn(
                        "flex-1 text-left font-heading truncate text-sm",
                        activeChapterId === chapter.id
                          ? "text-brand-ember font-bold"
                          : "text-muted-foreground"
                      )}
                    >
                      {chapter.title || `Chapter ${idx + 1}`}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0 pl-5">
                    {/* Scenes within chapter */}
                    <ChapterScenes
                      scenes={chapter.id === activeChapterId ? sceneList : []}
                      activeSceneId={activeSceneId}
                      onSelectScene={(id) => {
                        setActiveSceneId(id);
                        setActiveSceneData(null);
                      }}
                      onAddScene={handleAddScene}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        <div className="p-3 border-t border-border-subtle shrink-0">
          <Button
            onClick={handleAddChapter}
            className="w-full gap-2 rounded-none bg-transparent hover:bg-secondary text-muted-foreground hover:text-foreground border border-border font-mono text-xs tracking-widest uppercase transition-all"
          >
            <Plus className="size-3" /> New Chapter
          </Button>
        </div>
      </div>

      {/* ═══ PANE 2: Center Editor Workspace ═══ */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 relative transition-colors duration-500",
          focusMode ? "bg-cinematic-bg" : "bg-bg-base"
        )}
      >
        {activeSceneData ? (
          <div className="flex-1 flex flex-col h-full">
            {/* Toolbar */}
            <div
              className={cn(
                "h-12 border-b flex items-center justify-between px-8 backdrop-blur-md shrink-0 transition-colors duration-500",
                focusMode
                  ? "bg-cinematic-panel border-cinematic-border/20"
                  : "bg-bg-panel/90 border-border-subtle"
              )}
            >
              <div
                className={cn(
                  "font-mono text-xs uppercase tracking-widest flex items-center gap-2",
                  focusMode
                    ? "text-cinematic-text/60"
                    : "text-muted-foreground"
                )}
              >
                {activeChapter?.title}
                <ChevronRight className="size-3" />
                {activeSceneData.title ?? "Untitled Scene"}
              </div>
              <div className="flex items-center gap-4">
                {/* Editor mode toggle */}
                <div className="flex items-center border border-border rounded-none overflow-hidden">
                  <button
                    onClick={() => setEditorMode("tiptap")}
                    aria-label="Rich text editor mode"
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-colors",
                      editorMode === "tiptap"
                        ? "bg-brand-ember/15 text-brand-ember font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <Type className="size-3" /> Rich Text
                  </button>
                  <button
                    onClick={() => setEditorMode("blocks")}
                    aria-label="Block editor mode"
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-colors",
                      editorMode === "blocks"
                        ? "bg-brand-ember/15 text-brand-ember font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <LayoutGrid className="size-3" /> Blocks
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-widest",
                      focusMode
                        ? "text-cinematic-text/40"
                        : "text-muted-foreground/60"
                    )}
                  >
                    Auto-saving
                  </span>
                  <Save
                    className={cn(
                      "size-3",
                      focusMode
                        ? "text-cinematic-accent/60"
                        : "text-muted-foreground/40"
                    )}
                  />
                </div>
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  aria-label={
                    focusMode ? "Exit Focus Mode" : "Enter Focus Mode"
                  }
                  className={cn(
                    "size-6 flex items-center justify-center hover:bg-secondary rounded-none transition-colors",
                    focusMode
                      ? "text-cinematic-accent hover:text-cinematic-text hover:bg-cinematic-bg"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {focusMode ? (
                    <Minimize2 className="size-3" />
                  ) : (
                    <Maximize2 className="size-3" />
                  )}
                </button>
              </div>
            </div>

            {/* Editor Content Area */}
            {editorMode === "blocks" ? (
              <BlockEditorPanel storyId={storyId} />
            ) : (
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-8 py-12">
                  {/* Scene title input */}
                  <input
                    type="text"
                    defaultValue={activeSceneData.title ?? ""}
                    onBlur={async (e) => {
                      if (e.target.value !== activeSceneData.title) {
                        await updateSceneContent(activeSceneData.id, {
                          title: e.target.value,
                        });
                        setActiveSceneData((prev) =>
                          prev ? { ...prev, title: e.target.value } : prev
                        );
                      }
                    }}
                    placeholder="Scene title..."
                    className={cn(
                      "w-full bg-transparent border-none text-xl font-heading font-semibold focus:outline-none focus:ring-0 block mb-6 leading-tight tracking-tight transition-colors duration-500",
                      focusMode
                        ? "text-cinematic-text placeholder:text-cinematic-text/20"
                        : "text-foreground placeholder:text-muted-foreground/30"
                    )}
                  />

                  {/* Decorative Separator */}
                  <div className="flex items-center justify-center gap-4 opacity-30 my-6">
                    <div
                      className={cn(
                        "h-px w-16 bg-gradient-to-r from-transparent",
                        focusMode ? "to-cinematic-accent" : "to-brand-ember"
                      )}
                    />
                    <BrandLogo
                      variant="icon"
                      size="sm"
                      className={
                        focusMode ? "text-cinematic-accent" : "text-brand-ember"
                      }
                    />
                    <div
                      className={cn(
                        "h-px w-16 bg-gradient-to-l from-transparent",
                        focusMode ? "to-cinematic-accent" : "to-brand-ember"
                      )}
                    />
                  </div>

                  {/* Rich Text Editor */}
                  <RichTextEditor
                    key={activeSceneData.id}
                    value={
                      (activeSceneData.tiptap_content as JSONContent | undefined) ?? undefined
                    }
                    onChange={handleEditorChange}
                    onImageUpload={handleImageUpload}
                  />
                </div>
              </div>
            )}
          </div>
        ) : activeChapterId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <FileText className="size-12 text-muted-foreground/20" />
              <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground/60">
                Select or create a scene
              </p>
              <Button
                onClick={handleAddScene}
                className="gap-2 rounded-none border border-brand-ember/30 bg-brand-ember/10 text-brand-ember hover:bg-brand-ember/20 font-mono text-xs tracking-widest uppercase"
              >
                <Plus className="size-3" /> Create First Scene
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 max-w-xs text-center">
              <FileText className="size-12 text-muted-foreground/20" />
              <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground/60">
                {(chapters?.length ?? 0) === 0
                  ? "Add your first chapter to begin writing"
                  : "Select a chapter to begin"}
              </p>
              {(chapters?.length ?? 0) === 0 && (
                <Button
                  onClick={handleAddChapter}
                  className="gap-2 rounded-none border border-brand-ember/30 bg-brand-ember/10 text-brand-ember hover:bg-brand-ember/20 font-mono text-xs tracking-widest uppercase"
                >
                  <Plus className="size-3" /> Add First Chapter
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══ PANE 3: Story Metadata & Context Panel ═══ */}
      <div
        className={cn(
          "border-l shrink-0 flex flex-col transition-all duration-500 ease-in-out",
          focusMode
            ? "w-0 opacity-0 overflow-hidden border-transparent"
            : "w-80 bg-bg-panel border-border-subtle"
        )}
      >
        <div className="h-12 border-b border-border-subtle flex items-center justify-between px-5 shrink-0">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand-ember/80 font-bold">
            Manuscript Details
          </span>
          <button
            onClick={() => setEditingMeta(!editingMeta)}
            aria-label={editingMeta ? "Close metadata editor" : "Edit metadata"}
            className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary rounded-none transition-colors"
          >
            <Pencil className="size-3" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Cover Image */}
          <div className="space-y-2">
            <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Cover Image
            </Label>
            <CoverImageUpload
              value={story.cover_image_url ?? undefined}
              onChange={(url) => handleMetaUpdate("cover_image_url", url)}
              className="h-auto aspect-[3/4]"
            />
          </div>

          <Separator />

          {/* Story Status */}
          <div className="space-y-3">
            <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Status
            </Label>
            <div className="p-3 border border-border-subtle bg-bg-surface space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-muted-foreground uppercase tracking-widest">
                  Status
                </span>
                <span className="text-brand-ember font-bold capitalize">
                  {story.status.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-muted-foreground uppercase tracking-widest">
                  Chapters
                </span>
                <span className="text-foreground">{chapters.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-muted-foreground uppercase tracking-widest">
                  Language
                </span>
                <span className="text-foreground capitalize">
                  {story.language}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Editable Metadata */}
          {editingMeta && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Title */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Title
                </Label>
                <Input
                  defaultValue={story.title}
                  onBlur={(e) => handleMetaUpdate("title", e.target.value)}
                  className="h-9 rounded-none border-border bg-background font-mono text-sm"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Description
                </Label>
                <Textarea
                  defaultValue={story.description ?? ""}
                  onBlur={(e) =>
                    handleMetaUpdate("description", e.target.value || undefined)
                  }
                  rows={3}
                  className="rounded-none border-border bg-background font-mono text-xs leading-relaxed resize-none"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Category
                </Label>
                <Select
                  defaultValue={story.category ?? "other"}
                  onValueChange={(val) => handleMetaUpdate("category", val)}
                >
                  <SelectTrigger className="h-9 rounded-none border-border bg-background font-mono text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-border">
                    {CATEGORIES.map((cat) => (
                      <SelectItem
                        key={cat.value}
                        value={cat.value}
                        className="font-mono text-xs"
                      >
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Language
                </Label>
                <Select
                  defaultValue={story.language}
                  onValueChange={(val) => handleMetaUpdate("language", val)}
                >
                  <SelectTrigger className="h-9 rounded-none border-border bg-background font-mono text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-border">
                    {LANGUAGES.map((lang) => (
                      <SelectItem
                        key={lang.value}
                        value={lang.value}
                        className="font-mono text-xs"
                      >
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Moral */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Moral
                </Label>
                <Textarea
                  defaultValue={story.moral ?? ""}
                  onBlur={(e) =>
                    handleMetaUpdate("moral", e.target.value || undefined)
                  }
                  rows={2}
                  className="rounded-none border-border bg-background font-mono text-xs leading-relaxed resize-none"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Tags (comma-separated)
                </Label>
                <Input
                  defaultValue={story.tags?.join(", ") ?? ""}
                  onBlur={(e) => {
                    const parsedTags = e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean);
                    handleMetaUpdate("tags", parsedTags);
                  }}
                  className="h-9 rounded-none border-border bg-background font-mono text-xs"
                />
              </div>

              <Separator />
            </div>
          )}

          {/* Quick Info — non-editing mode */}
          {!editingMeta && (
            <div className="space-y-3">
              {story.description && (
                <div className="space-y-1">
                  <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Description
                  </Label>
                  <p className="text-xs text-foreground/80 font-mono leading-relaxed">
                    {story.description}
                  </p>
                </div>
              )}
              {story.moral && (
                <div className="space-y-1">
                  <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Moral
                  </Label>
                  <p className="text-xs text-brand-ochre/80 font-mono italic border-l-2 border-brand-ochre/30 pl-2">
                    &ldquo;{story.moral}&rdquo;
                  </p>
                </div>
              )}
              {story.tags && story.tags.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Tags
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {story.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-mono uppercase tracking-widest bg-secondary border border-border px-2 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Scene Illustration */}
          {activeSceneData && (
            <div className="space-y-2">
              <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <ImageIcon className="size-3" />
                Scene Illustration
              </Label>
              {activeSceneData.illustration_url ? (
                <div className="relative aspect-[3/4] border border-border overflow-hidden bg-muted group">
                  {/* eslint-disable-next-line @next/next/no-img-element, no-restricted-syntax */}
                  <img
                    src={activeSceneData.illustration_url}
                    alt={activeSceneData.title ?? "Scene illustration"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:text-white hover:bg-white/20 font-mono text-[10px] uppercase tracking-widest"
                      onClick={async () => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = async () => {
                          const file = input.files?.[0];
                          if (!file) return;
                          const url = await handleImageUpload(file);
                          if (url) {
                            await updateSceneAction(activeSceneData.id, {
                              illustration_url: url,
                            });
                            setActiveSceneData((prev) =>
                              prev ? { ...prev, illustration_url: url } : prev
                            );
                          }
                        };
                        input.click();
                      }}
                    >
                      Replace
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = async () => {
                      const file = input.files?.[0];
                      if (!file) return;
                      const url = await handleImageUpload(file);
                      if (url) {
                        await updateSceneAction(activeSceneData.id, {
                          illustration_url: url,
                        });
                        setActiveSceneData((prev) =>
                          prev ? { ...prev, illustration_url: url } : prev
                        );
                      }
                    };
                    input.click();
                  }}
                  className="w-full aspect-[3/4] border border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground/40 hover:border-brand-ember/30 hover:text-brand-ember/60 transition-colors cursor-pointer"
                  aria-label="Upload scene illustration"
                >
                  <ImageIcon className="size-6" />
                  <span className="font-mono text-[10px] uppercase tracking-widest">
                    Add Illustration
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Team Assignments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Tasks
              </Label>
              <Link href={`/stories/${storyId}/tasks`}>
                <Button
                  variant="link"
                  className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-ember p-0 h-auto"
                >
                  Manage
                </Button>
              </Link>
            </div>
            <div className="p-3 border border-dashed border-border text-center">
              <p className="text-xs text-muted-foreground/60 font-mono">
                No tasks assigned to this scene
              </p>
              <Button className="mt-2 w-full gap-2 rounded-none bg-transparent hover:bg-secondary text-brand-ember border border-brand-ember/30 font-mono text-[10px] tracking-widest uppercase transition-all h-8">
                <Plus className="size-3" /> Assign Task
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Chapter Scenes Sub-component ──────────────────────────────────────────────

function ChapterScenes({
  scenes,
  activeSceneId,
  onSelectScene,
  onAddScene,
}: {
  scenes: SceneListItem[];
  activeSceneId: string | null;
  onSelectScene: (id: string) => void;
  onAddScene: () => void;
}) {
  return (
    <div className="space-y-0.5 py-1">
      {scenes.length === 0 ? (
        <div className="text-[10px] text-muted-foreground/50 font-mono p-2 text-center">
          No scenes yet
        </div>
      ) : (
        scenes.map((scene, i) => {
          const isActive = activeSceneId === scene.id;
          return (
            <button
              key={scene.id}
              onClick={() => onSelectScene(scene.id)}
              aria-label={`Select scene: ${scene.title ?? `Scene ${i + 1}`}`}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left rounded-none transition-all",
                isActive
                  ? "bg-brand-ember/15 text-brand-ember font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Layers className="size-3 shrink-0" />
              <span className="truncate">
                {scene.title ?? `Scene ${i + 1}`}
              </span>
              {scene.illustration_url && (
                <ImageIcon className="size-2.5 text-brand-ochre/60 shrink-0 ml-auto" />
              )}
            </button>
          );
        })
      )}
      <button
        onClick={onAddScene}
        aria-label="Add scene"
        className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 hover:text-brand-ember hover:bg-secondary rounded-none transition-all"
      >
        <Plus className="size-3" />
        Add Scene
      </button>
    </div>
  );
}
