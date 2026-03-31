"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../../convex/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { FileImage, Loader2 } from "lucide-react";

export function ImageUploadWidget({ onUploadSuccess }: { onUploadSuccess: (url: string) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
  const getFileUrlMutation = useMutation(api.upload.getFileUrl);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Get a short-lived upload URL
      const postUrl = await generateUploadUrl();
      
      // 2. POST the file to the URL
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      
      // 3. Obtain the actual fetchable URL.
      const fileUrl = await getFileUrlMutation({ storageId });
      
      if (fileUrl) {
        onUploadSuccess(fileUrl);
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        id="imageUpload"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        disabled={isUploading}
      />
      <Button
        variant="ghost"
        size="sm"
        className="font-mono"
        disabled={isUploading}
        onClick={() => document.getElementById("imageUpload")?.click()}
      >
        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileImage className="mr-2 h-4 w-4" />}
        {isUploading ? "Uploading..." : "Image"}
      </Button>
    </div>
  );
}
