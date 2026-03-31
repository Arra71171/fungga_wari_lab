"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@workspace/ui/components/button";
import { ArrowRight, BookOpen, Globe } from "lucide-react";
import { motion, type Variants } from "framer-motion";

type Story = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  category: string;
  language: string;
  status: string;
  coverImageUrl?: string;
  tags: string[];
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 },
  }),
};

function StoryCard({ story, index }: { story: Story; index: number }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      className="group relative flex flex-col bg-background border border-border shadow-brutal hover:shadow-brutal-primary transition-shadow duration-300 overflow-hidden"
    >
      {/* Cover Image */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted">
        {story.coverImageUrl ? (
          <Image
            src={story.coverImageUrl}
            alt={story.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
            <BookOpen className="size-10 text-muted-foreground/30" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        {/* Language badge */}
        <span className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-widest text-primary bg-background/90 border border-border px-2 py-1 flex items-center gap-1.5">
          <Globe className="size-3" />
          {story.language}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6 gap-3">
        {/* Category */}
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-bold">
          {story.category.replace(/_/g, " ")}
        </span>

        {/* Title */}
        <h2 className="font-heading text-lg font-black uppercase tracking-tight leading-tight text-foreground group-hover:text-primary transition-colors">
          {story.title}
        </h2>

        {/* Description */}
        {story.description && (
          <p className="text-xs text-muted-foreground font-mono leading-relaxed line-clamp-2">
            {story.description}
          </p>
        )}

        {/* Tags */}
        {story.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {story.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground border border-border px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-4 border-t border-border">
          <Link href={`/story/${story.slug}`}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full rounded-none font-mono uppercase tracking-widest text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            >
              Read Story
              <ArrowRight className="ml-2 size-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-background border border-border animate-pulse">
      <div className="aspect-[16/9] bg-muted" />
      <div className="p-6 space-y-3">
        <div className="h-3 w-20 bg-muted rounded-none" />
        <div className="h-5 w-3/4 bg-muted rounded-none" />
        <div className="h-3 w-full bg-muted rounded-none" />
        <div className="h-3 w-2/3 bg-muted rounded-none" />
      </div>
    </div>
  );
}

export default function StoriesPage() {
  const allStories = useQuery(api.stories.getAll);

  const publishedStories = React.useMemo(() => {
    if (!allStories) return null;
    return allStories.filter((s: Story) => s.status === "published");
  }, [allStories]);

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans">
      <Navbar />

      {/* Page Header */}
      <section className="pt-32 pb-12 px-6 md:px-12 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-[1px] w-8 bg-primary" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary font-bold">
              Story Archive
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-black uppercase tracking-tighter leading-[0.88] mb-4">
            The Collection
          </h1>
          <p className="text-sm text-muted-foreground font-mono max-w-xl leading-relaxed">
            Oral traditions, folk lore, and cultural narratives from Kangleipak — preserved in digital form for future generations.
          </p>
        </div>
      </section>

      {/* Story Grid */}
      <section className="py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {publishedStories === null ? (
            /* Loading skeletons */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : publishedStories.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-32 text-center gap-6">
              <div className="size-16 border border-border flex items-center justify-center text-muted-foreground">
                <BookOpen className="size-8" />
              </div>
              <div className="space-y-2">
                <p className="font-heading text-2xl font-black uppercase tracking-tighter text-foreground">
                  The Archive Grows
                </p>
                <p className="text-sm text-muted-foreground font-mono max-w-xs leading-relaxed">
                  No stories published yet. The storytellers are gathering at the fireplace.
                </p>
              </div>
              <Link href="/">
                <Button variant="outline" className="rounded-none font-mono uppercase tracking-widest text-xs">
                  Return Home
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedStories.map((story: Story, i: number) => (
                <StoryCard key={story._id} story={story as Story} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
