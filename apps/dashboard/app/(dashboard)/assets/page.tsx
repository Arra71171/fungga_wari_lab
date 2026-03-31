"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../../convex/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Search, Filter, UploadCloud, ImageIcon, X, Loader2 } from "lucide-react";
import Image from "next/image";

export default function AssetVaultPage() {
  const assets = useQuery(api.assets.list) || [];
  const generateUploadUrl = useMutation(api.assets.generateUploadUrl);
  const createAsset = useMutation(api.assets.create);

  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // 1. Get upload URL
      const postUrl = await generateUploadUrl();
      
      // 2. Post file
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      
      // 3. Save to database
      await createAsset({
        title: file.name,
        storageId,
        type: file.type.startsWith("image/") ? "illustration" : "other",
        tags: ["upload"],
      });
      
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6 shrink-0">
        <div>
          <h1 className="font-display text-4xl italic tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
            Asset Vault
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Manage illustrations, field recordings, and references for the folklore project.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 font-mono text-xs border-primary/30 text-primary hover:bg-primary/10">
            <Filter className="size-3" /> Filter
          </Button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            className="hidden" 
            accept="image/*,audio/*"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
            className="gap-2 shadow-lg shadow-primary/20"
          >
            {isUploading ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />} 
            {isUploading ? "Uploading..." : "Upload Asset"}
          </Button>
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center shrink-0">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search assets by tag or name..." 
            className="pl-9 bg-secondary/30 border-border/50 focus-visible:ring-primary/50"
          />
        </div>
        
        <div className="flex items-center bg-secondary/30 p-1 rounded-none border border-border/40 w-full sm:w-auto overflow-x-auto">
          {["All", "Illustrations", "Sketches", "Audio Lore"].map((tab, i) => (
            <Button 
              key={tab}
              variant="ghost"
              className={`px-4 py-1.5 h-auto rounded-none text-sm font-medium whitespace-nowrap transition-colors ${i === 0 ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-transparent"}`}
            >
              {tab}
            </Button>
          ))}
        </div>
      </div>

      {/* Asset Grid (Masonry simulation) */}
      <div className="flex-1 overflow-y-auto pb-10 pr-2">
        {assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full border border-dashed border-border/50 rounded-none bg-secondary/10 p-12 text-center">
            <div className="size-16 rounded-none bg-primary/10 flex items-center justify-center mb-4">
              <ImageIcon className="size-8 text-primary/70" />
            </div>
            <h3 className="text-lg font-bold font-heading mb-1">Vault is Empty</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              Upload your first high-fidelity illustration or reference sketch to start building the visual language of Manipur&apos;s folklore.
            </p>
            <Button onClick={() => fileInputRef.current?.click()} className="shadow-lg">
              <UploadCloud className="size-4 mr-2" /> Upload to Vault
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[250px]">
            {assets.map((asset: any) => (
              <div 
                key={asset._id} 
                className="group relative rounded-none overflow-hidden border border-border/40 bg-secondary/20 hover:border-primary/50 transition-colors"
              >
                {asset.realUrl ? (
                  <Image 
                    src={asset.realUrl} 
                    alt={asset.title} 
                    fill
                    className="object-cover transition-transform group-hover:scale-105" 
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="size-8 opacity-20" />
                  </div>
                )}
                
                {/* Overlay Metadata */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <h4 className="text-sm font-medium truncate mb-1">{asset.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono bg-primary/20 text-primary-foreground px-2 py-0.5 rounded">
                      {asset.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
