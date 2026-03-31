"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../../convex/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { Plus, Search, BookOpen, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@workspace/ui/components/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";

export default function StoriesPage() {
  const router = useRouter();
  const [isNewDialogOpen, setIsNewDialogOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newCategory, setNewCategory] = React.useState("folktale");
  const [isCreating, setIsCreating] = React.useState(false);

  const createStory = useMutation(api.stories.createWithInitialScene);
  const storiesQuery = useQuery(api.stories?.getAll || (() => [] as any));
  const stories = storiesQuery ?? [];

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6 shrink-0">
        <div>
          <h1 className="font-display text-4xl italic tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
            Stories
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Manage your folklore archive and track ongoing translations.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsNewDialogOpen(true)} className="gap-2 shadow-sm shadow-brand-ember/20">
            <Plus className="size-4" /> New Story
          </Button>
        </div>
      </div>

      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input 
          placeholder="Search by title or category..." 
          className="pl-9 h-10 border-border/50 bg-secondary/30 focus-visible:ring-primary/50"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-border/50 rounded-none bg-secondary/10">
            <BookOpen className="size-10 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl font-bold font-heading mb-2">No Stories in the Archive</h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Establish the first manuscript. Gather your field notes, audio recordings, or translations to begin.
            </p>
            <Button onClick={() => setIsNewDialogOpen(true)}>
              <Plus className="size-4 mx-2" /> Start a Story
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Story Cards */}
            {stories.map((story) => {
              // Extract logic: The previous pipeline linked to scene directly if one existed, but lacking a direct lookup we can route to an overview or the first scene.
              // For minimalism, assuming we can fetch its first scene on the fly or just link to an overview. 
              // Wait, the new pipeline uses `/stories/[id]/scenes/[sceneId]`, but without sceneId we can't link directly. Let's just link to `/stories/${story._id}` which should redirect or handle it.
              return (
              <Link 
                href={`/stories/${story._id}`} 
                key={story._id}
                className="group block p-5 border border-border/40 bg-secondary/20 rounded-none hover:border-primary/50 transition-all hover:shadow-sm hover:shadow-brand-ember/5 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase font-mono font-bold tracking-wider text-primary/80 mb-1">
                      {story.category || "Uncategorized"}
                    </span>
                    <h3 className="font-heading font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                      {story.title}
                    </h3>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
                  {story.description || "No description provided."}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono mt-auto pt-4 border-t border-border/30">
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3" />
                    <span className="capitalize">{story.status || "Draft"}</span>
                  </div>
                  <div className="flex gap-1">
                    {(story.tags || []).slice(0, 2).map((tag: string) => (
                      <span key={tag} className="px-1.5 py-0.5 bg-background border border-border/50 rounded-none">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-none border border-border/40 shadow-brutal bg-background">
          <DialogHeader>
            <DialogTitle className="font-heading">Establish Manuscript</DialogTitle>
            <DialogDescription className="font-mono text-xs">
              Define the bedrock details of this lore piece.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="font-mono text-xs text-muted-foreground">Title</Label>
              <Input 
                id="title" 
                value={newTitle} 
                onChange={(e) => setNewTitle(e.target.value)} 
                className="bg-secondary/30 rounded-none border-border/50" 
                placeholder="The Tale of Sandrembi and Chaisra" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category" className="font-mono text-xs text-muted-foreground">Category</Label>
              <Input 
                id="category" 
                value={newCategory} 
                onChange={(e) => setNewCategory(e.target.value)} 
                className="bg-secondary/30 rounded-none border-border/50" 
                placeholder="creation_myth, fable, historical..." 
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              disabled={isCreating || !newTitle.trim()} 
              onClick={async () => {
                setIsCreating(true);
                try {
                  const { storyId, sceneId } = await createStory({
                    title: newTitle,
                    slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    category: newCategory,
                    language: 'meitei', // Default for project context
                  });
                  router.push(`/stories/${storyId}/scenes/${sceneId}`);
                } catch (e) {
                  console.error(e);
                } finally {
                  setIsCreating(false);
                  setIsNewDialogOpen(false);
                }
              }}
              className="gap-2 shadow-sm rounded-none"
            >
              {isCreating ? "Initializing..." : "Create Manuscript"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
