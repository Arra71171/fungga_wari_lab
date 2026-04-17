"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Filter,
  Globe,
  Search,
  Minus,
  X,
  Flame,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence, type Variants, useScroll, useTransform } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";


// ─── Types ────────────────────────────────────────────────────────────────────

type Story = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  language?: string;
  status: string;
  coverImageUrl?: string;
  tags: string[];
  authorName?: string;
  authorAvatarUrl?: string;
  publishedAt?: number;
  viewCount?: number;
  readCount?: number;
  moral?: string;
  chapterCount?: number;
};

const CATEGORIES = [
  { value: "creation_myth", label: "Creation Myth" },
  { value: "animal_fable", label: "Animal Fable" },
  { value: "historical", label: "Historical" },
  { value: "legend", label: "Legend" },
  { value: "moral_tale", label: "Moral Tale" },
  { value: "romance", label: "Romance" },
  { value: "adventure", label: "Adventure" },
  { value: "supernatural", label: "Supernatural" },
  { value: "folk", label: "Folk" },
  { value: "folktale", label: "Folktale" },
  { value: "other", label: "Other" },
] as const;

const LANGUAGES = [
  { value: "Meiteilon", label: "Meiteilon" },
  { value: "meitei", label: "Meitei" },
  { value: "English", label: "English" },
  { value: "en", label: "English" },
  { value: "Hindi", label: "Hindi" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Check if a URL is a placeholder (not a real Convex storage / Cloudinary image) */
function isPlaceholderUrl(url?: string): boolean {
  if (!url) return true;
  return url.includes("placehold.co") || url.includes("placeholder");
}

/** Get display label for category */
function getCategoryLabel(value?: string): string {
  if (!value) return "Other";
  return value.replace(/_/g, " ");
}

/** Get language display label */
function getLanguageLabel(value?: string): string {
  if (!value) return "";
  const map: Record<string, string> = { en: "English", meitei: "Meitei", Meiteilon: "Meiteilon" };
  return map[value] ?? value;
}

// ─── Animation Presets ────────────────────────────────────────────────────────

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_EXPO, delay: i * 0.06 },
  }),
};

const revealLine: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: (i = 0) => ({
    scaleX: 1,
    transition: { duration: 0.6, ease: EASE_EXPO, delay: i * 0.08 },
  }),
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

// ─── Cover Image Component (handles fallbacks robustly) ───────────────────────

function CoverImage({
  src,
  alt,
  fill = true,
  priority = false,
  sizes,
  className,
}: {
  src?: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const [hasError, setHasError] = React.useState(false);
  const showFallback = !src || isPlaceholderUrl(src) || hasError;

  if (showFallback) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cinematic-bg via-cinematic-panel to-cinematic-bg">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)`,
            backgroundSize: "16px 16px",
          }}
        />
        <div className="relative flex flex-col items-center gap-3 p-6">
          <div className="size-16 border border-brand-ember/20 flex items-center justify-center">
            <Flame className="size-8 text-brand-ember/40" />
          </div>
          <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-brand-ember/30 text-center max-w-[120px] leading-relaxed">
            {alt}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      priority={priority}
      sizes={sizes}
      className={cn("object-cover", className)}
      onError={() => setHasError(true)}
    />
  );
}

// ─── Ticker Bar ───────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  "Kangleipak Folk Archive",
  "Oral Traditions Preserved",
  "Meitei Heritage Stories",
  "Mythology & Legend",
  "Living Manuscripts",
  "Kangleipak Folk Archive",
  "Oral Traditions Preserved",
  "Meitei Heritage Stories",
  "Mythology & Legend",
  "Living Manuscripts",
];

