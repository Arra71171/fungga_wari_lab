"use client";

import * as React from "react";
import Image from "next/image";
import { Trash2, Flame, FileAudio, Copy } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { toast } from "sonner";
import { getAllAssets, deleteAsset } from "@/actions/assetActions";
import type { Database } from "@workspace/ui/types/supabase";
import { BrutalistCard } from "@workspace/ui/components/BrutalistCard";

type AssetRow = Database["public"]["Tables"]["assets"]["Row"];

type AssetGridProps = {
  filterType?: string;
};

function AssetGrid({ filterType }: AssetGridProps) {
  const [assets, setAssets] = React.useState<AssetRow[] | undefined>(undefined);

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

  const handleDelete = async (id: string) => {
    // Optimistic removal
    setAssets((prev) => prev?.filter((a) => a.id !== id));
    try {
      await deleteAsset(id);
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {assets.map((asset) => (
        <BrutalistCard
          key={asset.id}
          variant="interactive"
          padding="none"
          className="group relative overflow-hidden flex flex-col transition-all"
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

            <div className="flex gap-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(asset.url);
                  toast.success("URL Copied", {
                    description: "Asset URL copied to clipboard",
                  });
                }}
                aria-label={`Copy URL for ${asset.title}`}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-foreground shrink-0 border border-border"
              >
                <Copy className="size-3" />
              </button>
              <button
                onClick={() => handleDelete(asset.id)}
                aria-label={`Delete ${asset.title}`}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive shrink-0 border border-border"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          </div>
        </BrutalistCard>
      ))}
    </div>
  );
}

export { AssetGrid };
