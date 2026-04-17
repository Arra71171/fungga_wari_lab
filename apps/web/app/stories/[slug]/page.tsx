import * as React from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { StoryReaderShell } from "@/components/story/StoryReaderShell";
import { PaywallGate } from "@/components/story/PaywallGate";
import { checkUserAccess } from "@/actions/paywallActions";

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
  const { data: story } = await supabase
    .from("stories")
    .select("cover_image_url")
    .eq("slug", slug)
    .single();

  return (
    <div className="relative w-full h-full min-h-screen flex justify-center bg-cinematic-bg overflow-hidden">
      {/* Immersive background illustration */}
      {story?.cover_image_url && (
        <>
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-20 transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${story.cover_image_url})`,
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
        <PaywallGate slug={slug} hasAccess={hasAccess}>
          <StoryReaderShell slug={slug} />
        </PaywallGate>
      </div>
    </div>
  );
}