function TickerBar() {
  return (
    <div className="w-full overflow-hidden border-y border-border bg-primary/[0.03] py-2.5">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      >
        {TICKER_ITEMS.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-5 font-mono text-[10px] uppercase tracking-[0.25em] text-primary font-bold shrink-0"
          >
            <Minus className="size-3 shrink-0 opacity-60" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Story Telemetry Cadence ──────────────────────────────────────────────────

function StoryTelemetry({ story }: { story: Story }) {
  // Generate a pseudo-random rhythm array based on the story ID
  const seed = story._id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const blockCount = story.chapterCount !== undefined && story.chapterCount > 0 
    ? story.chapterCount 
    : (seed % 5) + 3;
  
  // Make a jagged rhythm array (heights from 1 to 4)
  const blocks = Array.from({ length: Math.min(blockCount, 16) }).map((_, i) => ((seed * (i + 1)) % 4) + 1);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none flex flex-col justify-center overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute -right-8 -bottom-16 select-none opacity-[0.02] transform -rotate-3 transition-transform duration-1000 group-hover:-rotate-2 group-hover:scale-105">
        <span className="font-heading font-black text-[180px] leading-none uppercase whitespace-nowrap text-foreground">
          {story.status === "published" ? "ARCHIVE" : "DRAFT"}
        </span>
      </div>

      {/* Telemetry Block - shown in empty space */}
      <div className="hidden md:flex flex-col gap-3 mt-auto absolute bottom-24 left-6 md:left-8 lg:left-10 right-6 md:right-8 lg:right-10 opacity-30 group-hover:opacity-100 transition-opacity duration-700">
        <div className="flex items-center gap-4 text-[8px] font-mono uppercase tracking-[0.3em] text-primary">
          <span>[ UID : {story._id.slice(-6)} ]</span>
          <span className="h-px bg-primary/30 flex-1" />
          <span>Cadence Trace</span>
        </div>
        <div className="flex items-end gap-[3px] h-8">
          <div className="flex items-end gap-1 flex-1 h-full">
            {blocks.map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: "10%" }}
                animate={{ height: `${h * 25}%` }}
                transition={{ duration: 1.2, delay: i * 0.05, ease: "easeInOut" }}
                className="flex-1 max-w-[12px] bg-primary/40 group-hover:bg-primary/60 transition-colors"
                style={{ minHeight: "2px" }}
              />
            ))}
          </div>
          <div className="h-8 border-l border-dashed border-primary/30 ml-3 pl-3 flex flex-col justify-end pb-0.5">
            <span className="text-[8px] font-mono text-primary/50 tabular-nums uppercase tracking-widest leading-none">
              {String(blockCount).padStart(2, "0")} Nodes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Featured Hero Card ───────────────────────────────────────────────────────

