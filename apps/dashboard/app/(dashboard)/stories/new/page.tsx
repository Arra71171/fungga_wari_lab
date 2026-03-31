"use client";

import { useMutation } from "convex/react";
import { api } from "@/../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";

export default function NewStoryPage() {
  const router = useRouter();
  const createStory = useMutation(api.stories.create);
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("folk");
  const [language, setLanguage] = useState("meitei");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const slug = generateSlug(title);
      const storyId = await createStory({
        title,
        slug,
        category,
        language,
        tags: [],
      });
      // Redirect to the newly created story's editor
      router.push(`/stories/${storyId}`);
    } catch (error) {
      console.error("Failed to create story:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-heading font-bold tracking-tight">Create New Story</h2>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          Set up the metadata for your new narrative.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Story Title</Label>
          <Input 
            id="title" 
            placeholder="e.g. Khamba and Thoibi" 
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select 
              id="category"
              className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="folk">Folk Tale</option>
              <option value="legend">Legend</option>
              <option value="myth">Mythology</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <select 
              id="language"
              className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="meitei">Meitei</option>
              <option value="english">English</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !title.trim()}>
            {isSubmitting ? "Creating..." : "Create Story"}
          </Button>
        </div>
      </form>
    </div>
  );
}
