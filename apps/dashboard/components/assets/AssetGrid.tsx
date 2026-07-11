"use client";

import * as React from "react";
import Image from "next/image";
import { Trash2, Flame, FileAudio, FileText, Copy, X } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { toast } from "sonner";
import { getAllAssets, deleteAsset, updateAsset } from "@/actions/assetActions";
import type { Database } from "@workspace/ui/types/supabase";
import { DashboardCard } from "@workspace/ui/components/DashboardCard";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@workspace/ui/components/pagination";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger
} from "@workspace/ui/components/attachment";

type AssetRow = Database["public"]["Tables"]["assets"]["Row"];

type AssetGridProps = {
  filterType?: string;
};

// ─── Component ─────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 20;

function AssetGrid({ filterType }: AssetGridProps) {
  const [assets, setAssets] = React.useState<AssetRow[] | undefined>(undefined);
  const [selectedAsset, setSelectedAsset] = React.useState<AssetRow | null>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [prevFilterType, setPrevFilterType] = React.useState(filterType);

  if (filterType !== prevFilterType) {
    setPrevFilterType(filterType);
    setCurrentPage(1);
  }

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

  // --- Pagination Logic & Clamping ---
  const totalItems = assets?.length || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  
  if (assets && currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  if (assets === undefined) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <DashboardCard
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
      <DashboardCard variant="panel" className="flex items-center justify-center p-12 border-dashed">
        <div className="text-center space-y-2">
          <Flame className="size-8 text-primary/20 mx-auto" />
          <p className="font-sans text-xs tracking-wide text-muted-foreground/50">
            {filterType ? `No ${filterType.replace(/_/g, " ")} assets` : "Vault is empty"}
          </p>
        </div>
      </DashboardCard>
    );
  }

  const isImageType = (type: string) => !type.includes("audio") && type !== "text_story";

  /** Parse the URL pathname to safely detect file extension, even with query strings */
  function getAssetPathname(url: string): string {
    try { return new URL(url).pathname } catch { return url }
  }

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAssets = assets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (e: React.MouseEvent, page: number) => {
    e.preventDefault();
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Optional: scroll to top of grid
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="flex gap-6 h-full items-start">
      <div className="flex-1 flex flex-col gap-6">
        <div className={cn(
          "grid gap-4 transition-all",
          selectedAsset 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        )}>
          {paginatedAssets.map((asset) => (
          <Attachment
            key={asset.id}
            size="default"
            orientation="vertical"
            className={cn(
              "w-full bg-bg-surface hover:shadow-nordic-sm transition-all flex-nowrap",
              selectedAsset?.id === asset.id && "ring-2 ring-brand-ember ring-offset-2 ring-offset-bg-panel border-transparent"
            )}
          >
            <AttachmentMedia
              variant={isImageType(asset.type) ? "image" : "icon"}
              className={cn(
                "w-full bg-brand-ochre/5 aspect-[3/4]",
                !isImageType(asset.type) && "border-b border-border/50"
              )}
            >
              {asset.type.includes("audio") ? (
                <FileAudio className="size-12 text-brand-ochre/40" />
              ) : (asset.type as string) === "text_story" ? (
                <FileText className="size-12 text-brand-ochre/40" />
              ) : (
                <Image
                  src={asset.url}
                  alt={asset.title || "Asset"}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover"
                />
              )}
            </AttachmentMedia>

            <AttachmentContent className="p-3">
              <AttachmentTitle 
                className="font-mono text-nano text-foreground whitespace-normal line-clamp-2 break-all" 
                title={asset.title}
              >
                {asset.title}
              </AttachmentTitle>
              <AttachmentDescription className="font-mono text-micro text-primary mt-1">
                {asset.type.replace(/_/g, " ")}
              </AttachmentDescription>
            </AttachmentContent>

            <AttachmentActions className={cn(
              "absolute top-2 right-2 transition-opacity duration-200",
              selectedAsset?.id === asset.id ? "hidden" : "opacity-0 group-hover/attachment:opacity-100 group-focus-within/attachment:opacity-100"
            )}>
              <AttachmentAction
                aria-label="Copy URL"
                className="bg-background/80 backdrop-blur-md shadow-sm border border-border text-foreground hover:bg-brand-ember hover:text-primary-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(asset.url);
                  toast.success("URL Copied", { description: "Asset URL copied to clipboard." });
                }}
              >
                <Copy />
              </AttachmentAction>
              <AttachmentAction
                aria-label="Delete Asset"
                className="bg-background/80 backdrop-blur-md shadow-sm border border-border text-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Are you sure you want to delete this asset?")) {
                    handleDelete(asset.id);
                  }
                }}
              >
                <Trash2 />
              </AttachmentAction>
            </AttachmentActions>

            <AttachmentTrigger
              onClick={() => setSelectedAsset(asset)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedAsset(asset);
                }
              }}
              aria-label={`Select ${asset.title}`}
            />
          </Attachment>
        ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="py-4 border-t border-border-subtle mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => handlePageChange(e, currentPage - 1)}
                    aria-disabled={currentPage === 1}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show current page, first, last, and neighbors
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink 
                          href="#" 
                          isActive={page === currentPage}
                          onClick={(e) => handlePageChange(e, page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  
                  // Show ellipsis for gaps
                  if (page === 2 && currentPage > 3) {
                    return <PaginationItem key="ellipsis-start"><PaginationEllipsis /></PaginationItem>;
                  }
                  if (page === totalPages - 1 && currentPage < totalPages - 2) {
                    return <PaginationItem key="ellipsis-end"><PaginationEllipsis /></PaginationItem>;
                  }
                  
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => handlePageChange(e, currentPage + 1)}
                    aria-disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Asset Detail Panel */}
      {selectedAsset && (
        <div className="w-[320px] shrink-0 sticky top-0 hidden lg:flex flex-col max-h-[calc(100vh-16rem)] overflow-y-auto border-l border-border-subtle pl-6 animate-in slide-in-from-right duration-300">
          <div className="space-y-6 pb-6">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg tracking-tight uppercase text-foreground">Asset Details</h3>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 bg-bg-base border border-transparent hover:border-border-strong rounded-none"
                aria-label="Close details"
              >
                <X className="size-4" />
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
                <label className="block text-fine font-sans font-medium tracking-wide text-muted-foreground mb-1.5">
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
                  className="w-full h-9 px-3 bg-bg-base border border-border font-sans text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-ember"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label className="block text-fine font-sans font-medium tracking-wide text-muted-foreground mb-1.5">
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
                  className="w-full h-9 px-3 bg-bg-base border border-border font-sans text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-ember"
                  placeholder="e.g. hero, forest, sketch"
                  disabled={isUpdating}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 font-sans text-xs">
                <div className="p-2 bg-bg-base border border-border-subtle">
                  <span className="block text-muted-foreground tracking-wide mb-1 text-[10px]">Type</span>
                  <span className="text-foreground truncate block" title={selectedAsset.type}>{selectedAsset.type}</span>
                </div>
                <div className="p-2 bg-bg-base border border-border-subtle">
                  <span className="block text-muted-foreground tracking-wide mb-1 text-[10px]">Date</span>
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
                  className="w-full h-9 flex items-center justify-center gap-2 border border-border bg-bg-base hover:bg-muted font-sans text-xs tracking-wide transition-colors"
                >
                  <Copy className="size-3.5" /> Copy URL
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this asset?")) {
                      handleDelete(selectedAsset.id);
                    }
                  }}
                  className="w-full h-9 flex items-center justify-center gap-2 border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground font-sans text-xs tracking-wide transition-colors"
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