function HeroCard({ story }: { story: Story }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={0}
      className="group relative overflow-hidden border border-border bg-background"
    >
      <Link href={`/stories/${story.slug}`} className="flex flex-col md:flex-row relative">
        {/* Portrait Image — Left side on desktop */}
        <div className="relative w-full md:w-[380px] lg:w-[440px] shrink-0 aspect-[3/4] overflow-hidden bg-muted border-b md:border-b-0 md:border-r border-border z-10">
          {!isPlaceholderUrl(story.coverImageUrl) ? (
            <motion.div className="absolute inset-0" style={{ y: imageY }}>
              <CoverImage
                src={story.coverImageUrl}
                alt={story.title}
                priority
                sizes="(max-width: 768px) 100vw, 440px"
                className="group-hover:scale-[1.03] transition-transform duration-700"
              />
            </motion.div>
          ) : (
            <CoverImage src={undefined} alt={story.title} />
          )}

          {/* Featured badge */}
          <span className="absolute top-4 left-4 z-10 font-mono text-[9px] uppercase tracking-[0.3em] text-primary-foreground bg-primary px-3 py-1.5 shadow-sm">
            Featured
          </span>
        </div>

        {/* Content — Right side on desktop */}
        <div className="flex flex-col justify-between flex-1 p-6 md:p-8 lg:p-10 gap-4 relative">
          
          <StoryTelemetry story={story} />

          <div className="space-y-4 relative z-10">
            {/* Category + Language */}
            <div className="flex items-center gap-3">
              <motion.div variants={revealLine} initial="hidden" animate="visible" custom={0.3}
                className="h-[2px] w-8 bg-primary"
              />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary font-bold">
                {getCategoryLabel(story.category)}
              </span>
              <span className="text-muted-foreground/30">·</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <Globe className="size-2.5 text-primary" />
                {getLanguageLabel(story.language)}
              </span>
            </div>

            {/* Title */}
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter leading-[0.9] text-foreground group-hover:text-primary transition-colors duration-300">
              {story.title}
            </h2>

            {story.description && (
              <p className="text-sm text-muted-foreground font-mono leading-relaxed line-clamp-3 max-w-lg">
                {story.description}
              </p>
            )}

            {story.moral && (
              <p className="text-xs text-brand-ochre/80 font-mono italic border-l-2 border-brand-ochre/30 pl-3 line-clamp-2">
                &ldquo;{story.moral}&rdquo;
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {story.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[9px] font-mono uppercase tracking-widest text-foreground bg-secondary border border-border px-2 py-1">
                    {tag}
                  </span>
                ))}
              </div>
              {story.chapterCount !== undefined && story.chapterCount > 0 && (
                <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <BookOpen className="size-3 text-primary/60" />
                  {story.chapterCount} {story.chapterCount === 1 ? "chapter" : "chapters"}
                </span>
              )}
            </div>
            <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary font-bold group-hover:gap-3 transition-all">
              Read
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Portrait Story Card ──────────────────────────────────────────────────────

function StoryCard({ story, index }: { story: Story; index: number }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index + 1}
      className="group relative flex flex-col border border-border bg-border gap-px overflow-hidden hover:border-primary/50 hover:-translate-y-0.5 transition-all duration-300"
    >
      <Link href={`/stories/${story.slug}`} className="flex flex-col h-full bg-border gap-px">
        {/* 1. Portrait Cover Compartment */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-muted shrink-0">
          <CoverImage
            src={story.coverImageUrl}
            alt={story.title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="group-hover:scale-[1.03] grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
          />

          {/* Language badge */}
          <span className="absolute top-2 left-2 z-10 font-mono text-[9px] uppercase tracking-widest bg-background/90 border border-border px-2 py-1 flex items-center gap-1 backdrop-blur-sm">
            <Globe className="size-2.5 text-primary" />
            {getLanguageLabel(story.language)}
          </span>

          {/* View count */}
          {(story.viewCount ?? 0) > 0 && (
            <span className="absolute top-2 right-2 z-10 font-mono text-[8px] uppercase tracking-widest bg-background/90 border border-border px-2 py-1 flex items-center gap-1 backdrop-blur-sm text-muted-foreground">
              <Eye className="size-2.5" />
              {story.viewCount}
            </span>
          )}
        </div>

        {/* 2. Main Content Compartment */}
        <div className="flex flex-col flex-1 p-4 gap-2 bg-background">
          <h3 className="font-heading text-lg font-black uppercase tracking-tighter leading-[0.92] text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {story.title}
          </h3>
          {story.description && (
            <p className="text-xs text-muted-foreground font-mono leading-relaxed line-clamp-2 mt-auto">
              {story.description}
            </p>
          )}
        </div>

        {/* 3. Metadata Bento Bottom Split */}
        <div className="grid grid-cols-2 gap-px shrink-0">
          <div className="bg-background p-3 flex flex-col justify-center items-center text-center">
             <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">Category</span>
             <span className="text-[9px] uppercase font-bold tracking-[0.25em] font-mono text-primary truncate w-full px-1">
               {getCategoryLabel(story.category)}
             </span>
          </div>

          <div className="bg-background p-3 flex flex-col justify-center items-center text-center relative overflow-hidden group/arrow">
             <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">
               {story.chapterCount && story.chapterCount > 0 ? "Chapters" : "Read"}
             </span>
             <div className="flex items-center gap-2 transition-transform duration-300 group-hover/arrow:-translate-y-6">
                <span className="text-[10px] uppercase font-mono text-muted-foreground/60 flex items-center gap-1">
                  {story.chapterCount && story.chapterCount > 0 ? (
                    <>
                      <BookOpen className="size-2.5" />
                      {story.chapterCount}
                    </>
                  ) : (
                    <ArrowRight className="size-3 text-muted-foreground/40" />
                  )}
                </span>
             </div>
             {/* Hidden Arrow to Slide Up */}
             <div className="absolute inset-0 flex items-center justify-center translate-y-6 transition-transform duration-300 group-hover/arrow:translate-y-0 bg-primary/5">
                <ArrowRight className="size-4 text-primary animate-pulse" />
             </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── List Row (compact, for 7+ stories) ───────────────────────────────────────

function ListRow({ story, index }: { story: Story; index: number }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index * 0.5}
    >
      <Link
        href={`/stories/${story.slug}`}
        className="group flex items-center gap-5 py-4 border-b border-border hover:bg-secondary/30 px-3 -mx-3 transition-colors"
      >
        {/* Index */}
        <span className="font-mono text-[10px] text-muted-foreground w-6 shrink-0 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Portrait Thumb */}
        <div className="relative shrink-0 w-8 h-11 border border-border overflow-hidden bg-muted">
          <CoverImage
            src={story.coverImageUrl}
            alt={story.title}
            sizes="32px"
            className="group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-heading font-black uppercase tracking-tighter text-sm leading-tight text-foreground group-hover:text-primary transition-colors truncate">
            {story.title}
          </p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">
            {getCategoryLabel(story.category)} · {getLanguageLabel(story.language)}
          </p>
        </div>

        {/* Tags */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {story.tags.slice(0, 2).map((t) => (
            <span key={t} className="text-[8px] font-mono uppercase tracking-widest bg-secondary border border-border px-2 py-0.5">
              {t}
            </span>
          ))}
        </div>

        <ArrowRight className="size-4 text-primary shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all ml-2" />
      </Link>
    </motion.div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SkeletonHero() {
  return (
    <div className="col-span-full border border-border animate-pulse bg-background flex flex-col md:flex-row">
      <div className="w-full md:w-[380px] aspect-[3/4] bg-muted border-b md:border-b-0 md:border-r border-border shrink-0" />
      <div className="flex-1 p-8 space-y-5">
        <div className="h-3 w-20 bg-muted" />
        <div className="h-10 w-3/4 bg-muted" />
        <div className="h-4 w-full bg-muted" />
        <div className="h-4 w-2/3 bg-muted" />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="border border-border animate-pulse bg-background">
      <div className="aspect-[3/4] bg-muted border-b border-border" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 bg-muted" />
        <div className="h-6 w-4/5 bg-muted" />
        <div className="h-3 w-full bg-muted" />
      </div>
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function ArchiveStats({ stories }: { stories: Story[] }) {
  const totalStories = stories.length;
  const languages = new Set(stories.map((s) => s.language).filter(Boolean));
  const categories = new Set(stories.map((s) => s.category).filter(Boolean));

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={0.5}
      className="flex items-center gap-6 py-4"
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-2xl font-black text-primary tabular-nums">{totalStories}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          {totalStories === 1 ? "Manuscript" : "Manuscripts"}
        </span>
      </div>
      <div className="h-4 w-px bg-border" />
      <div className="flex items-center gap-2">
        <span className="font-mono text-2xl font-black text-foreground tabular-nums">{languages.size}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          {languages.size === 1 ? "Language" : "Languages"}
        </span>
      </div>
      <div className="h-4 w-px bg-border" />
      <div className="flex items-center gap-2">
        <span className="font-mono text-2xl font-black text-foreground tabular-nums">{categories.size}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          {categories.size === 1 ? "Category" : "Categories"}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StoriesPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<string | undefined>(undefined);
  const [activeLanguage, setActiveLanguage] = React.useState<string | undefined>(undefined);
  const [showFilters, setShowFilters] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 320);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [stories, setStories] = React.useState<Story[] | undefined>(undefined);
  const supabase = createClient();

  React.useEffect(() => {
    async function fetchStories() {
      let query = supabase
        .from("stories")
        .select("id, title, slug, description, category, language, status, cover_image_url, tags, view_count, published_at")
        .eq("status", "published");

      if (activeCategory) {
        // Cast to satisfy the database enum type — value is validated by the UI filter
        query = query.eq("category", activeCategory as "creation_myth" | "animal_fable" | "historical" | "legend" | "moral_tale" | "romance" | "adventure" | "supernatural" | "other");
      }
      if (activeLanguage) {
        query = query.eq("language", activeLanguage);
      }
      if (debouncedQuery) {
        // basic ilike search on title or description
        query = query.or(`title.ilike.%${debouncedQuery}%,description.ilike.%${debouncedQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching stories:", error);
        setStories([]);
        return;
      }

      // Map DB row to Story type expected by components
      const mappedStories: Story[] = (data || []).map(row => ({
        _id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description || undefined,
        category: row.category || undefined,
        language: row.language || undefined,
        status: row.status as string,
        coverImageUrl: row.cover_image_url || undefined,
        tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
        viewCount: row.view_count || 0,
        publishedAt: row.published_at ? new Date(row.published_at).getTime() : undefined,
      }));

      setStories(mappedStories);
    }

    fetchStories();
  }, [activeCategory, activeLanguage, debouncedQuery]);

  const displayedStories = stories;
  const isLoading = displayedStories === undefined;
  const isEmpty = !isLoading && (!displayedStories || displayedStories.length === 0);

  // Split: first story = featured hero, rest = grid + list
  const [featured, ...rest] = displayedStories ?? [];
  const gridStories = rest.slice(0, 8);   // up to 8 in the portrait grid
  const listStories = rest.slice(8);      // rest as compact list rows

  // Active filter count for badge
  const activeFilterCount = [activeCategory, activeLanguage].filter(Boolean).length;

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans">
      <Navbar />

      {/* ── Compact Page Header ────────────────────────────────────────── */}
      <section className="pt-28 pb-0 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">

          {/* Eyebrow + Title Row */}
          <motion.div
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6"
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <motion.div variants={revealLine} initial="hidden" animate="visible" custom={0}
                  className="h-[2px] w-6 bg-primary"
                />
                <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-primary font-bold">
                  Manuscripts Archive
                </span>
              </div>
              <h1 className="font-heading text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] text-foreground">
                The <span className="italic text-primary">Manuscripts</span>
              </h1>
              <p className="text-xs text-muted-foreground font-mono leading-relaxed max-w-md">
                Oral traditions, folklore, and cultural narratives from Kangleipak — preserved in digital form.
              </p>
            </div>

            {/* Search + Filter */}
            <div className="flex gap-3 max-w-lg items-center shrink-0">
              <div className="relative flex-1 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="story-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search manuscripts…"
                  aria-label="Search manuscripts"
                  className="h-10 font-mono pl-10 rounded-none border border-border bg-background focus-visible:ring-0 focus-visible:border-primary transition-all text-sm"
                />
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "h-10 rounded-none border border-border font-mono uppercase text-[10px] tracking-widest gap-2 hover:border-primary transition-all shrink-0 relative",
                  showFilters && "border-primary bg-primary/5",
                )}
                aria-label="Toggle filters"
              >
                <Filter className="size-3.5" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 size-4 bg-primary text-primary-foreground font-mono text-[8px] flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
          </motion.div>

          {/* ── Filter bar ── */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE_EXPO }}
                className="overflow-hidden"
              >
                <div className="py-4 flex flex-col md:flex-row gap-6 border-b border-border">
                  {/* Category filters */}
                  <div className="flex-1">
                    <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-muted-foreground block mb-2">Category</span>
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => setActiveCategory(activeCategory === cat.value ? undefined : cat.value)}
                          className={cn(
                            "text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 border transition-all",
                            activeCategory === cat.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-foreground border-border hover:border-primary/50",
                          )}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language filters */}
                  <div className="shrink-0">
                    <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-muted-foreground block mb-2">Language</span>
                    <div className="flex flex-wrap gap-1.5">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.value}
                          onClick={() => setActiveLanguage(activeLanguage === lang.value ? undefined : lang.value)}
                          className={cn(
                            "text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 border flex items-center gap-1.5 transition-all",
                            activeLanguage === lang.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-foreground border-border hover:border-primary/50",
                          )}
                        >
                          <Globe className="size-2.5" />
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear filters */}
                  {(activeCategory || activeLanguage) && (
                    <div className="flex items-end">
                      <button
                        onClick={() => { setActiveCategory(undefined); setActiveLanguage(undefined); }}
                        className="text-[9px] font-mono uppercase tracking-widest text-destructive flex items-center gap-1.5 hover:underline"
                      >
                        <X className="size-3" />
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* ── Ticker ──────────────────────────────────────────────────────── */}
      <div className="mt-6">
        <TickerBar />
      </div>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <section className="py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Loading state */}
            {isLoading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="space-y-6">
                  <SkeletonHero />
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Empty state */}
            {isEmpty && !isLoading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-32 text-center gap-8"
              >
                <div className="size-20 border border-border flex items-center justify-center">
                  <BookOpen className="size-8 text-muted-foreground" />
                </div>
                <div className="space-y-2 max-w-sm">
                  <p className="font-heading text-3xl font-black uppercase tracking-tighter text-foreground">
                    The Archive Grows
                  </p>
                  <p className="text-sm text-muted-foreground font-mono leading-relaxed">
                    {debouncedQuery
                      ? `No manuscripts match "${debouncedQuery}". Try another search.`
                      : "No stories published yet. The storytellers are gathering at the fireplace."}
                  </p>
                </div>
                <Link href="/">
                  <Button
                    variant="outline"
                    className="rounded-none font-mono uppercase font-bold tracking-widest text-xs border hover:border-primary transition-all"
                  >
                    Return Home
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* Stories: Editorial layout */}
            {!isLoading && !isEmpty && displayedStories && displayedStories.length > 0 && (
              <motion.div key="stories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                {/* Archive Stats */}
                <ArchiveStats stories={displayedStories} />

                {/* ── Featured Hero ── */}
                {featured && (
                  <div className="mb-8">
                    <HeroCard story={featured} />
                  </div>
                )}

                {/* ── Portrait Grid ── */}
                {gridStories.length > 0 && (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <motion.div variants={revealLine} initial="hidden" animate="visible" className="h-px flex-1 bg-border" />
                      <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-muted-foreground shrink-0">
                        Collection
                      </span>
                      <motion.div variants={revealLine} initial="hidden" animate="visible" className="h-px flex-1 bg-border" />
                    </div>

                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8"
                    >
                      {gridStories.map((s, i) => (
                        <StoryCard key={s._id} story={s} index={i} />
                      ))}
                    </motion.div>
                  </>
                )}

                {/* ── List rows for 9+ results ── */}
                {listStories.length > 0 && (
                  <>
                    <div className="flex items-center gap-4 my-8">
                      <motion.div variants={revealLine} initial="hidden" animate="visible" className="h-px flex-1 bg-border" />
                      <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-muted-foreground shrink-0">
                        Full Archive
                      </span>
                      <motion.div variants={revealLine} initial="hidden" animate="visible" className="h-px flex-1 bg-border" />
                    </div>
                    <div className="border-t border-border">
                      {listStories.map((s, i) => (
                        <ListRow key={s._id} story={s} index={i} />
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border px-6 md:px-12 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            Fungga Wari Lab © {new Date().getFullYear()}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            Preserving Kangleipak folk traditions
          </span>
        </div>
      </footer>
    </div>
  );
}
