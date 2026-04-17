import * as React from "react";
import { StoryMobileLayout } from "@/components/story/StoryMobileLayout";
import { StoryDesktopLayout } from "@/components/story/StoryDesktopLayout";
import { StoryReaderProvider } from "@/components/story/StoryReaderContext";

export default function StoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoryReaderProvider>
      <div className="min-h-screen bg-cinematic-bg text-cinematic-text font-sans">
        {/* 
          We use CSS media queries to swap between the two entirely different layout paradigms.
          Mobile: Single-column immersive with Drawer/FAB.
          Desktop: 3-column dashboard layout with hideable sidebars.
        */}
        <div className="block lg:hidden h-full">
          <StoryMobileLayout>{children}</StoryMobileLayout>
        </div>
        
        <div className="hidden lg:block h-full">
          <StoryDesktopLayout>{children}</StoryDesktopLayout>
        </div>
      </div>
    </StoryReaderProvider>
  );
}
