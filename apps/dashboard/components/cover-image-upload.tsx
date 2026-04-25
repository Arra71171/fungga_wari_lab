"use client";

import * as React from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { createAsset } from "@/actions/assetActions";
import { getCloudinarySignature } from "@/actions/cloudinaryActions";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import Image from "next/image";

interface CoverImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

// Max dimension for the longer side — keeps portraits sharp but well under 10MB
const MAX_DIMENSION = 2000;
// JPEG quality — 0.87 gives excellent visual fidelity at ~1–3 MB for portrait images
const JPEG_QUALITY = 0.87;

/**
 * Compresses and resizes an image file using the Canvas API.
 * Always outputs JPEG to guarantee a consistent, small file size.
 * Portrait images (3:4) at MAX_DIMENSION are typically 500KB–2MB.
 */
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Scale down if either dimension exceeds max
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context unavailable"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas compression failed"));
            return;
          }
          const compressed = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        "image/jpeg",
        JPEG_QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = objectUrl;
  });
}

export function CoverImageUpload({ value, onChange, className }: CoverImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (PNG, JPEG, WEBP).");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus("Compressing...");

      const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      if (!CLOUDINARY_CLOUD_NAME) {
        throw new Error(
          "Missing Cloudinary configuration. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local",
        );
      }

      // Compress before upload — brings any image under Cloudinary's 10MB free-tier limit
      const compressed = await compressImage(file);

      setUploadStatus("Uploading...");

      const { timestamp, signature, apiKey, folder } = await getCloudinarySignature("fungga-wari/covers");

      const formData = new FormData();
      formData.append("file", compressed);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Upload to Cloudinary failed");
      }

      const uploadResponse = await response.json();

      // Save the Cloudinary URL to the database
      React.startTransition(() => {
        createAsset({
          url: uploadResponse.secure_url,
          publicId: uploadResponse.public_id,
          title: file.name,
          type: "cover",
        }).catch((err) => {
          console.error("Failed to save asset into supabase:", err);
        });
      });

      onChange(uploadResponse.secure_url);
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadStatus("");
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const clearImage = () => {
    setError("");
    onChange("");
  };

  return (
    <div className="space-y-2 w-full h-full">
      <div
        className={cn(
          "relative group border border-border border-dashed bg-bg-surface flex flex-col items-center justify-center overflow-hidden transition-colors hover:bg-bg-overlay aspect-[3/4] h-48",
          className,
        )}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
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
          <>
            <Image
              src={value}
              alt="Cover Preview"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
            {/* Overlay actions */}
            <div className="absolute inset-0 bg-cinematic-bg/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-cinematic-text hover:text-cinematic-text hover:bg-accent"
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="size-4 mr-2" /> Change
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/20"
                onClick={clearImage}
              >
                <X className="size-4" />
              </Button>
            </div>
          </>
        ) : (
          <div
            className="flex flex-col items-center justify-center text-muted-foreground/50 cursor-pointer w-full h-full"
            onClick={() => inputRef.current?.click()}
          >
            <ImageIcon className="size-6 mb-2 group-hover:text-brand-ember/50 transition-colors" />
            <span className="font-mono text-xs uppercase tracking-widest text-center px-4">
              Upload Cover (Portrait)
            </span>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm font-medium text-destructive mt-1 text-center">{error}</p>
      )}
    </div>
  );
}
