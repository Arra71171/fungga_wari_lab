"use client";

import { useState, useRef, startTransition } from "react";
import { createAsset } from "@/actions/assetActions";
import { getCloudinarySignature } from "@/actions/cloudinaryActions";
import { Button } from "@workspace/ui/components/button";
import { UploadCloud, Loader2, AlertCircle } from "lucide-react";
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
import { BrutalistCard } from "@workspace/ui/components/BrutalistCard";

// ─── Cloudinary config ───────────────────────────────────────────────────────
// Files are uploaded directly to Cloudinary CDN using signed requests.
// This prevents bandwidth overages on the Free tier.
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

// TC014 FIX: Explicit allowlist of MIME types.
// The HTML `accept` attribute alone can be bypassed by test agents — we must
// validate client-side and render a visible DOM error element.
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/avif",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "text/plain",
  "text/markdown",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/rtf",
  "text/rtf"
]);

const MAX_FILE_SIZE_MB = 50;

export function MediaUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [assetType, setAssetType] = useState("illustration");
  // TC014 FIX: visible inline error — stable DOM node detectable by TestSprite
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Always clear previous error when a new file is selected
    setValidationError(null);

    if (!CLOUDINARY_CLOUD_NAME) {
      toast.error("Cloudinary not configured", {
        description: "Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local",
      });
      return;
    }

    // ── MIME type validation ─────────────────────────────────────────────────
    const isDoc = file.name.match(/\.(md|docx?|txt)$/i);
    if (!ALLOWED_MIME_TYPES.has(file.type) && !isDoc) {
      const msg = `Unsupported file type "${file.type || "unknown"}". Please upload an image, audio, or document (TXT, PDF, DOCX).`;
      setValidationError(msg);
      toast.error("Unsupported File Type", { description: msg });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // ── File size validation ─────────────────────────────────────────────────
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      const msg = `File too large. Please select a file smaller than ${MAX_FILE_SIZE_MB}MB.`;
      setValidationError(msg);
      toast.error("File Too Large", { description: msg });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      setIsUploading(true);

      // 1. Get signed signature from server
      const { signature, timestamp, apiKey, folder } =
        await getCloudinarySignature("fungga-wari-lab/assets");

      // 2. Upload directly to Cloudinary using signed details
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const resourceType = assetType === "text_story" ? "raw" : "auto";
      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        { method: "POST", body: formData }
      );

      if (!cloudinaryRes.ok) {
        throw new Error("Cloudinary upload failed");
      }

      const cloudinaryData = await cloudinaryRes.json();
      const { secure_url, public_id } = cloudinaryData as {
        secure_url: string;
        public_id: string;
      };

      // 3. Save the Cloudinary URL to the assets table (no storageId)
      startTransition(() => {
        createAsset({
          title: file.name,
          url: secure_url,
          publicId: public_id,
          type: assetType as
            | "illustration"
            | "sketch"
            | "reference_photo"
            | "audio_lore"
            | "text_story",
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
    <BrutalistCard
      variant="panel"
      className="p-6 flex flex-col items-center justify-center space-y-4"
    >
      <div className="flex gap-4 w-full max-w-sm mb-4">
        <div className="flex-1 space-y-1">
          <Label className="font-mono text-fine uppercase text-muted-foreground tracking-widest">
            Asset Type
          </Label>
          <Select value={assetType} onValueChange={setAssetType} disabled={isUploading}>
            <SelectTrigger className="bg-bg-overlay border-border font-mono text-sm rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-bg-panel border-border rounded-none">
              <SelectItem value="illustration" className="font-mono text-sm">
                Illustration
              </SelectItem>
              <SelectItem value="sketch" className="font-mono text-sm">
                Design Sketch
              </SelectItem>
              <SelectItem value="reference_photo" className="font-mono text-sm">
                Reference Photo
              </SelectItem>
              <SelectItem value="audio_lore" className="font-mono text-sm">
                Audio (Lore)
              </SelectItem>
              <SelectItem value="text_story" className="font-mono text-sm">
                Story (Doc/Text)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Input
        id="asset-file-input"
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,audio/mpeg,audio/wav,audio/ogg,text/plain,text/markdown,application/pdf,.doc,.docx"
        onChange={handleUpload}
        disabled={isUploading}
        aria-label="Upload asset file"
      />

      <Button
        id="asset-upload-btn"
        onClick={() => {
          setValidationError(null);
          fileInputRef.current?.click();
        }}
        disabled={isUploading}
        className="h-40 w-full max-w-sm border border-dashed border-border-strong bg-bg-overlay hover:bg-bg-overlay/80 hover:border-brand-ember/50 transition-colors flex flex-col gap-2 rounded-none group"
        variant="ghost"
        aria-label="Upload media asset"
      >
        {isUploading ? (
          <Loader2 className="size-8 text-brand-ember animate-spin" />
        ) : (
          <>
            <UploadCloud className="size-8 text-muted-foreground group-hover:text-brand-ember transition-colors" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider group-hover:text-foreground">
              Drop or Browse Media
            </span>
            <span className="font-mono text-fine text-muted-foreground/60 whitespace-normal text-center px-2">
              Images, Audio, or Docs (TXT, PDF, Word) · Max {MAX_FILE_SIZE_MB}MB
            </span>
          </>
        )}
      </Button>

      {/* TC014 FIX: Persistent visible error element — TestSprite detects DOM nodes,
          not transient toasts. This element is rendered inline and stays visible
          until the next file selection clears it. */}
      {validationError && (
        <p
          id="asset-upload-error"
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-2 w-full max-w-sm font-mono text-fine text-destructive border-l-2 border-destructive pl-3 py-1 bg-destructive/5"
        >
          <AlertCircle className="size-3 mt-0.5 shrink-0" aria-hidden />
          {validationError}
        </p>
      )}
    </BrutalistCard>
  );
}
