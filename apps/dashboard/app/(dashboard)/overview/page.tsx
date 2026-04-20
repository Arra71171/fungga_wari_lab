import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { KpiCard } from "@/components/overview/KpiCard"
import { TopStoriesTable } from "@/components/overview/TopStoriesTable"
import { ActivityFeed } from "@/components/overview/ActivityFeed"
import { EngagementChart } from "@/components/overview/EngagementChart"
import { CategoryRadialChart } from "@/components/overview/CategoryRadialChart"
import { CompletionDonutChart } from "@/components/overview/CompletionDonutChart"
import { BookOpen, Globe2, Clock, Eye, BookCheck, FileText, Send } from "lucide-react"
import { ScrollArea } from "@workspace/ui/components/scroll-area"

// ─── Server-side data fetching ────────────────────────────────────────────────

async function getOverviewData() {
  const supabase = await createClient()

  const [storiesRes, interactionsRes] = await Promise.all([
    supabase.from("stories").select("id, status, category, view_count, read_count"),
    supabase.from("interactions").select("type, created_at"),
  ])

  const stories = storiesRes.data ?? []
  const interactions = interactionsRes.data ?? []

  const now = Date.now()
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString()

  const totalStories = stories.length
  const publishedStories = stories.filter((s) => s.status === "published").length
  const draftStories = stories.filter((s) => s.status === "draft").length
  const inReviewStories = stories.filter((s) => s.status === "in_review").length
  const totalViews = stories.reduce((acc, s) => acc + (s.view_count ?? 0), 0)
  const totalReads = stories.reduce((acc, s) => acc + (s.read_count ?? 0), 0)
  const recentViews = interactions.filter(
    (i) => i.type === "view" && i.created_at && i.created_at > oneDayAgo
  ).length
  const completes = interactions.filter((i) => i.type === "complete").length
  const totalInteractions = interactions.length
  const completionRate =
    totalInteractions > 0 ? Math.round((completes / totalInteractions) * 100) : 0

  return {
    totalStories,
    publishedStories,
    draftStories,
    inReviewStories,
    totalViews,
    totalReads,
    recentViews,
    completionRate,
  }
}

async function getTopStories(limit = 10) {
  const supabase = await createClient()

  const { data } = await supabase
    .from("stories")
    .select("id, title, slug, category, status, view_count, read_count, published_at")
    .eq("status", "published")
    .order("view_count", { ascending: false })
    .limit(limit)

  return data ?? []
}

async function getRecentActivity(limit = 20) {
  const supabase = await createClient()

  const { data } = await supabase
    .from("interactions")
    .select("id, type, story_id, created_at, stories(title, slug)")
    .order("created_at", { ascending: false })
    .limit(limit)

  return data ?? []
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function OverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get user profile for display name
  const { data: profile } = await supabase
    .from("users")
    .select("name, alias")
    .eq("auth_id", user.id)
    .single()

  const displayName = profile?.alias || profile?.name || user.email?.split("@")[0] || "Creator"

  const [stats, topStories, activities] = await Promise.all([
    getOverviewData(),
    getTopStories(10),
    getRecentActivity(20),
  ])

  return (
    <ScrollArea className="h-[calc(100vh-theme(spacing.16))]">
      <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="flex flex-col gap-2 border-l-[3px] border-brand-ember pl-5 py-1">
          <h1 className="text-4xl font-heading tracking-tight text-foreground">
            {`Welcome back, ${displayName}`}
          </h1>
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground/70">
            Fungga Wari Creator Studio — Analytics
          </p>
        </div>

        {/* KPI Cards */}
        <div id="tour-overview-stats" className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total Manuscripts"
            value={stats.totalStories.toLocaleString()}
            icon={<BookOpen className="size-4 text-brand-ochre" />}
            isLoading={false}
          />
          <KpiCard
            title="Total Views"
            value={stats.totalViews.toLocaleString()}
            trend={stats.recentViews ? { value: stats.recentViews, label: "last 24h" } : undefined}
            icon={<Eye className="size-4 text-brand-ochre" />}
            isLoading={false}
          />
          <KpiCard
            title="Total Reads"
            value={stats.totalReads.toLocaleString()}
            icon={<BookCheck className="size-4 text-brand-ochre" />}
            isLoading={false}
          />
          <KpiCard
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            icon={<Clock className="size-4 text-brand-ochre" />}
            isLoading={false}
          />
        </div>

        {/* Publishing Pipeline Stepper */}
        <div id="tour-overview-pipeline" className="border border-border-subtle bg-bg-panel p-8 flex flex-col md:flex-row items-stretch justify-between relative overflow-hidden space-y-8 md:space-y-0">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-[50%] left-[16%] right-[16%] h-[1px] bg-border-subtle -z-0 translate-y-[-50%]" />

          <div className="flex-1 flex flex-col items-center gap-4 relative z-10 md:bg-bg-panel/90 backdrop-blur-sm px-4">
            <div className="size-12 rounded-full border border-border bg-bg-base flex items-center justify-center">
              <FileText className="size-5 text-muted-foreground" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-foreground">{stats.draftStories}</div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mt-1">Drafts</div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center gap-4 relative z-10 md:bg-bg-panel/90 backdrop-blur-sm px-4">
            <div className="size-12 rounded-full border border-brand-ochre/40 bg-brand-ochre/5 flex items-center justify-center">
              <Send className="size-5 text-brand-ochre" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-foreground">{stats.inReviewStories}</div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-ochre mt-1">In Review</div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center gap-4 relative z-10 md:bg-bg-panel/90 backdrop-blur-sm px-4">
            <div className="size-12 rounded-full border border-primary/40 bg-primary/5 flex items-center justify-center">
              <Globe2 className="size-5 text-primary" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-foreground">{stats.publishedStories}</div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mt-1">Published</div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div id="tour-overview-charts" className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <EngagementChart data={undefined} isLoading={false} />
          </div>
          <div className="border-2 border-border bg-background p-5">
            <Suspense fallback={<div className="h-64 animate-pulse bg-muted/20" />}>
              <CompletionDonutChart />
            </Suspense>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="border-2 border-border bg-background p-5">
            <Suspense fallback={<div className="h-64 animate-pulse bg-muted/20" />}>
              <CategoryRadialChart />
            </Suspense>
          </div>
          <div className="md:col-span-2">
            <TopStoriesTable stories={topStories} isLoading={false} />
          </div>
        </div>

        {/* Activity Feed */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-3">
            <ActivityFeed 
              activities={activities.map(a => ({
                _id: a.id,
                storyId: a.story_id,
                type: a.type,
                timestamp: new Date(a.created_at ?? 0).getTime(),
                storyTitle: Array.isArray(a.stories) ? a.stories[0]?.title : a.stories?.title ?? "Unknown Story",
                storySlug: Array.isArray(a.stories) ? a.stories[0]?.slug : a.stories?.slug ?? ""
              }))} 
              isLoading={false} 
            />
          </div>
        </div>

      </div>
    </ScrollArea>
  )
}
