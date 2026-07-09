import * as React from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Plus, BookCopy, Library } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Series Management — Creator Studio",
  description: "Manage your story series on Fungga Wari Lab.",
};

export default async function SeriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Not authenticated</div>; // Middleware handles this usually
  }

  // Get user profile for id
  const { data: profile } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  const authorId = profile?.id;

  // Fetch series created by the current user
  let series: any[] = [];
  if (authorId) {
    const { data } = await supabase
      .from("series")
      .select(`
        id, title, description, cover_image_url, status, 
        created_at, view_count,
        stories(id)
      `)
      .eq("author_id", authorId)
      .order("created_at", { ascending: false });
    
    if (data) series = data;
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <h1 className="font-heading text-4xl lg:text-5xl uppercase font-black tracking-tight text-foreground">
            Series
          </h1>
          <p className="font-mono text-sm text-muted-foreground mt-3 tracking-wide">
            Manage your collections and linked stories.
          </p>
        </div>
        <Link 
          href="/series/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-mono text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="size-4" />
          Create Series
        </Link>
      </div>

      {/* Stats row placeholder */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="p-6 border border-border bg-card">
          <div className="flex items-center gap-3 text-muted-foreground mb-4">
            <Library className="size-4" />
            <h3 className="font-mono text-xs uppercase tracking-wider">Total Series</h3>
          </div>
          <p className="font-heading text-3xl font-bold">{series.length}</p>
        </div>
        <div className="p-6 border border-border bg-card">
          <div className="flex items-center gap-3 text-muted-foreground mb-4">
            <BookCopy className="size-4" />
            <h3 className="font-mono text-xs uppercase tracking-wider">Series Views</h3>
          </div>
          <p className="font-heading text-3xl font-bold">
            {series.reduce((acc, s) => acc + (s.view_count || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Series Grid */}
      {series.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 border border-dashed border-border bg-secondary/5 text-center">
          <Library className="size-10 text-muted-foreground/30 mb-6" />
          <h3 className="font-heading text-xl uppercase font-bold text-foreground mb-2">No Series Yet</h3>
          <p className="font-mono text-sm text-muted-foreground max-w-sm mb-8">
            Create your first series to group connected stories together.
          </p>
          <Link 
            href="/series/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-mono text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" />
            Create Your First Series
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {series.map((item) => (
            <Link 
              key={item.id}
              href={`/series/${item.id}`}
              className="group flex flex-col bg-card border border-border hover:border-brand-ember/50 transition-colors h-full"
            >
              <div className="relative aspect-video w-full bg-secondary/10 border-b border-border overflow-hidden">
                {item.cover_image_url ? (
                  <img 
                    src={item.cover_image_url} 
                    alt={item.title}
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Library className="size-6 text-muted-foreground/30" />
                  </div>
                )}
                
                <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                  <span className={`px-2 py-1 text-[10px] font-mono tracking-wide uppercase bg-background/95 backdrop-blur border border-border ${item.status === 'published' ? 'text-green-500' : 'text-amber-500'}`}>
                    {item.status}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-heading text-xl uppercase font-bold text-foreground group-hover:text-brand-ember transition-colors leading-tight mb-2">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="font-sans text-sm text-muted-foreground line-clamp-2 mb-6">
                    {item.description}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between font-mono text-xs text-muted-foreground pt-4 border-t border-border">
                  <span className="flex items-center gap-1.5">
                    <BookCopy className="size-3" />
                    {item.stories?.length || 0} Stories
                  </span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
