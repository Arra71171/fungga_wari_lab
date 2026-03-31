"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../../convex/_generated/api";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Utility functions removed as we use Tiptap JSON directly

export default function SceneEditorPage({ params }: { params: Promise<{ id: string, sceneId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const sceneDetails = useQuery(api.scenes.getSceneDetails, { sceneId: resolvedParams.sceneId as any });
  const saveSceneContent = useMutation(api.scenes.saveSceneContent);
  
  const [isSaving, setIsSaving] = useState(false);

  // If scene is loaded, we convert blocks to HTML to feed Tiptap
  // We only want to set initial content once.
  if (sceneDetails === undefined) {
    return <div className="p-8">Loading scene editor...</div>;
  }

  if (sceneDetails === null) {
    return <div className="p-8">Scene not found</div>;
  }

  const handleSave = async (tiptapJson: any) => {
    setIsSaving(true);
    try {
      await saveSceneContent({
        sceneId: resolvedParams.sceneId as any,
        tiptapContent: tiptapJson,
        isDraft: true,
      });
      // Optionally show a toast here
    } catch (error) {
      console.error("Failed to save scene", error);
      alert("Failed to save scene");
    } finally {
      setIsSaving(false);
    }
  };

  const initialContent = sceneDetails.scene.tiptapContent || "<p>Start writing your scene here...</p>";

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/stories/${resolvedParams.id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-heading font-semibold">Scene Editor</h1>
          <p className="text-sm text-muted-foreground">Scene {sceneDetails.scene.order}</p>
        </div>
      </div>

      <TiptapEditor 
        initialContent={initialContent} 
        onSave={handleSave} 
        isSaving={isSaving} 
      />
    </div>
  );
}
