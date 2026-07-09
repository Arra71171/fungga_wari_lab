import * as React from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { Flame, Clock, Heart } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Your Profile — Fungga Wari Lab",
  description: "View your reading history and liked stories.",
};

export default async function ReaderProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        <Navbar />
        <h1 className="font-heading text-4xl uppercase font-black text-center mb-4">Not Signed In</h1>
        <p className="font-mono text-muted-foreground text-center">
          You need to be signed in to view your profile.
        </p>
        <Link href="/sign-in" className="mt-8 font-mono text-brand-ember hover:underline">
          Sign In
        </Link>
      </div>
    );
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("users")
    .select("id, name, alias, avatar_url, created_at")
    .eq("auth_id", user.id)
    .single();

  const dbUserId = profile?.id;

  // Fetch Bookmarked Stories
  let likedStories: any[] = [];
  if (dbUserId) {
    const { data: bookmarks } = await supabase
      .from("bookmarks")
      .select(`
        created_at,
        stories (id, title, slug, cover_image_url, category, language, chapter_count)
      `)
      .eq("user_id", dbUserId)
      .order("created_at", { ascending: false });
    
    if (bookmarks) {
      likedStories = bookmarks.map((b) => b.stories).filter(Boolean);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-brand-ember/20 selection:text-brand-ember">
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 md:px-12 pt-32 pb-24">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 mb-20 border-b border-border pb-16">
          <div className="size-32 md:size-48 rounded-none border border-border bg-secondary/10 shrink-0 flex items-center justify-center overflow-hidden relative">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="object-cover w-full h-full" />
            ) : (
              <div className="font-heading text-4xl uppercase rounded-none bg-secondary text-muted-foreground w-full h-full flex items-center justify-center">
                {profile?.name?.slice(0, 2) || profile?.alias?.slice(0, 2) || "U"}
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="mb-2">
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-foreground leading-[0.9]">
                {profile?.name || profile?.alias || "Reader"}
              </h1>
              <p className="font-mono text-lg text-primary mt-2">@{profile?.alias || "reader"}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-8 pt-6 border-t border-border w-full">
              <div className="flex items-center gap-2">
                <Heart className="size-4 text-brand-ember" />
                <span className="font-mono text-sm font-medium">
                  <span className="text-foreground">{likedStories.length}</span>
                  <span className="text-muted-foreground ml-1.5">Liked</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <span className="font-mono text-sm font-medium">
                  <span className="text-muted-foreground">Joined</span>
                  <span className="text-foreground ml-1.5">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : "Recently"}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Liked Stories Grid */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-heading text-3xl font-black uppercase text-foreground">
              Liked <span className="text-brand-ember">Stories</span>
            </h2>
          </div>

          {likedStories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border bg-secondary/5">
              <Heart className="size-8 text-muted-foreground/30 mb-4" />
              <p className="font-mono text-sm text-muted-foreground mb-6 text-center max-w-sm">
                You haven't liked any stories yet. Explore the archive and find something you love.
              </p>
              <Link href="/stories" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-mono text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                Explore Archive
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {likedStories.map((story) => (
                <Link 
                  key={story.id} 
                  href={`/stories/${story.slug}`}
                  className="group flex flex-col bg-background border border-border hover:border-brand-ember/50 transition-colors"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary/10 border-b border-border">
                    {story.cover_image_url ? (
                      <Image 
                        src={story.cover_image_url} 
                        alt={story.title}
                        fill
                        className="object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Flame className="size-6 text-muted-foreground/20" />
                      </div>
                    )}
                    
                    {story.category && (
                      <div className="absolute top-3 left-3 bg-background/95 backdrop-blur border border-border px-2.5 py-1 text-[10px] font-mono tracking-wide uppercase z-10">
                        {story.category.replace(/_/g, " ")}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-heading text-lg font-black uppercase tracking-tight text-foreground group-hover:text-brand-ember leading-tight mb-3 transition-colors line-clamp-2">
                      {story.title}
                    </h3>
                    <div className="mt-auto flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                      <span>{story.language || "Unknown Language"}</span>
                      {story.chapter_count > 0 && <span>{story.chapter_count} Ch.</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
