import * as React from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { StoryReaderShell } from "@/components/story/StoryReaderShell";
import { PaywallGate } from "@/components/story/PaywallGate";
import { checkUserAccess } from "@/actions/paywallActions";
import { PaymentSuccessHandler } from "@/components/story/PaymentSuccessHandler";
import type { StoryShape } from "@/components/story/StoryReaderContext";
import { WiseEpuReader } from "@/components/story/WiseEpuReader";

type StoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const supabase = await createClient();
    const { data: story } = await supabase
      .from("stories")
      .select("title, description, cover_image_url, tags, category, language")
      .eq("slug", slug)
      .single();

    if (!story) {
      return {
        title: "Story Not Found — Fungga Wari Lab",
        description: "This manuscript could not be found in the archive.",
      };
    }

    const description = story.description ??
      `Read "${story.title}" — a folk story from the Kangleipak oral tradition, preserved in digital form by Fungga Wari Lab.`;

    return {
      title: `${story.title} — Fungga Wari Lab`,
      description,
      openGraph: {
        title: story.title,
        description,
        type: "article",
        images: story.cover_image_url ? [{ url: story.cover_image_url, width: 600, height: 800, alt: story.title }] : [],
        siteName: "Fungga Wari Lab",
      },
      twitter: {
        card: story.cover_image_url ? "summary_large_image" : "summary",
        title: story.title,
        description,
        images: story.cover_image_url ? [story.cover_image_url] : [],
      },
      keywords: [
        ...(story.tags ?? []),
        story.category ?? "",
        story.language ?? "",
        "folk story",
        "Kangleipak",
        "Meitei",
        "oral tradition",
      ].filter(Boolean),
    };
  } catch {
    return {
      title: "Story — Fungga Wari Lab",
      description: "A folk story from the Kangleipak oral tradition.",
    };
  }
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const hasAccess = await checkUserAccess();

  const supabase = await createClient();
  const { data: storyData, error } = await supabase
    .from("stories")
    .select(`
      id, title, slug, description, category, language, status,
      cover_image_url, tags, moral, attributed_author, author_id,
      chapter_count, view_count, read_count, published_at,
      created_at, updated_at,
      chapters (
        id, title, "order", illustration_url, tiptap_content,
        scenes (
          id, title, "order", content, tiptap_content, illustration_url,
          is_draft, version, reading_time, excerpt
        )
      )
    `)
    .eq("slug", slug)
    .single();

  if (error) {
    const errorDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack, name: error.name } 
      : error;
    console.error(`[StoryPage] Supabase Error for slug "${slug}":`, errorDetails);
  } else if (!storyData) {
    console.warn("[StoryPage] StoryData is null for slug:", slug);
  } else {
    console.log("[StoryPage] StoryData fetched successfully. Chapters:", storyData.chapters?.length);
  }

  let initialStory: StoryShape | undefined;
  if (storyData) {
    type RawChapter = NonNullable<typeof storyData.chapters>[number];
    type RawScene = NonNullable<RawChapter["scenes"]>[number];

    const sortedChapters = (storyData.chapters ?? [])
      .slice()
      .sort((a: RawChapter, b: RawChapter) => a.order - b.order)
      .map((ch: RawChapter) => ({
        ...ch,
        // Cast tiptap_content: Supabase Json type is structurally Record<string,unknown>
        // at runtime; the generated type is a union that includes string/number/boolean
        // which tsc can't narrow without a cast here.
        tiptap_content: ch.tiptap_content as Record<string, unknown> | null,
        scenes: (ch.scenes ?? [])
          .slice()
          .sort((a: RawScene, b: RawScene) => a.order - b.order)
          .map((s: RawScene) => ({
            ...s,
            tiptap_content: s.tiptap_content as Record<string, unknown> | null,
            is_draft: s.is_draft ?? false,
            version: s.version ?? 1,
            choices: [] as Array<{ id: string; label: string; next_scene_id: string }>,
          })),
      }));

    initialStory = {
      ...storyData,
      _id: storyData.id,
      chapters: sortedChapters,
    };
  }

  return (
    <div className="relative w-full h-full min-h-screen flex justify-center bg-cinematic-bg overflow-hidden">
      {/* Immersive background illustration */}
      {initialStory?.cover_image_url && (
        <>
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-20 transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${initialStory.cover_image_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(24px)",
              transform: "scale(1.1)", // prevent blurry edges from showing
            }}
            aria-hidden="true"
          />
          {/* Gradient to smooth out the image and fade it at the bottom */}
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-cinematic-bg via-cinematic-bg/80 to-transparent pointer-events-none" aria-hidden="true" />
        </>
      )}

      <div className="relative z-10 w-full">
        <React.Suspense fallback={null}>
          <PaymentSuccessHandler />
        </React.Suspense>
        <PaywallGate slug={slug} hasAccess={hasAccess} initialStory={initialStory}>
          <StoryReaderShell slug={slug} />
        </PaywallGate>
      </div>
      {/* WiseEpu — lore keeper chatbot, available in the cinematic reader */}
      <WiseEpuReader />
    </div>
  );
}
