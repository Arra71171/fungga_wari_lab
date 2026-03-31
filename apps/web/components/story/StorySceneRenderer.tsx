"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Doc } from "../../../../convex/_generated/dataModel";
import { RichTextRenderer } from "@workspace/ui/components/editor/rich-text-renderer";

interface StorySceneRendererProps {
  scene: Doc<"scenes"> | null;
}

export function StorySceneRenderer({ scene }: StorySceneRendererProps) {
  if (!scene) {
    return (
      <div className="flex h-full w-full items-center justify-center p-12">
        <div className="animate-pulse bg-muted h-64 w-64 rounded-none" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={scene._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto flex max-w-3xl flex-col gap-8 pb-32 pt-16"
      >
        {scene.tiptapContent ? (
          <RichTextRenderer content={scene.tiptapContent as any} />
        ) : (
          <p className="text-muted-foreground italic text-center">No content available for this scene.</p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
