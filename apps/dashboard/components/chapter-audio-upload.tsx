"use client";

import * as React from "react";
import { Upload, X, Loader2, Music } from "lucide-react";
import { createAsset } from "@/actions/assetActions";
import { getCloudinarySignature } from "@/actions/cloudinaryActions";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

interface ChapterAudioUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  className?: string;
}

export function ChapterAudioUpload({ value, onChange, className }: ChapterAudioUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<string>("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g. 50MB)
    const MAX_FILE_SIZE_MB = 50;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large. Please select a file smaller than ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus("Uploading...");

      const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      if (!CLOUDINARY_CLOUD_NAME) {
        throw new Error(
          "Missing Cloudinary configuration. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local",
        );
      }

      const { timestamp, signature, apiKey, folder } = await getCloudinarySignature("fungga-wari/audio");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);
      // For audio, Cloudinary expects resource_type "video" or "auto"
      // We can just use "auto/upload"

      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Upload to Cloudinary failed");
      }

      const uploadResponse = await response.json();

      // Save the Cloudinary URL to the database as an asset
      React.startTransition(() => {
        createAsset({
          url: uploadResponse.secure_url,
          publicId: uploadResponse.public_id,
          title: file.name,
          type: "audio_lore",
        }).catch((err) => {
          console.error("Failed to save asset into supabase:", err);
        });
      });

      onChange(uploadResponse.secure_url);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error(err instanceof Error ? err.message : "Upload to Cloudinary failed");
    } finally {
      setIsUploading(false);
      setUploadStatus("");
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const clearAudio = () => {
    onChange("");
  };

  return (
    <div
      className={cn(
        "relative group border border-border border-dashed bg-bg-surface flex flex-col items-center justify-center overflow-hidden transition-colors hover:bg-bg-overlay h-24",
        className,
      )}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="audio/*"
        className="hidden"
      />

      {isUploading ? (
        <div className="flex flex-col items-center text-muted-foreground/50">
          <Loader2 className="size-6 animate-spin mb-2 text-brand-ember/50" />
          <span className="font-mono text-xs uppercase tracking-widest text-brand-ember/70">
            {uploadStatus || "Uploading..."}
          </span>
        </div>
      ) : value ? (
        <div className="flex flex-col items-center justify-center w-full h-full p-4">
          <audio controls src={value} className="w-full max-w-sm mb-2" />
          {/* Overlay actions on hover */}
          <div className="absolute inset-0 bg-cinematic-bg/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-cinematic-text hover:text-cinematic-text hover:bg-accent bg-background/50"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="size-4 mr-2" /> Change
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/20 bg-background/50"
              onClick={clearAudio}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center text-muted-foreground/50 cursor-pointer w-full h-full"
          onClick={() => inputRef.current?.click()}
        >
          <Music className="size-6 mb-2 group-hover:text-brand-ember/50 transition-colors" />
          <span className="font-mono text-xs uppercase tracking-widest text-center px-4">
            Upload Audio Narration
          </span>
        </div>
      )}
    </div>
  );
}
