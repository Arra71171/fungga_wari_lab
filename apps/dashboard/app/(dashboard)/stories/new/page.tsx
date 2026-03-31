"use client";

import { useMutation } from "convex/react";
import { api } from "@/../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";

export default function NewStoryPage() {
  const router = useRouter();
  const createStory = useMutation(api.stories.create);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("folk");
  const [language, setLanguage] = useState("meitei");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const slug = generateSlug(title);
      const storyId = await createStory({
        title,
        slug,
        description: description.trim() || undefined,
        category,
        language,
        tags: [],
      });
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
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Story Title</Label>
          <Input
            id="title"
            placeholder="e.g. Khamba and Thoibi"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {title && (
            <p className="text-[11px] font-mono text-muted-foreground">
              Slug: <span className="text-primary">{generateSlug(title)}</span>
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Description{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="description"
            placeholder="A short summary shown on the public story card…"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="resize-none font-mono text-sm"
          />
        </div>

        {/* Category + Language */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="folk">Folk Tale</option>
              <option value="legend">Legend</option>
              <option value="myth">Mythology</option>
              <option value="historical">Historical</option>
              <option value="animal_fable">Animal Fable</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="meitei">Meitei</option>
              <option value="english">English</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
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
