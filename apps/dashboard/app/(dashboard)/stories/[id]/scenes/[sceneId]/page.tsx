"use client";

import { use, useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../../convex/_generated/api";
import { RichTextEditor } from "@workspace/ui/components/editor/rich-text-editor";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft, Save, ImagePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/core";

export default function SceneEditorPage({ params }: { params: Promise<{ id: string; sceneId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const sceneDetails = useQuery(api.scenes.getSceneDetails, { sceneId: resolvedParams.sceneId as never });
  const saveSceneContent = useMutation(api.scenes.saveSceneContent);
  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
  const confirmUpload = useMutation(api.upload.confirmUpload);

  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState<JSONContent | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");

  // Parse initial content once
  if (sceneDetails && content === null) {
    if (sceneDetails.scene.tiptapContent) {
      setContent(sceneDetails.scene.tiptapContent as JSONContent);
    } else {
      setContent({ type: "doc", content: [{ type: "paragraph" }] });
    }
  }

  if (sceneDetails === undefined) {
    return <div className="p-8 text-muted-foreground font-mono text-sm animate-pulse">Loading scene editor...</div>;
  }

  if (sceneDetails === null) {
    return <div className="p-8 text-destructive font-mono text-sm">Scene not found.</div>;
  }

  const handleSave = async () => {
    if (!content) return;
    setIsSaving(true);
    try {
      await saveSceneContent({
        sceneId: resolvedParams.sceneId as never,
        tiptapContent: content,
        isDraft: true,
      });
      const btn = document.getElementById("save-btn");
      if (btn) {
        const original = btn.innerHTML;
        btn.textContent = "✓ Saved";
        setTimeout(() => (btn.innerHTML = original), 2000);
      }
    } catch (err) {
      console.error("Failed to save scene", err);
      alert("Failed to save scene.");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * handleImageUpload — called when a file is dropped into the Tiptap editor.
   * 1. Gets a signed upload URL from Convex Storage
   * 2. PUTs the file directly to that URL
   * 3. Calls confirmUpload to persist to the assets table and get the public URL
   * 4. Returns the URL so Tiptap inserts an image node
   */
  const handleImageUpload = useCallback(async (file: File): Promise<string | undefined> => {
    setUploadStatus("uploading");
    try {
      // Step 1: get upload URL
      const uploadUrl = await generateUploadUrl();

      // Step 2: PUT the file to Convex Storage
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);

      const { storageId } = await res.json() as { storageId: string };

      // Step 3: Persist and get public URL
      const publicUrl = await confirmUpload({
        storageId: storageId as never,
        title: file.name,
        type: "illustration",
      });

      setUploadStatus("done");
      setTimeout(() => setUploadStatus("idle"), 3000);

      return publicUrl ?? undefined;
    } catch (err) {
      console.error("Image upload failed:", err);
      setUploadStatus("error");
      setTimeout(() => setUploadStatus("idle"), 4000);
      return undefined;
    }
  }, [generateUploadUrl, confirmUpload]);

  const uploadLabel: Record<typeof uploadStatus, string> = {
    idle: "",
    uploading: "Uploading image...",
    done: "✓ Image uploaded",
    error: "⚠ Upload failed",
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md pt-4 pb-4 flex items-center justify-between border-b border-border/40 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/stories/${resolvedParams.id}`)}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-heading font-semibold">Scene Editor</h1>
            <p className="text-xs text-muted-foreground font-mono">
              Editing Scene {sceneDetails.scene.order}
              {uploadStatus !== "idle" && (
                <span className={uploadStatus === "error" ? " text-destructive" : " text-primary"}>
                  {" · "}{uploadLabel[uploadStatus]}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-widest border border-border px-2 py-1">
            <ImagePlus className="size-3" />
            Drop image to upload
          </span>
          <Button id="save-btn" size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="size-4 mr-2" />
            {isSaving ? "Saving..." : "Save Scene"}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="animate-in fade-in slide-in-from-bottom-4">
        {content && (
          <RichTextEditor
            value={content}
            onChange={(val) => setContent(val)}
            onImageUpload={handleImageUpload}
          />
        )}
      </div>
    </div>
  );
}
