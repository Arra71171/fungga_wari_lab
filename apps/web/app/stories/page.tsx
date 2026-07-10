"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/layout/Navbar"
import { ExpandableCard } from "@workspace/ui/components/expandable-card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  ArrowRight,
  BookOpen,
  Filter,
  Globe,
  Search,
  X,
  Flame,
} from "lucide-react"
import {
  motion,
  AnimatePresence,
  type Variants,
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

function isPlaceholderUrl(url?: string): boolean {
  if (!url) return true
  return url.includes("placehold.co") || url.includes("placeholder")
}

function getCategoryLabel(value?: string): string {
  if (!value) return "Other"
  return value.replace(/_/g, " ")
}

function getLanguageLabel(value?: string): string {
  if (!value) return ""
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
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_EXPO, delay: i * 0.05 },
  }),
}

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

// ─── Cover Image (handles fallbacks robustly) ─────────────────────────────────

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
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)`,
            backgroundSize: "16px 16px",
          }}
        />
        <div className="relative flex flex-col items-center gap-2 p-4">
          <div className="flex size-12 items-center justify-center border border-brand-ember/20">
            <Flame className="size-6 text-brand-ember/40" />
          </div>
          <span className="max-w-[100px] text-center font-mono text-[9px] leading-relaxed tracking-wide text-brand-ember/30">
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

// ─── Expanded Story View (shared modal content) ───────────────────────────────

function ExpandedStoryView({ story }: { story: Story }) {
  const layoutId = `story-${story._id}`

  return (
    <div className="flex h-full flex-col bg-background md:w-full md:flex-row">
      {/* Image — stacked on mobile, pinned left on desktop */}
      <motion.div
        layoutId={`image-${layoutId}`}
        className="relative h-64 w-full shrink-0 overflow-hidden bg-secondary/10 md:h-full md:w-[40%]"
      >
        <CoverImage
          src={story.coverImageUrl}
          alt={story.title}
          sizes="(max-width: 768px) 100vw, 400px"
        />
        <motion.span
          layoutId={`badge-${layoutId}`}
          className="absolute top-4 left-4 z-10 flex items-center gap-1 border border-border bg-background/90 px-3 py-1.5 font-mono text-xs tracking-wide backdrop-blur-sm"
        >
          <Globe className="size-3 text-primary" />
          {getLanguageLabel(story.language)}
        </motion.span>
      </motion.div>

      {/* Content — scrollable on mobile, fills right on desktop */}
      <div className="flex flex-1 flex-col overflow-y-auto p-6 md:w-[60%] md:p-8">
        {/* Header */}
        <div className="pb-4">
          <span className="mb-2 block font-mono text-xs font-medium tracking-widest text-primary uppercase">
            {getCategoryLabel(story.category)}
          </span>
          <motion.h3
            layoutId={`title-${layoutId}`}
            className="font-heading text-2xl font-black tracking-tighter text-foreground uppercase md:text-4xl"
          >
            {story.title}
          </motion.h3>
        </div>

        {/* Body */}
        <div className="flex flex-col pt-4 pb-0">
          <div className="w-full">
            {story.description && (
              <motion.p
                layoutId={`desc-${layoutId}`}
                className="font-sans text-sm leading-relaxed text-muted-foreground md:text-base"
              >
                {story.description}
              </motion.p>
            )}

          </div>

          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 font-mono text-xs">
            {story.attributedAuthor && (
              <div>
                <span className="mb-1 block tracking-widest text-muted-foreground uppercase">
                  Attributed To
                </span>
                <span className="text-foreground">{story.attributedAuthor}</span>
              </div>
            )}
            <div>
              <span className="mb-1 block tracking-widest text-muted-foreground uppercase">
                Chapters
              </span>
              <span className="flex items-center gap-2 text-foreground">
                <BookOpen className="size-4 text-primary/60" />
                {story.chapterCount || 0} Nodes
              </span>
            </div>
            <div>
              <span className="mb-1 block tracking-widest text-muted-foreground uppercase">
                Archive Status
              </span>
              <span className="text-foreground">
                {story.status === "published" ? "Verified" : "Draft"}
              </span>
            </div>
            {story.tags.length > 0 && (
              <div>
                <span className="mb-1 block tracking-widest text-muted-foreground uppercase">
                  Tags
                </span>
                <div className="flex flex-wrap gap-1">
                  {story.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-border bg-secondary px-2 py-0.5 text-[10px] tracking-wide text-foreground uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-auto pt-6">
          <Link href={`/stories/${story.slug}`} className="block">
            <Button size="sm" className="w-full rounded-none font-mono text-xs tracking-widest uppercase">
              Enter the Archive
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Story Card (Nordic Minimal) ──────────────────────────────────────────────

function StoryCard({ story, index }: { story: Story; index: number }) {
  const layoutId = `story-${story._id}`

  const trigger = (
    <div className="flex h-full flex-col bg-background">
      {/* Portrait Cover — clean, no overlapping badges */}
      <motion.div
        layoutId={`image-${layoutId}`}
        className="relative aspect-[3/4] w-full overflow-hidden bg-secondary/10"
      >
        <CoverImage
          src={story.coverImageUrl}
          alt={story.title}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="transition-transform duration-700 group-hover/expandable:scale-[1.03]"
        />
        {/* Language — bottom-right, whisper-quiet */}
        <motion.span
          layoutId={`badge-${layoutId}`}
          className="absolute right-2 bottom-2 z-10 bg-background/80 px-1.5 py-0.5 font-mono text-[9px] tracking-wide text-muted-foreground uppercase backdrop-blur-sm"
        >
          {getLanguageLabel(story.language)}
        </motion.span>
      </motion.div>

      {/* Content — title + one metadata line */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <motion.h3
          layoutId={`title-${layoutId}`}
          className="line-clamp-2 font-heading text-sm leading-tight font-black tracking-tighter text-foreground uppercase transition-colors group-hover/expandable:text-primary"
        >
          {story.title}
        </motion.h3>
        <motion.p
          layoutId={`desc-${layoutId}`}
          className="mt-auto font-mono text-[10px] tracking-wide text-muted-foreground"
        >
          {getCategoryLabel(story.category)}
          {(story.chapterCount ?? 0) > 0 && ` · ${story.chapterCount} ch.`}
        </motion.p>
      </div>
    </div>
  )

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index}
      className="group relative flex flex-col overflow-hidden border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-nordic-sm"
    >
      <ExpandableCard
        layoutId={layoutId}
        trigger={trigger}
        expandedContent={<ExpandedStoryView story={story} />}
        className="h-full flex flex-col"
        contentClassName="md:flex-row md:max-w-[800px] md:overflow-hidden h-[85vh] md:h-[75vh] md:max-h-[680px]"
      />
    </motion.div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse border border-border bg-card">
      <div className="aspect-[3/4] bg-muted" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-4/5 bg-muted" />
        <div className="h-3 w-1/2 bg-muted" />
      </div>
    </div>
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

  const isLoading = stories === undefined
  const isEmpty = !isLoading && (!stories || stories.length === 0)
  const activeFilterCount = [activeCategory, activeLanguage].filter(
    Boolean
  ).length

  // Inline stats
  const totalCount = stories?.length ?? 0
  const languageCount = new Set(
    stories?.map((s) => s.language).filter(Boolean)
  ).size

  return (
    <div className="relative min-h-screen bg-background font-sans text-foreground">
      <Navbar />

      {/* ── Compact Header ──────────────────────────────────────────────── */}
      <section className="px-6 pt-24 pb-4 md:px-12">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            {/* Title + inline stats */}
            <div>
              <h1 className="font-heading text-3xl leading-none font-black tracking-tighter text-foreground uppercase md:text-4xl">
                The <span className="text-primary">Manuscripts</span>
              </h1>
              {!isLoading && totalCount > 0 && (
                <p className="mt-1.5 font-mono text-[11px] tracking-wide text-muted-foreground">
                  {totalCount} archived · {languageCount}{" "}
                  {languageCount === 1 ? "language" : "languages"}
                </p>
              )}
            </div>

            {/* Search + Filter */}
            <div className="flex shrink-0 items-center gap-2">
              <div className="group relative">
                <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="story-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search…"
                  aria-label="Search manuscripts"
                  className="h-9 w-48 rounded-none border border-border bg-background pl-9 font-mono text-xs transition-all focus-visible:border-primary focus-visible:ring-0 md:w-56"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "relative h-9 shrink-0 gap-1.5 rounded-none border border-border px-3 font-mono text-[10px] tracking-widest uppercase transition-all hover:border-primary",
                  showFilters && "border-primary bg-primary/5"
                )}
                aria-label="Toggle filters"
              >
                <Filter className="size-3" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center bg-primary font-mono text-[8px] text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
          </motion.div>

          {/* ── Filter Panel ── */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE_EXPO }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-5 border-b border-border py-4 md:flex-row">
                  {/* Category filters */}
                  <div className="flex-1">
                    <span className="mb-1.5 block font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                      Category
                    </span>
                    <div className="flex flex-wrap gap-1">
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
                            "border px-2 py-0.5 font-mono text-[10px] tracking-wide transition-all",
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
                    <span className="mb-1.5 block font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                      Language
                    </span>
                    <div className="flex flex-wrap gap-1">
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
                            "flex items-center gap-1 border px-2 py-0.5 font-mono text-[10px] tracking-wide transition-all",
                            activeLanguage === lang.value
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-foreground hover:border-primary/50"
                          )}
                        >
                          <Globe className="size-2" />
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
                        className="flex items-center gap-1 font-mono text-[10px] tracking-wide text-destructive hover:underline"
                      >
                        <X className="size-2.5" />
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

      {/* ── Unified Grid ────────────────────────────────────────────────── */}
      <section className="px-6 pb-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <AnimatePresence mode="wait">
            {/* Loading */}
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-6 md:gap-8 lg:gap-10 sm:grid-cols-2 lg:grid-cols-3"
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </motion.div>
            )}

            {/* Empty */}
            {isEmpty && !isLoading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-6 py-32 text-center"
              >
                <div className="flex size-16 items-center justify-center border border-border">
                  <BookOpen className="size-6 text-muted-foreground" />
                </div>
                <div className="max-w-xs space-y-2">
                  <p className="font-heading text-2xl font-black tracking-tighter text-foreground uppercase">
                    The Archive Grows
                  </p>
                  <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                    {debouncedQuery
                      ? `No manuscripts match "${debouncedQuery}".`
                      : "No stories published yet."}
                  </p>
                </div>
                <Link href="/">
                  <Button
                    variant="outline"
                    className="rounded-none border font-mono text-[10px] tracking-widest uppercase hover:border-primary"
                  >
                    Return Home
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* Stories Grid */}
            {!isLoading && !isEmpty && stories && stories.length > 0 && (
              <motion.div
                key="stories"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-6 md:gap-8 lg:gap-10 sm:grid-cols-2 lg:grid-cols-3"
              >
                {stories.map((s, i) => (
                  <StoryCard key={s._id} story={s} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border px-6 py-5 md:px-12">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-mono text-[10px] tracking-wide text-muted-foreground">
            Fungga Wari Lab © {new Date().getFullYear()}
          </span>
          <span className="font-mono text-[10px] tracking-wide text-muted-foreground">
            Preserving Kangleipak folk traditions
          </span>
        </div>
      </footer>
    </div>
  )
}
