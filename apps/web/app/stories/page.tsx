"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
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
} from "lucide-react"
import {
  motion,
  AnimatePresence,
  type Variants,
  useScroll,
  useTransform,
} from "framer-motion"
import { cn } from "@workspace/ui/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type Story = {
  _id: string
  title: string
  slug: string
  description?: string
  category?: string
  language?: string
  status: string
  coverImageUrl?: string
  tags: string[]
  authorName?: string
  authorAvatarUrl?: string
  publishedAt?: number
  viewCount?: number
  readCount?: number
  moral?: string
  attributedAuthor?: string
  chapterCount?: number
}

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
] as const

const LANGUAGES = [
  { value: "Meiteilon", label: "Meiteilon" },
  { value: "meitei", label: "Meitei" },
  { value: "english", label: "English" },
  { value: "Hindi", label: "Hindi" },
] as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Check if a URL is a placeholder (not a real Convex storage / Cloudinary image) */
function isPlaceholderUrl(url?: string): boolean {
  if (!url) return true
  return url.includes("placehold.co") || url.includes("placeholder")
}

/** Get display label for category */
function getCategoryLabel(value?: string): string {
  if (!value) return "Other"
  return value.replace(/_/g, " ")
}

/** Get language display label — normalises case before lookup */
function getLanguageLabel(value?: string): string {
  if (!value) return ""
  // Normalise to lowercase for case-insensitive lookup
  const lower = value.toLowerCase()
  const map: Record<string, string> = {
    en: "English",
    english: "English",
    meitei: "Meitei",
    meiteilon: "Meiteilon",
    hindi: "Hindi",
  }
  return map[lower] ?? value
}

// ─── Animation Presets ────────────────────────────────────────────────────────

const EASE_EXPO = [0.16, 1, 0.3, 1] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_EXPO, delay: i * 0.06 },
  }),
}

const revealLine: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: (i = 0) => ({
    scaleX: 1,
    transition: { duration: 0.6, ease: EASE_EXPO, delay: i * 0.08 },
  }),
}

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

// ─── Cover Image Component (handles fallbacks robustly) ───────────────────────

function CoverImage({
  src,
  alt,
  fill = true,
  priority = false,
  sizes,
  className,
}: {
  src?: string
  alt: string
  fill?: boolean
  priority?: boolean
  sizes?: string
  className?: string
}) {
  const [hasError, setHasError] = React.useState(false)
  const showFallback = !src || isPlaceholderUrl(src) || hasError

  if (showFallback) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cinematic-bg via-cinematic-panel to-cinematic-bg">
        {/* Decorative pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)`,
            backgroundSize: "16px 16px",
          }}
        />
        <div className="relative flex flex-col items-center gap-3 p-6">
          <div className="flex size-16 items-center justify-center border border-brand-ember/20">
            <Flame className="size-8 text-brand-ember/40" />
          </div>
          <span className="max-w-[120px] text-center font-mono text-micro leading-relaxed tracking-wide text-brand-ember/30">
            {alt}
          </span>
        </div>
      </div>
    )
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
  )
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
]

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
            className="flex shrink-0 items-center gap-5 font-sans text-xs font-bold tracking-wide text-primary"
          >
            <Minus className="size-3 shrink-0 opacity-60" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// ─── Story Telemetry Cadence ──────────────────────────────────────────────────

function StoryTelemetry({ story }: { story: Story }) {
  // Generate a pseudo-random rhythm array based on the story ID
  const seed = story._id
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const blockCount =
    story.chapterCount !== undefined && story.chapterCount > 0
      ? story.chapterCount
      : (seed % 5) + 3

  // Make a jagged rhythm array (heights from 1 to 4)
  const blocks = Array.from({ length: Math.min(blockCount, 16) }).map(
    (_, i) => ((seed * (i + 1)) % 4) + 1
  )

  return (
    <div className="pointer-events-none absolute inset-0 z-0 flex flex-col justify-center overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute -right-8 -bottom-16 -rotate-3 transform opacity-[0.02] transition-transform duration-1000 select-none group-hover:scale-105 group-hover:-rotate-2">
        <span className="font-heading text-[180px] leading-none font-black whitespace-nowrap text-foreground uppercase">
          {story.status === "published" ? "ARCHIVE" : "DRAFT"}
        </span>
      </div>

      {/* Telemetry Block - shown in empty space */}
      <div className="absolute right-6 bottom-24 left-6 mt-auto hidden flex-col gap-3 opacity-30 transition-opacity duration-700 group-hover:opacity-100 md:right-8 md:left-8 md:flex lg:right-10 lg:left-10">
        <div className="flex items-center gap-4 font-sans text-micro font-medium tracking-wide text-primary">
          <span>[ UID : {story._id.slice(-6)} ]</span>
          <span className="h-px flex-1 bg-primary/30" />
          <span>Cadence Trace</span>
        </div>
        <div className="flex h-8 items-end gap-[3px]">
          <div className="flex h-full flex-1 items-end gap-1">
            {blocks.map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: "10%" }}
                animate={{ height: `${h * 25}%` }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.05,
                  ease: "easeInOut",
                }}
                className="max-w-[12px] flex-1 bg-primary/40 transition-colors group-hover:bg-primary/60"
                style={{ minHeight: "2px" }}
              />
            ))}
          </div>
          <div className="ml-3 flex h-8 flex-col justify-end border-l border-dashed border-primary/30 pb-0.5 pl-3">
            <span className="font-mono text-micro leading-none tracking-wide text-primary/50 tabular-nums">
              {String(blockCount).padStart(2, "0")} Nodes
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Featured Hero Card ───────────────────────────────────────────────────────

