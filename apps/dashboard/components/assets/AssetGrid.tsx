"use client";

import * as React from "react";
import Image from "next/image";
import { Trash2, Flame, FileAudio, Copy } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { toast } from "sonner";
import { getAllAssets, deleteAsset, updateAsset } from "@/actions/assetActions";
import type { Database } from "@workspace/ui/types/supabase";
import { BrutalistCard } from "@workspace/ui/components/BrutalistCard";

type AssetRow = Database["public"]["Tables"]["assets"]["Row"];

type AssetGridProps = {
  filterType?: string;
};

// ─── Component ─────────────────────────────────────────────────────────────

function AssetGrid({ filterType }: AssetGridProps) {
  const [assets, setAssets] = React.useState<AssetRow[] | undefined>(undefined);
  const [selectedAsset, setSelectedAsset] = React.useState<AssetRow | null>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const type = filterType as Database["public"]["Enums"]["asset_type"] | undefined;
    getAllAssets(type).then((data) => {
      if (!cancelled) setAssets(data as AssetRow[]);
    });
    return () => {
      cancelled = true;
    };
  }, [filterType]);

  const handleUpdate = async (id: string, patch: { title?: string; tags?: string[] }) => {
    setIsUpdating(true);
    try {
      await updateAsset(id, patch);
      setAssets((prev) =>
        prev?.map((a) => (a.id === id ? { ...a, ...patch } : a))
      );
      setSelectedAsset((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));
      toast.success("Asset Updated", { description: "Metadata saved successfully." });
    } catch (err) {
      console.error(err);
      toast.error("Update Failed", { description: "Could not update the asset metadata." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Optimistic removal
    setAssets((prev) => prev?.filter((a) => a.id !== id));
    if (selectedAsset?.id === id) setSelectedAsset(null);

    try {
      await deleteAsset(id);
      toast.success("Asset Deleted");
    } catch (err) {
      console.error(err);
      toast.error("Delete Failed", { description: "Could not remove the asset." });
      // Refetch on error to restore state
      const type = filterType as Database["public"]["Enums"]["asset_type"] | undefined;
      getAllAssets(type).then((data) => setAssets(data as AssetRow[]));
    }
  };

  if (assets === undefined) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <BrutalistCard
            key={i}
            variant="ghost"
            padding="none"
            className={cn(
              "bg-muted/30 animate-pulse border-border-subtle",
              filterType === "illustration" || !filterType ? "aspect-[3/4]" : "aspect-square"
            )}
          />
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <BrutalistCard variant="panel" className="flex items-center justify-center p-12 border-dashed">
        <div className="text-center space-y-2">
          <Flame className="size-8 text-primary/20 mx-auto" />
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground/50">
            {filterType ? `No ${filterType.replace(/_/g, " ")} assets` : "Vault is empty"}
          </p>
        </div>
      </BrutalistCard>
    );
  }

  const isImageType = (type: string) => !type.includes("audio");

  return (
    <div className="flex gap-6 h-full items-start">
      <div className={cn(
        "grid gap-4 flex-1 transition-all",
        selectedAsset 
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
          : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      )}>
        {assets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => setSelectedAsset(asset)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedAsset(asset);
              }
            }}
            role="button"
            tabIndex={0}
            className="text-left outline-none group cursor-pointer"
          >
            <BrutalistCard
              variant="interactive"
              padding="none"
              className={cn(
                "relative overflow-hidden flex flex-col transition-all",
                selectedAsset?.id === asset.id && "ring-2 ring-brand-ember ring-offset-2 ring-offset-bg-panel"
              )}
            >
          {asset.type.includes("audio") ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-brand-ochre/5 aspect-square p-2">
              <FileAudio className="size-8 text-brand-ochre/40 mb-2" />
              <audio
                src={asset.url}
                controls
                className="w-full h-8 opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
          ) : (
            <div
              className={cn(
                "relative bg-muted",
                isImageType(asset.type) ? "aspect-[3/4]" : "aspect-square"
              )}
            >
              <Image
                src={asset.url}
                alt={asset.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </div>
          )}

          <div className="p-2 border-t border-border flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="font-mono text-nano uppercase tracking-wider text-foreground truncate">
                {asset.title}
              </p>
              <p className="font-mono text-micro uppercase tracking-widest text-primary truncate">
                {asset.type.replace(/_/g, " ")}
              </p>
            </div>
            {/* Hover Actions - Only show if not selected */}
            {selectedAsset?.id !== asset.id && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(asset.url);
                    toast.success("URL Copied", { description: "Asset URL copied to clipboard." });
                  }}
                  className="bg-background/80 backdrop-blur text-foreground p-1.5 border border-border hover:bg-brand-ember hover:text-primary-foreground hover:border-brand-ember transition-colors shadow-brutal-sm"
                  title="Copy URL"
                >
                  <Copy className="size-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Are you sure you want to delete this asset?")) {
                      handleDelete(asset.id);
                    }
                  }}
                  className="bg-background/80 backdrop-blur text-foreground p-1.5 border border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors shadow-brutal-sm"
                  title="Delete Asset"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            )}
            </div></BrutalistCard>
          </div>
        ))}
      </div>

      {/* Asset Detail Panel */}
      {selectedAsset && (
        <div className="w-[320px] shrink-0 sticky top-0 hidden lg:block border-l border-border-subtle pl-6 animate-in slide-in-from-right duration-300">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg tracking-tight uppercase">Asset Details</h3>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-muted-foreground hover:text-foreground p-1"
                aria-label="Close details"
              >
                &times;
              </button>
            </div>

            <div className="aspect-square bg-muted flex items-center justify-center border border-border overflow-hidden">
              {selectedAsset.type.includes("audio") ? (
                <FileAudio className="size-16 text-muted-foreground" />
              ) : (
                <Image
                  src={selectedAsset.url}
                  alt={selectedAsset.title || "Asset preview"}
                  width={320}
                  height={320}
                  className="object-contain w-full h-full"
                  unoptimized
                />
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-fine font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={selectedAsset.title || ""}
                  onChange={(e) => {
                    // Update locally first for responsive typing
                    setSelectedAsset((prev) => prev ? { ...prev, title: e.target.value } : prev);
                  }}
                  onBlur={(e) => handleUpdate(selectedAsset.id, { title: e.target.value })}
                  className="w-full h-9 px-3 bg-bg-base border border-border font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brand-ember"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label className="block text-fine font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={selectedAsset.tags?.join(", ") || ""}
                  onChange={(e) => {
                    const tags = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                    setSelectedAsset((prev) => prev ? { ...prev, tags } : prev);
                  }}
                  onBlur={(e) => {
                    const tags = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                    handleUpdate(selectedAsset.id, { tags });
                  }}
                  className="w-full h-9 px-3 bg-bg-base border border-border font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brand-ember"
                  placeholder="e.g. hero, forest, sketch"
                  disabled={isUpdating}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="p-2 bg-bg-base border border-border-subtle">
                  <span className="block text-muted-foreground uppercase tracking-widest mb-1 text-[10px]">Type</span>
                  <span className="text-foreground truncate block" title={selectedAsset.type}>{selectedAsset.type}</span>
                </div>
                <div className="p-2 bg-bg-base border border-border-subtle">
                  <span className="block text-muted-foreground uppercase tracking-widest mb-1 text-[10px]">Date</span>
                  <span className="text-foreground truncate block">
                    {selectedAsset.created_at ? new Date(selectedAsset.created_at).toLocaleDateString() : "Unknown"}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle flex flex-col gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedAsset.url);
                    toast.success("URL Copied", { description: "Asset URL copied to clipboard." });
                  }}
                  className="w-full h-9 flex items-center justify-center gap-2 border border-border bg-bg-base hover:bg-muted font-mono text-xs uppercase tracking-widest transition-colors"
                >
                  <Copy className="size-3.5" /> Copy URL
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this asset?")) {
                      handleDelete(selectedAsset.id);
                    }
                  }}
                  className="w-full h-9 flex items-center justify-center gap-2 border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground font-mono text-xs uppercase tracking-widest transition-colors"
                >
                  <Trash2 className="size-3.5" /> Delete Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { AssetGrid };
