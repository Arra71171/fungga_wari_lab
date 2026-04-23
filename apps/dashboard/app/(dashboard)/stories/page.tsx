"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Plus, Search, BookOpen, Sparkles, Globe, EyeOff, Loader2, Trash2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Input } from "@workspace/ui/components/input";
import { StoryCard } from "@workspace/ui/components/StoryCard";
import { BrutalistCard } from "@workspace/ui/components/BrutalistCard";
import { useRouter } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";
import { toast } from "sonner";
import {
  getAllStoriesAdmin,
  createDraftStory,
  publishStory,
  unpublishStory,
  deleteStory,
} from "@/actions/storyActions";

type Story = Awaited<ReturnType<typeof getAllStoriesAdmin>>[number];

export default function StoriesOverviewPage() {
  const router = useRouter();
  const [stories, setStories] = React.useState<Story[] | undefined>(undefined);
  const [isCreating, setIsCreating] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  // AlertDialog confirmation state
  const [pendingDelete, setPendingDelete] = React.useState<{ id: string; title: string } | null>(null);

  // Load stories on mount
  React.useEffect(() => {
    getAllStoriesAdmin()
      .then(setStories)
      .catch(() => setStories([]));
  }, []);

  const handleNewManuscript = async () => {
    try {
      setIsCreating(true);
      const newId = await createDraftStory();
      toast.success("Draft Initialized", { description: "A new blank manuscript has been forged." });
      router.push(`/stories/draft/${newId}`);
    } catch (e) {
      console.error(e);
      toast.error("Creation Failed", { description: "Failed to initialize new manuscript." });
      setIsCreating(false);
    }
  };

  const handleTogglePublish = async (
    e: React.MouseEvent,
    storyId: string,
    currentStatus: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setTogglingId(storyId);
    try {
      if (currentStatus === "published") {
        await unpublishStory(storyId);
        toast.info("Story Sealed", { description: "Manuscript returned to the private vault." });
      } else {
        await publishStory(storyId);
        toast.success("Story Published", { description: "Manuscript released to the public archive." });
      }
      // Refresh
      const updated = await getAllStoriesAdmin();
      setStories(updated);
    } catch (err) {
      console.error("Failed to toggle publish:", err);
      toast.error("Action Failed", { description: "Could not modify publish status." });
    } finally {
      setTogglingId(null);
    }
  };

  /** Step 1: open the AlertDialog by storing the pending delete target */
  const handleDeleteClick = (e: React.MouseEvent, storyId: string, storyTitle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setPendingDelete({ id: storyId, title: storyTitle });
  };

  /** Step 2: user confirmed in AlertDialog — execute the actual delete */
  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    const { id: storyId, title: storyTitle } = pendingDelete;
    setPendingDelete(null);

    setDeletingId(storyId);
    try {
      const result = await deleteStory(storyId);
      if (result && !result.success) {
        throw new Error(result.error || "Unknown server error");
      }
      toast.success("Manuscript Destroyed", {
        description: `"${storyTitle}" has been permanently erased.`,
      });
      setStories((prev) => prev?.filter((s) => s.id !== storyId) ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not remove the manuscript.";
      toast.error("Deletion Failed", { description: message });
    } finally {
      setDeletingId(null);
    }
  };

  if (stories === undefined) {
    return (
      <div className="flex flex-col h-full space-y-6 md:space-y-8 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto animate-pulse">
        <div className="h-20 bg-muted/30 rounded-none w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-muted/20 border border-border-subtle rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => { if (!open) setPendingDelete(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10">
              <TriangleAlert className="size-5 text-destructive" aria-hidden />
            </AlertDialogMedia>
            <AlertDialogTitle>Permanently Delete Manuscript?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-foreground">&ldquo;{pendingDelete?.title}&rdquo;</strong>
              {" "}will be permanently removed along with all its chapters, scenes, and media
              references. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-none font-mono text-xs uppercase tracking-widest"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="rounded-none font-mono text-xs uppercase tracking-widest"
              onClick={handleDeleteConfirm}
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col h-full space-y-6 md:space-y-8 animate-in fade-in duration-700 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-6 shrink-0 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-brand-ember/80 font-mono text-xs uppercase tracking-label mb-2">
              <Sparkles className="size-3" />
              <span>Fungga Wari Archive</span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl italic tracking-tight text-foreground drop-shadow-lg">
              Manuscripts
            </h1>
            <p className="text-muted-foreground font-mono text-sm max-w-lg leading-relaxed">
              Manage your folklore archive. Transcribe the oral tradition into digital stone.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleNewManuscript}
              disabled={isCreating}
              className="gap-2 border border-brand-ember/30 bg-background text-brand-ember hover:bg-brand-ember/10 transition-all rounded-none px-6"
            >
              <Plus className="size-4" />
              {isCreating ? "Initializing..." : "New Manuscript"}
            </Button>
          </div>
        </div>

        <div className="relative w-full sm:max-w-md z-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or category..."
            className="pl-9 h-12 border-border bg-primary/5 hover:bg-primary/10 focus-visible:ring-brand-ember/50 text-foreground placeholder:text-muted-foreground/50 rounded-none transition-all font-mono text-sm"
          />
        </div>

        {stories.length === 0 ? (
          <BrutalistCard variant="panel" className="flex-1 flex flex-col items-center justify-center p-12 mt-12 border-dashed relative z-10">
            <BookOpen className="size-12 text-muted-foreground/30 mb-6" />
            <h3 className="font-heading text-xl font-semibold mb-2 text-foreground/80">The Archive is Empty</h3>
            <p className="text-muted-foreground mb-8 max-w-md text-center font-mono text-sm leading-relaxed">
              There are no manuscripts in the sacred vault. Begin by establishing a new record of the oral tradition.
            </p>
            <Button
              onClick={handleNewManuscript}
              disabled={isCreating}
              className="rounded-none bg-brand-ember/10 text-brand-ember hover:bg-brand-ember/20 border border-brand-ember/30 transition-all px-8"
            >
              {isCreating ? "Initializing..." : "Establish First Manuscript"}
            </Button>
          </BrutalistCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10 pb-20">
            {stories.map((story, index) => (
              <div key={story.id} className="relative group/card">
                <Link href={`/stories/draft/${story.id}`}>
                  <StoryCard
                    title={story.title}
                    category={story.category ?? "other"}
                    description={story.description ?? undefined}
                    status={story.status}
                    coverUrl={story.cover_image_url ?? undefined}
                    chapterCount={story.chapter_count ?? 0}
                    language={story.language}
                    priority={index < 4}
                    className="h-full hover:-translate-y-1 transition-transform duration-300 rounded-none border-border"
                  />
                </Link>
                {/* Quick actions */}
                <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={togglingId === story.id || deletingId === story.id}
                    onClick={(e) => handleTogglePublish(e, story.id, story.status)}
                    className={cn(
                      "rounded-none text-fine font-mono uppercase tracking-widest gap-1.5 backdrop-blur-sm",
                      story.status === "published"
                        ? "border-destructive/50 text-destructive hover:bg-destructive/10 bg-background/90"
                        : "border-brand-ember/50 text-brand-ember hover:bg-brand-ember/10 bg-background/90",
                    )}
                    aria-label={story.status === "published" ? "Unpublish story" : "Publish story"}
                  >
                    {togglingId === story.id ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : story.status === "published" ? (
                      <EyeOff className="size-3" />
                    ) : (
                      <Globe className="size-3" />
                    )}
                    {story.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={deletingId === story.id || togglingId === story.id}
                    onClick={(e) => handleDeleteClick(e, story.id, story.title)}
                    className="rounded-none text-fine font-mono uppercase tracking-widest gap-1.5 backdrop-blur-sm border-destructive/50 text-destructive hover:bg-destructive/10 bg-background/90"
                    aria-label="Delete story"
                  >
                    {deletingId === story.id ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Trash2 className="size-3" />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
