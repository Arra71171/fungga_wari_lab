"use client";

import * as React from "react";
import { MediaUploader } from "@/components/assets/MediaUploader";
import { AssetGrid } from "@/components/assets/AssetGrid";
import { cn } from "@workspace/ui/lib/utils";
import { Image, FileAudio, Pencil, FolderOpen, FileText } from "lucide-react";

const FOLDER_TABS = [
  { value: "all", label: "All Assets", icon: FolderOpen },
  { value: "illustration", label: "Illustrations", icon: Image },
  { value: "sketch", label: "Sketches", icon: Pencil },
  { value: "audio_lore", label: "Audio", icon: FileAudio },
  { value: "text_story", label: "Stories (Docs)", icon: FileText },
] as const;

export default function AssetsPage() {
  const [activeFolder, setActiveFolder] = React.useState<string>("all");

  return (
    <div className="flex flex-col min-h-full p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-heading text-brand-ochre tracking-tighter uppercase font-light">
            Asset Vault
          </h1>
          <p className="font-mono text-fine text-muted-foreground uppercase tracking-label mt-2">
            Global Media Library & Story Assets
          </p>
        </div>
      </div>

      <div className="space-y-6 flex-1">
          {/* Folder Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {FOLDER_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveFolder(tab.value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 font-mono text-fine uppercase tracking-widest border transition-all",
                    activeFolder === tab.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  <Icon className="size-3" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* Upload Sidebar */}
            <div className="w-full flex flex-col space-y-4">
              <MediaUploader />
            </div>

            {/* Content Area */}
            <div className="overflow-y-auto pr-2 pb-10">
              <AssetGrid filterType={activeFolder === "all" ? undefined : activeFolder} />
            </div>
          </div>
        </div>
    </div>
  );
}
