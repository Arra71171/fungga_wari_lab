"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/../../convex/_generated/api";
import { use } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Plus, GripVertical, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useRouter } from "next/navigation";

export default function StoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const story = useQuery(api.stories.getById, { id: id as any });
  const chapters = useQuery(api.chapters.getByStoryId, { storyId: id as any });

  const createChapter = useMutation(api.chapters.create);
  const createScene = useMutation(api.scenes.create);

  const handleAddChapter = async () => {
    const order = chapters ? chapters.length : 0;
    await createChapter({
      storyId: id as any,
      title: `Chapter ${order + 1}`,
      order,
    });
  };

  const handleAddScene = async (chapterId: string, currentScenesCount: number) => {
    const sceneId = await createScene({
      chapterId: chapterId as any,
      order: currentScenesCount,
    });
    router.push(`/stories/${id}/scenes/${sceneId}`);
  };

  if (story === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (story === null) {
    return <div>Story not found.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href="/stories">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">{story.title}</h2>
          <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm mt-1">
            <span className="capitalize bg-secondary px-2 py-0.5 rounded-none">{story.category}</span>
            <span className="capitalize">{story.language}</span>
            <span className="capitalize text-primary/80">{story.status}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Story details panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-none border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-heading font-semibold text-lg mb-4">Metadata</h3>
            <div className="space-y-4">
              {/* Future form to edit title, status, etc */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Title</label>
                <Input value={story.title} readOnly />
              </div>
            </div>
          </div>
        </div>

        {/* Chapters panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-xl">Chapters & Scenes</h3>
            <Button size="sm" onClick={handleAddChapter} className="font-mono">
              <Plus className="mr-2 h-4 w-4" /> Add Chapter
            </Button>
          </div>

          {!chapters ? (
            <Skeleton className="h-40 w-full rounded-none" />
          ) : chapters.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center border rounded-none border-dashed">
              <p className="text-muted-foreground mb-4">No chapters yet. Create your first chapter to start writing scenes.</p>
              <Button onClick={handleAddChapter}>Create Chapter 1</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {chapters.map((chapter) => (
                <div key={chapter._id} className="rounded-none border bg-card p-4">
                  <div className="flex items-center justify-between font-mono font-medium">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span>{chapter.title}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8" onClick={() => handleAddScene(chapter._id as string, 0)}>
                      <Plus className="mr-1 h-3 w-3" /> Scene
                    </Button>
                  </div>
                  
                  {/* Scenes list for this chapter will go here */}
                  <div className="mt-4 pl-6 space-y-2">
                    <SceneList chapterId={chapter._id as string} storyId={id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SceneList({ chapterId, storyId }: { chapterId: string, storyId: string }) {
  const scenes = useQuery(api.scenes.getByChapterId, { chapterId: chapterId as any });
  
  if (scenes === undefined) return <div className="text-xs text-muted-foreground">Loading scenes...</div>;
  if (scenes.length === 0) return <div className="text-xs text-muted-foreground italic">No scenes.</div>;

  return (
    <>
      {scenes.map((scene, i) => (
        <div key={scene._id} className="flex items-center justify-between p-2 rounded-none hover:bg-muted/50 transition-colors border">
          <div className="flex items-center gap-2 font-mono text-sm">
            <FileText className="h-3 w-3 text-muted-foreground" />
            <span>Scene {scene.order + 1}</span>
            <span className="text-xs text-muted-foreground">{scene.tiptapContent ? "Has Content" : "Draft"}</span>
          </div>
          <Link href={`/stories/${storyId}/scenes/${scene._id}`}>
            <Button variant="secondary" size="sm" className="h-7 text-xs">
              Edit
            </Button>
          </Link>
        </div>
      ))}
    </>
  );
}
