import * as React from "react";
import { StoryReaderProvider } from "@/components/story/StoryReaderContext";

export default function StoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoryReaderProvider>
      <div className="min-h-screen bg-cinematic-bg text-cinematic-text font-sans">
        {children}
      </div>
    </StoryReaderProvider>
  );
}
