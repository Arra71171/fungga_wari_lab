"use client";

import * as React from "react";

import { AlignJustify } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function StoryCanvas(props: { story?: Record<string, unknown> }) {
  return (
    <main className="flex-1 h-full overflow-y-auto relative hidden-scrollbar bg-cinematic-bg">
      
      {/* Top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-ember/5 blur-[120px] rounded-none pointer-events-none" />

      <div className="max-w-4xl mx-auto px-8 py-12 relative z-10 min-h-full flex flex-col">
        
        {/* Breadcrumb & Top Right Action */}
        <header className="flex items-start justify-between mb-8">
          <div className="text-cinematic-text-dim text-sm font-mono tracking-widest uppercase">
            Chapter 1 &middot; The Beginning
          </div>
          <Button variant="ghost" size="icon" className="text-cinematic-text-dim hover:text-cinematic-text hover:bg-transparent transition-colors">
            <AlignJustify className="size-5" />
          </Button>
        </header>

        {/* Title */}
        <h1 className="font-heading text-4xl md:text-5xl font-medium text-cinematic-accent mb-8 tracking-tight drop-shadow-sm">
          The Mysterious Village
        </h1>

        {/* Cinematic Illustration */}
        <div className="relative w-full aspect-video rounded-none overflow-hidden mb-10 border border-cinematic-border-heavy/50 shadow-2xl group">
          {/* Subtle inset shadow/glow on the image */}
          <div className="absolute inset-0 bg-gradient-to-t from-cinematic-bg via-transparent to-transparent z-10" />
          
          {/* Since we don't have a real image asset, we'll use a highly styled placeholder that mimics the screenshot's vibe */}
          <div className="absolute inset-0 bg-cinematic-panel-hover">
            {/* Mountain / Village silhouette mock */}
            <div className="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOCIgbnVtT2N0YXZlcz0iNCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==')] mix-blend-overlay" />
            <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-brand-ember/30 to-transparent" />
            
            {/* Fake scenery elements */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-cinematic-bg to-transparent z-20" />
            
            <div className="w-full h-full flex flex-col items-center justify-center relative z-20">
              <div className="size-16 rounded-none bg-brand-ember/10 blur-xl absolute" />
              <span className="font-mono text-cinematic-text-dim/50 text-sm tracking-widest uppercase">Cinematic Asset Frame</span>
            </div>
          </div>
        </div>

        {/* Story Content */}
        <div className="max-w-3xl text-cinematic-text text-lg md:text-xl leading-relaxed tracking-wide space-y-6 font-heading">
          <p>
            You arrive at a mysterious village shrouded in mist. The air is thick with the scent of pine and a subtle, ancient magic that seems to hum in the background. 
          </p>
          <p className="text-cinematic-text-dim">
            ✧ ✧ ✧
          </p>
          <p>
            The wooden structures slope gently into the hillside, their roofs heavy with moss and long-forgotten secrets. A lone figure stands near the edge of the roaring river, watching the water cascade over smoothed stones. As you approach, the mist seems to part deliberately, framing the path ahead.
          </p>
        </div>

        {/* Bottom Spacing */}
        <div className="pb-32" />

      </div>
    </main>
  );
}
