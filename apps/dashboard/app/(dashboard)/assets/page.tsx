"use client";

import * as React from "react";
import { MediaUploader } from "@/components/assets/MediaUploader";
import { AssetGrid } from "@/components/assets/AssetGrid";
import { cn } from "@workspace/ui/lib/utils";
import { Image, FileAudio, Pencil, FolderOpen, FileText, Upload, Book, Camera } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";

const FOLDER_TABS = [
  { value: "all", label: "All Assets", icon: FolderOpen },
  { value: "illustration", label: "Illustrations", icon: Image },
  { value: "cover", label: "Covers", icon: Book },
  { value: "sketch", label: "Sketches", icon: Pencil },
  { value: "reference_photo", label: "References", icon: Camera },
  { value: "audio_lore", label: "Audio", icon: FileAudio },
  { value: "text_story", label: "Stories (Docs)", icon: FileText },
] as const;

export default function AssetsPage() {
  const [activeFolder, setActiveFolder] = React.useState<string>("all");
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);

  return (
    <div className="flex flex-col min-h-full p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border-subtle pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-heading text-brand-ochre tracking-tighter uppercase font-light">
            Asset Vault
          </h1>
          <p className="font-sans text-xs text-muted-foreground tracking-wide mt-2">
            Global Media Library & Story Assets
          </p>
        </div>
        
        {/* Upload Action */}
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="font-sans text-xs uppercase tracking-widest gap-2 bg-brand-ember text-primary-foreground hover:bg-brand-ember/90 rounded-none">
              <Upload className="size-4" />
              Upload Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-bg-panel border-border rounded-none p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="font-heading text-xl text-brand-ochre uppercase font-light tracking-tight">Upload New Asset</DialogTitle>
            </DialogHeader>
            <MediaUploader />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-8 flex-1 flex flex-col">
          {/* Folder Tabs (Minimalist scrollable strip on mobile) */}
          <div className="flex items-center gap-6 border-b border-border-subtle pb-[1px] overflow-x-auto no-scrollbar whitespace-nowrap">
            {FOLDER_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFolder === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveFolder(tab.value)}
                  className={cn(
                    "flex items-center gap-2 pb-3 font-sans text-xs uppercase tracking-widest transition-all border-b-2 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isActive
                      ? "text-brand-ember border-brand-ember"
                      : "text-muted-foreground border-transparent hover:text-foreground hover:border-border-strong"
                  )}
                >
                  <Icon className="size-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Full-width Content Area */}
          <div className="flex-1 overflow-y-auto pb-10">
            <AssetGrid filterType={activeFolder === "all" ? undefined : activeFolder} />
          </div>
      </div>
    </div>
  );
}
