"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../../convex/_generated/api";
import { RichTextEditor } from "@workspace/ui/components/editor/rich-text-editor";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/core";

export default function SceneEditorPage({ params }: { params: Promise<{ id: string, sceneId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const sceneDetails = useQuery(api.scenes.getSceneDetails, { sceneId: resolvedParams.sceneId as any });
  const saveSceneContent = useMutation(api.scenes.saveSceneContent);
  
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState<JSONContent | null>(null);

  // Parse initial content correctly
  if (sceneDetails && content === null) {
    if (sceneDetails.scene.tiptapContent) {
      setContent(sceneDetails.scene.tiptapContent as JSONContent);
    } else {
      setContent({ type: "doc", content: [{ type: "paragraph" }] });
    }
  }

  if (sceneDetails === undefined) {
    return <div className="p-8">Loading scene editor...</div>;
  }

  if (sceneDetails === null) {
    return <div className="p-8">Scene not found</div>;
  }

  const handleSave = async () => {
    if (!content) return;
    setIsSaving(true);
    try {
      await saveSceneContent({
        sceneId: resolvedParams.sceneId as any,
        tiptapContent: content,
        isDraft: true,
      });
      // Simple visual feedback
      const btn = document.getElementById("save-btn");
      if (btn) {
        const originalText = btn.innerHTML;
        btn.textContent = "Saved";
        setTimeout(() => (btn.innerHTML = originalText), 2000);
      }
    } catch (error) {
      console.error("Failed to save scene", error);
      alert("Failed to save scene");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md pt-4 pb-4 flex items-center justify-between border-b border-border/40 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/stories/${resolvedParams.id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-heading font-semibold">Scene Editor</h1>
            <p className="text-xs text-muted-foreground">Editing Scene {sceneDetails.scene.order}</p>
          </div>
        </div>
        <Button id="save-btn" size="sm" onClick={handleSave} disabled={isSaving}>
          <Save className="size-4 mr-2" />
          {isSaving ? "Saving..." : "Save Scene"}
        </Button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4">
        {content && (
          <RichTextEditor 
            value={content} 
            onChange={(val) => setContent(val)} 
          />
        )}
      </div>
    </div>
  );
}
