"use client";

import { useState, useRef, startTransition } from "react";
import { createAsset } from "@/actions/assetActions";
import { Button } from "@workspace/ui/components/button";
import { UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Label } from "@workspace/ui/components/label";

// ─── Cloudinary config ───────────────────────────────────────────────────────
// Files are uploaded directly to Cloudinary CDN — NOT Convex Storage.
// This prevents Convex file bandwidth overages on the Free tier.
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export function MediaUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [assetType, setAssetType] = useState("illustration");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      toast.error("Cloudinary not configured", {
        description: "Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local",
      });
      return;
    }

    try {
      setIsUploading(true);

      // 1. Upload directly to Cloudinary via unsigned preset
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
        { method: "POST", body: formData }
      );

      if (!cloudinaryRes.ok) {
        throw new Error("Cloudinary upload failed");
      }

      const cloudinaryData = await cloudinaryRes.json();
      const { secure_url, public_id } = cloudinaryData as { secure_url: string; public_id: string };

      // 2. Save the Cloudinary URL to the assets table (no storageId)
      startTransition(() => {
        createAsset({
          title: file.name,
          url: secure_url,
          publicId: public_id,
          type: assetType as "illustration" | "sketch" | "reference_photo" | "audio_lore",
        }).catch((err) => {
          console.error("Failed to save asset into supabase:", err);
        });
      });

      toast.success("Asset uploaded", { description: "Saved to Cloudinary CDN." });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload Failed", { description: "Failed to upload media file." });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-bg-surface border border-border-subtle p-6 flex flex-col items-center justify-center space-y-4">
      <div className="flex gap-4 w-full max-w-sm mb-4">
        <div className="flex-1 space-y-1">
          <Label className="font-mono text-[10px] uppercase text-muted-foreground tracking-widest">Asset Type</Label>
          <Select value={assetType} onValueChange={setAssetType} disabled={isUploading}>
            <SelectTrigger className="bg-bg-overlay border-border font-mono text-sm rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-bg-panel border-border rounded-none">
              <SelectItem value="illustration" className="font-mono text-sm">Illustration</SelectItem>
              <SelectItem value="sketch" className="font-mono text-sm">Design Sketch</SelectItem>
              <SelectItem value="reference_photo" className="font-mono text-sm">Reference Photo</SelectItem>
              <SelectItem value="audio_lore" className="font-mono text-sm">Audio (Lore)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,audio/mp3,audio/wav"
        onChange={handleUpload}
        disabled={isUploading}
      />

      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="h-40 w-full max-w-sm border border-dashed border-border-strong bg-bg-overlay hover:bg-bg-overlay/80 hover:border-brand-ember/50 transition-colors flex flex-col gap-2 rounded-none group"
        variant="ghost"
      >
        {isUploading ? (
          <Loader2 className="size-8 text-brand-ember animate-spin" />
        ) : (
          <>
            <UploadCloud className="size-8 text-muted-foreground group-hover:text-brand-ember transition-colors" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider group-hover:text-foreground">
              Drop or Browse Media
            </span>
            <span className="font-mono text-[10px] text-muted-foreground/60">
              Served via Cloudinary CDN
            </span>
          </>
        )}
      </Button>
    </div>
  );
}