function HeroCard({ story }: { story: Story }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"])

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={0}
      className="group relative overflow-hidden bg-background transition-all duration-500 hover:shadow-brutal-sm"
    >
      <Link
        href={`/stories/${story.slug}`}
        className="relative flex flex-col md:flex-row"
      >
        {/* Portrait Image — Left side on desktop */}
        <div className="relative z-10 aspect-[3/4] w-full shrink-0 overflow-hidden bg-muted md:w-[380px] lg:w-[440px]">
          {!isPlaceholderUrl(story.coverImageUrl) ? (
            <motion.div className="absolute inset-0" style={{ y: imageY }}>
              <CoverImage
                src={story.coverImageUrl}
                alt={story.title}
                priority
                sizes="(max-width: 768px) 100vw, 440px"
                className="transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </motion.div>
          ) : (
            <CoverImage src={undefined} alt={story.title} />
          )}

          {/* Featured badge */}
          <span className="absolute top-4 left-4 z-10 bg-primary px-3 py-1.5 font-mono text-[10px] tracking-wide text-primary-foreground shadow-sm">
            Featured
          </span>
        </div>

        {/* Content — Right side on desktop */}
        <div className="relative flex flex-1 flex-col justify-between gap-4 p-6 md:p-8 lg:p-10">
          <StoryTelemetry story={story} />

          <div className="relative z-10 space-y-4">
            {/* Category + Language */}
            <div className="flex items-center gap-3">
              <motion.div
                variants={revealLine}
                initial="hidden"
                animate="visible"
                custom={0.3}
                className="h-[2px] w-8 bg-primary"
              />
              <span className="font-sans text-fine font-bold font-medium tracking-wide text-primary">
                {getCategoryLabel(story.category)}
              </span>
              <span className="text-muted-foreground/30">·</span>
              <span className="flex items-center gap-1 font-mono text-[10px] tracking-wide text-muted-foreground">
                <Globe className="size-2.5 text-primary" />
                {getLanguageLabel(story.language)}
              </span>
            </div>

            {/* Title */}
            <h2 className="font-heading text-2xl leading-[0.9] font-black tracking-tighter text-foreground uppercase transition-colors duration-300 group-hover:text-primary md:text-3xl lg:text-4xl">
              {story.title}
            </h2>

            {story.description && (
              <p className="line-clamp-3 max-w-lg font-mono text-sm leading-relaxed text-muted-foreground">
                {story.description}
              </p>
            )}

            {story.moral && (
              <p className="line-clamp-2 border-l-2 border-brand-ochre/30 pl-3 font-mono text-xs text-brand-ochre/80 italic">
                &ldquo;{story.moral}&rdquo;
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {story.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="border border-border bg-secondary px-2 py-1 font-sans text-[10px] font-medium tracking-wide text-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {story.chapterCount !== undefined && story.chapterCount > 0 && (
                <span className="flex items-center gap-1 font-sans text-[10px] font-medium tracking-wide text-muted-foreground">
                  <BookOpen className="size-3 text-primary/60" />
                  {story.chapterCount}{" "}
                  {story.chapterCount === 1 ? "chapter" : "chapters"}
                </span>
              )}
            </div>
            <span className="flex items-center gap-2 font-sans text-xs font-bold tracking-wide text-primary transition-all group-hover:gap-3">
              Read
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Portrait Story Card ──────────────────────────────────────────────────────

function StoryCard({ story, index }: { story: Story; index: number }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index + 1}
      className="group relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-brutal-sm"
    >
      <Link
        href={`/stories/${story.slug}`}
        className="flex h-full flex-col bg-background"
      >
        {/* 1. Portrait Cover Compartment */}
        <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-secondary/10">
          <CoverImage
            src={story.coverImageUrl}
            alt={story.title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="grayscale-[20%] transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
          />

          {/* Language badge */}
          <span className="absolute top-2 left-2 z-10 flex items-center gap-1 border border-border bg-background/90 px-2 py-1 font-mono text-[10px] tracking-wide backdrop-blur-sm">
            <Globe className="size-2.5 text-primary" />
            {getLanguageLabel(story.language)}
          </span>

          {/* View count */}
          {(story.viewCount ?? 0) > 0 && (
            <span className="absolute top-2 right-2 z-10 flex items-center gap-1 border border-border bg-background/90 px-2 py-1 font-mono text-[10px] tracking-wide text-muted-foreground backdrop-blur-sm">
              <Eye className="size-2.5" />
              {story.viewCount}
            </span>
          )}
        </div>

        {/* 2. Main Content Compartment */}
        <div className="flex flex-1 flex-col gap-3 bg-background p-4 md:p-5">
          <h3 className="line-clamp-2 font-heading text-base leading-[0.92] font-black tracking-tighter text-foreground uppercase transition-colors group-hover:text-primary md:text-lg">
            {story.title}
          </h3>
          {story.description && (
            <p className="mt-auto line-clamp-2 font-mono text-xs leading-relaxed text-muted-foreground">
              {story.description}
            </p>
          )}
        </div>

        {/* 3. Metadata Bento Bottom Split */}
        <div className="flex shrink-0 items-center justify-between px-5 pt-0 pb-5">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="font-medium tracking-wide text-primary">
              {getCategoryLabel(story.category)}
            </span>
          </div>

          <div className="group/arrow flex items-center gap-2">
            <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground uppercase transition-transform group-hover/arrow:-translate-x-1">
              {story.chapterCount && story.chapterCount > 0 ? (
                <>
                  <BookOpen className="size-3" />
                  {story.chapterCount}
                </>
              ) : (
                "Read"
              )}
            </span>
            <ArrowRight className="size-3 -translate-x-2 text-primary opacity-0 transition-all duration-300 group-hover/arrow:translate-x-0 group-hover/arrow:opacity-100" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
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
        className="group -mx-3 flex items-center gap-5 border-b border-border-subtle px-3 py-4 transition-colors hover:bg-secondary/10"
      >
        {/* Index */}
        <span className="w-6 shrink-0 font-sans text-xs text-muted-foreground tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Portrait Thumb */}
        <div className="relative h-11 w-8 shrink-0 overflow-hidden border border-border-subtle bg-muted">
          <CoverImage
            src={story.coverImageUrl}
            alt={story.title}
            sizes="32px"
            className="transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-sm leading-tight font-black tracking-tighter text-foreground uppercase transition-colors group-hover:text-primary">
            {story.title}
          </p>
          <p className="mt-0.5 font-mono text-[10px] tracking-wide text-muted-foreground">
            {getCategoryLabel(story.category)} ·{" "}
            {getLanguageLabel(story.language)}
          </p>
        </div>

        {/* Tags */}
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          {story.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="border border-border-subtle bg-secondary px-2 py-0.5 font-sans text-[10px] font-medium tracking-wide"
            >
              {t}
            </span>
          ))}
        </div>

        <ArrowRight className="ml-2 size-4 shrink-0 text-primary opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
      </Link>
    </motion.div>
  )
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SkeletonHero() {
  return (
    <div className="col-span-full flex animate-pulse flex-col border border-border bg-background md:flex-row">
      <div className="aspect-[3/4] w-full shrink-0 border-b border-border bg-muted md:w-[380px] md:border-r md:border-b-0" />
      <div className="flex-1 space-y-5 p-8">
        <div className="h-3 w-20 bg-muted" />
        <div className="h-10 w-3/4 bg-muted" />
        <div className="h-4 w-full bg-muted" />
        <div className="h-4 w-2/3 bg-muted" />
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse border border-border bg-background">
      <div className="aspect-[3/4] border-b border-border bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-16 bg-muted" />
        <div className="h-6 w-4/5 bg-muted" />
        <div className="h-3 w-full bg-muted" />
      </div>
    </div>
  )
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function ArchiveStats({ stories }: { stories: Story[] }) {
  const totalStories = stories.length
  const languages = new Set(stories.map((s) => s.language).filter(Boolean))
  const categories = new Set(stories.map((s) => s.category).filter(Boolean))

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={0.5}
      className="mb-4 flex items-center gap-6 py-4"
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-2xl font-black text-primary tabular-nums">
          {totalStories}
        </span>
        <span className="font-mono text-nano tracking-wide text-muted-foreground">
          {totalStories === 1 ? "Manuscript" : "Manuscripts"}
        </span>
      </div>
      <div className="h-4 w-px bg-border" />
      <div className="flex items-center gap-2">
        <span className="font-mono text-2xl font-black text-foreground tabular-nums">
          {languages.size}
        </span>
        <span className="font-mono text-nano tracking-wide text-muted-foreground">
          {languages.size === 1 ? "Language" : "Languages"}
        </span>
      </div>
      <div className="h-4 w-px bg-border" />
      <div className="flex items-center gap-2">
        <span className="font-mono text-2xl font-black text-foreground tabular-nums">
          {categories.size}
        </span>
        <span className="font-mono text-nano tracking-wide text-muted-foreground">
          {categories.size === 1 ? "Category" : "Categories"}
        </span>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StoriesPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [debouncedQuery, setDebouncedQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState<
    string | undefined
  >(undefined)
  const [activeLanguage, setActiveLanguage] = React.useState<
    string | undefined
  >(undefined)
  const [showFilters, setShowFilters] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 320)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const [stories, setStories] = React.useState<Story[] | undefined>(undefined)
  const supabase = React.useMemo(() => createClient(), [])

  React.useEffect(() => {
    async function fetchStories() {
      let query = supabase
        .from("stories")
        .select(
          "id, title, slug, description, category, language, status, cover_image_url, tags, view_count, published_at, moral, attributed_author, chapter_count"
        )
        .eq("status", "published")

      if (activeCategory) {
        // Cast to satisfy the database enum type — value is validated by the UI filter
        query = query.eq(
          "category",
          activeCategory as
            | "creation_myth"
            | "animal_fable"
            | "historical"
            | "legend"
            | "moral_tale"
            | "romance"
            | "adventure"
            | "supernatural"
            | "other"
        )
      }
      if (activeLanguage) {
        query = query.eq("language", activeLanguage)
      }
      if (debouncedQuery) {
        // Full-text search using search_vector
        query = query.textSearch("search_vector", debouncedQuery.trim(), {
          type: "websearch",
          config: "english",
        })
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching stories:", JSON.stringify(error, null, 2))
        setStories([])
        return
      }

      // Map DB row to Story type expected by components
      const mappedStories: Story[] = (data || []).map((row) => ({
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
        publishedAt: row.published_at
          ? new Date(row.published_at).getTime()
          : undefined,
        moral: row.moral || undefined,
        attributedAuthor: row.attributed_author || undefined,
        chapterCount: row.chapter_count ?? 0,
      }))

      setStories(mappedStories)
    }

    fetchStories()
  }, [activeCategory, activeLanguage, debouncedQuery, supabase])

  const displayedStories = stories
  const isLoading = displayedStories === undefined
  const isEmpty =
    !isLoading && (!displayedStories || displayedStories.length === 0)

  // Split: first story = featured hero, rest = grid + list
  const [featured, ...rest] = displayedStories ?? []
  const gridStories = rest.slice(0, 8) // up to 8 in the portrait grid
  const listStories = rest.slice(8) // rest as compact list rows

  // Active filter count for badge
  const activeFilterCount = [activeCategory, activeLanguage].filter(
    Boolean
  ).length

  return (
    <div className="relative min-h-screen bg-background font-sans text-foreground">
      <Navbar />

      {/* ── Compact Page Header ────────────────────────────────────────── */}
      <section className="px-6 pt-28 pb-6 md:px-12">
        <div className="mx-auto max-w-5xl">
          {/* Eyebrow + Title Row */}
          <motion.div
            className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <motion.div
                  variants={revealLine}
                  initial="hidden"
                  animate="visible"
                  custom={0}
                  className="h-[2px] w-6 bg-primary"
                />
                <span className="font-mono text-fine font-bold tracking-ultra text-primary uppercase">
                  Manuscripts Archive
                </span>
              </div>
              <h1 className="font-heading text-4xl leading-[0.9] font-black tracking-tighter text-foreground uppercase md:text-5xl">
                The <span className="text-primary italic">Manuscripts</span>
              </h1>
              <p className="max-w-md font-mono text-xs leading-relaxed text-muted-foreground">
                Oral traditions, folklore, and cultural narratives from
                Kangleipak — preserved in digital form.
              </p>
            </div>

            {/* Search + Filter */}
            <div className="flex max-w-lg shrink-0 items-center gap-3">
              <div className="group relative flex-1">
                <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="story-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search manuscripts…"
                  aria-label="Search manuscripts"
                  className="h-10 rounded-none border border-border bg-background pl-10 font-mono text-sm transition-all focus-visible:border-primary focus-visible:ring-0"
                />
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "relative h-10 shrink-0 gap-2 rounded-none border border-border font-mono text-fine tracking-widest uppercase transition-all hover:border-primary",
                  showFilters && "border-primary bg-primary/5"
                )}
                aria-label="Toggle filters"
              >
                <Filter className="size-3.5" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center bg-primary font-mono text-micro text-primary-foreground">
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
                <div className="flex flex-col gap-6 border-b border-border py-4 md:flex-row">
                  {/* Category filters */}
                  <div className="flex-1">
                    <span className="mb-2 block font-sans text-nano font-medium tracking-wide text-muted-foreground">
                      Category
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() =>
                            setActiveCategory(
                              activeCategory === cat.value
                                ? undefined
                                : cat.value
                            )
                          }
                          className={cn(
                            "border px-2.5 py-1 font-sans text-nano font-medium tracking-wide transition-all",
                            activeCategory === cat.value
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-foreground hover:border-primary/50"
                          )}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language filters */}
                  <div className="shrink-0">
                    <span className="mb-2 block font-sans text-nano font-medium tracking-wide text-muted-foreground">
                      Language
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.value}
                          onClick={() =>
                            setActiveLanguage(
                              activeLanguage === lang.value
                                ? undefined
                                : lang.value
                            )
                          }
                          className={cn(
                            "flex items-center gap-1.5 border px-2.5 py-1 font-sans text-nano font-medium tracking-wide transition-all",
                            activeLanguage === lang.value
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-foreground hover:border-primary/50"
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
                        onClick={() => {
                          setActiveCategory(undefined)
                          setActiveLanguage(undefined)
                        }}
                        className="flex items-center gap-1.5 font-sans text-nano font-medium tracking-wide text-destructive hover:underline"
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
      <TickerBar />

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <section className="px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto max-w-5xl">
          <AnimatePresence mode="wait">
            {/* Loading state */}
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="space-y-6">
                  <SkeletonHero />
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-8 py-32 text-center"
              >
                <div className="flex size-20 items-center justify-center border border-border">
                  <BookOpen className="size-8 text-muted-foreground" />
                </div>
                <div className="max-w-sm space-y-2">
                  <p className="font-heading text-3xl font-black tracking-tighter text-foreground uppercase">
                    The Archive Grows
                  </p>
                  <p className="font-mono text-sm leading-relaxed text-muted-foreground">
                    {debouncedQuery
                      ? `No manuscripts match "${debouncedQuery}". Try another search.`
                      : "No stories published yet. The storytellers are gathering at the fireplace."}
                  </p>
                </div>
                <Link href="/">
                  <Button
                    variant="outline"
                    className="rounded-none border font-mono text-xs font-bold tracking-widest uppercase transition-all hover:border-primary"
                  >
                    Return Home
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* Stories: Editorial layout */}
            {!isLoading &&
              !isEmpty &&
              displayedStories &&
              displayedStories.length > 0 && (
                <motion.div
                  key="stories"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Archive Stats */}
                  <ArchiveStats stories={displayedStories} />

                  {/* ── Featured Hero ── */}
                  {featured && (
                    <div className="mb-12">
                      <HeroCard story={featured} />
                    </div>
                  )}

                  {/* ── Portrait Grid ── */}
                  {gridStories.length > 0 && (
                    <>
                      <div className="mb-8 flex items-center gap-4">
                        <motion.div
                          variants={revealLine}
                          initial="hidden"
                          animate="visible"
                          className="h-px flex-1 bg-border"
                        />
                        <span className="shrink-0 font-mono text-nano tracking-ultra text-muted-foreground uppercase">
                          Collection
                        </span>
                        <motion.div
                          variants={revealLine}
                          initial="hidden"
                          animate="visible"
                          className="h-px flex-1 bg-border"
                        />
                      </div>

                      <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="mb-10 grid grid-cols-2 gap-5 sm:grid-cols-3 md:gap-6 lg:grid-cols-4"
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
                      <div className="my-8 flex items-center gap-4">
                        <motion.div
                          variants={revealLine}
                          initial="hidden"
                          animate="visible"
                          className="h-px flex-1 bg-border"
                        />
                        <span className="shrink-0 font-mono text-nano tracking-ultra text-muted-foreground uppercase">
                          Full Archive
                        </span>
                        <motion.div
                          variants={revealLine}
                          initial="hidden"
                          animate="visible"
                          className="h-px flex-1 bg-border"
                        />
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
      <footer className="border-t border-border px-6 py-6 md:px-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
          <span className="font-mono text-nano tracking-wide text-muted-foreground">
            Fungga Wari Lab © {new Date().getFullYear()}
          </span>
          <span className="font-mono text-nano tracking-wide text-muted-foreground">
            Preserving Kangleipak folk traditions
          </span>
        </div>
      </footer>
    </div>
  )
}
