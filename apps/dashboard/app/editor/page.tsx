"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { RichTextEditor } from "@workspace/ui/components/editor/rich-text-editor";
import { RichTextRenderer } from "@workspace/ui/components/editor/rich-text-renderer";
import { Button } from "@workspace/ui/components/button";
import { Save, ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { Id } from "../../../../convex/_generated/dataModel";

export default function EditorPage() {
  const [sceneId, setSceneId] = useState<Id<"scenes"> | null>(null);
  const [content, setContent] = useState<any>(null);
  const [isPreview, setIsPreview] = useState(false);
  
  // NOTE: For MVP we fetch the very first scene for demo. 
  // In production, ?sceneId= param should be used.
  const scenes = useQuery(api.scenes.getByChapterId, { chapterId: "jh792x0t5c18684v57hsvb7sds7btfvk" as Id<"chapters"> });
  const saveScene = useMutation(api.scenes.saveSceneContent);

  useEffect(() => {
    if (scenes && scenes.length > 0 && !sceneId) {
      setSceneId(scenes[0]._id);
      setContent(scenes[0].tiptapContent || { type: "doc", content: [{ type: "paragraph" }] });
    }
  }, [scenes, sceneId]);

  const handleSave = async () => {
    if (!sceneId || !content) return;
    try {
      await saveScene({
        sceneId,
        tiptapContent: content,
        isDraft: true,
      });
      // Simple visual feedback instead of heavy toast for MVP
      const btn = document.getElementById("save-btn");
      if (btn) {
        btn.textContent = "Saved";
        setTimeout(() => (btn.innerHTML = `<svg ...>Save`), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!scenes) {
    return <div className="p-12 text-muted-foreground animate-pulse">Initializing Folio...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border shadow-brutal-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="flex flex-col">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Draft State</span>
            <span className="font-heading font-semibold">Active Transcription</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsPreview(!isPreview)}>
            <Eye className="size-4 mr-2" />
            {isPreview ? "Edit" : "Preview"}
          </Button>
          <Button id="save-btn" size="sm" onClick={handleSave}>
            <Save className="size-4 mr-2" />
            Save
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-12 px-6">
          {isPreview ? (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <RichTextRenderer content={content} />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4">
               <RichTextEditor 
                  value={content} 
                  onChange={(val) => setContent(val)} 
               />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
