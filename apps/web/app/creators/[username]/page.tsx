import * as React from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";

import Link from "next/link";
import { Flame, BookOpen, Clock } from "lucide-react";
import Image from "next/image";

type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  
  return {
    title: `${username} — Fungga Wari Lab`,
    description: `Read stories and manuscripts created by ${username} on Fungga Wari Lab.`,
  };
}

export default async function CreatorProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const supabase = await createClient();

  // Find user by username
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, name, alias, avatar_url, bio, role, created_at")
    .eq("alias", username)
    .single();

  if (!profile || profileError) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        <Navbar />
        <h1 className="font-heading text-4xl uppercase font-black text-center mb-4">Creator Not Found</h1>
        <p className="font-mono text-muted-foreground text-center">
          The creator @{username} could not be found or does not exist.
        </p>
        <Link href="/stories" className="mt-8 font-mono text-brand-ember hover:underline">
          Return to Archive
        </Link>
      </div>
    );
  }

  // Fetch published stories by this author
  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, slug, cover_image_url, category, language, chapter_count, view_count")
    .eq("status", "published")
    .eq("author_id", profile.id)
    .order("published_at", { ascending: false });

  // Fetch series created by this author
  // NOTE: For a real series setup we might have author_id on series, 
  // but for now we deduce series from the stories they authored.
  // We'll skip series display on the profile until author_id is explicitly tracked on series.

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-brand-ember/20 selection:text-brand-ember">
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 md:px-12 pt-32 pb-24">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 mb-20 border-b border-border pb-16">
          <div className="size-32 md:size-48 rounded-none border border-border bg-secondary/10 shrink-0 flex items-center justify-center overflow-hidden relative">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="object-cover w-full h-full" />
            ) : (
              <div className="font-heading text-4xl uppercase rounded-none bg-secondary text-muted-foreground w-full h-full flex items-center justify-center">
                {profile.name?.slice(0, 2) || profile.alias?.slice(0, 2)}
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="mb-2">
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-foreground leading-[0.9]">
                {profile.name || profile.alias}
              </h1>
              <p className="font-mono text-lg text-primary mt-2">@{profile.alias}</p>
            </div>

            {profile.bio ? (
              <p className="font-sans text-base md:text-lg leading-[1.8] text-muted-foreground max-w-2xl mt-6">
                {profile.bio}
              </p>
            ) : (
              <p className="font-mono text-sm text-muted-foreground italic mt-6">
                This creator hasn't written a bio yet.
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-8 pt-6 border-t border-border w-full">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-brand-ember" />
                <span className="font-mono text-sm font-medium">
                  <span className="text-foreground">{stories?.length || 0}</span>
                  <span className="text-muted-foreground ml-1.5">Manuscripts</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <span className="font-mono text-sm font-medium">
                  <span className="text-muted-foreground">Joined</span>
                  <span className="text-foreground ml-1.5">
                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Unknown'}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stories Grid */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-heading text-3xl font-black uppercase text-foreground">
              Manuscripts <span className="text-brand-ember">by {profile.alias}</span>
            </h2>
          </div>

          {!stories || stories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border bg-secondary/5">
              <Flame className="size-8 text-muted-foreground/30 mb-4" />
              <p className="font-mono text-sm text-muted-foreground">No manuscripts published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {stories.map((story) => (
                <Link 
                  key={story.id} 
                  href={`/stories/${story.slug}`}
                  className="group flex flex-col bg-card border border-border hover:border-brand-ember/50 transition-colors"
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
                      {(story.chapter_count ?? 0) > 0 && <span>{story.chapter_count} Ch.</span>}
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
