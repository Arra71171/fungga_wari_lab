"use client";

import * as React from "react";
import { StoryRenderer } from "@workspace/ui/components/story-renderer";
import { useBlockEditor } from "@workspace/ui/hooks/use-block-editor";
import type { BlockData, BlockType } from "@workspace/ui/components/story-blocks";
import { Loader2 } from "lucide-react";
import {
  getBlocksByStoryId,
  createBlock,
  updateBlock,
  removeBlock,
  reorderBlocks,
} from "@/actions/blockActions";
import type { Database } from "@workspace/ui/types/supabase";

type BlockRow = Database["public"]["Tables"]["blocks"]["Row"];
type BlockEditorPanelProps = {
  storyId: string;
};

/**
 * Dashboard block editor panel.
 * Renders the StoryRenderer in editor mode with full CRUD
 * operations backed by Supabase server actions.
 */
function BlockEditorPanel({ storyId }: BlockEditorPanelProps) {
  const [rawBlocks, setRawBlocks] = React.useState<BlockRow[] | undefined>(undefined);

  // Fetch blocks on mount
  React.useEffect(() => {
    let cancelled = false;
    getBlocksByStoryId(storyId).then((blocks) => {
      if (!cancelled) setRawBlocks(blocks);
    });
    return () => {
      cancelled = true;
    };
  }, [storyId]);

  // Cast Supabase rows to BlockData
  const blockData: BlockData[] = React.useMemo(() => {
    if (!rawBlocks) return [];
    return rawBlocks.map((b) => ({
      _id: b.id,
      type: b.type as BlockData["type"],
      order: b.order,
      props: (b.props as Record<string, unknown>) ?? {},
      storyId: b.story_id,
      chapterId: b.chapter_id ?? undefined,
      sceneId: b.scene_id ?? undefined,
      createdAt: b.created_at ? new Date(b.created_at).getTime() : 0,
      updatedAt: b.updated_at ? new Date(b.updated_at).getTime() : 0,
    }));
  }, [rawBlocks]);

  const editor = useBlockEditor(blockData, storyId, {
    onAdd: async (block) => {
      const newId = await createBlock({
        storyId,
        type: block.type,
        order: block.order,
        props: block.props,
      });
      // Optimistically update local state with the real ID
      setRawBlocks((prev) =>
        prev
          ? [
              ...prev,
              {
                id: newId,
                story_id: storyId,
                chapter_id: null,
                scene_id: null,
                type: block.type,
                order: block.order,
                props: (block.props ?? null) as never,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ]
          : prev
      );
    },
    onUpdate: async (id, props) => {
      if (!id.startsWith("temp-")) {
        await updateBlock(id, props);
      }
    },
    onDelete: async (id) => {
      if (!id.startsWith("temp-")) {
        await removeBlock(id);
        setRawBlocks((prev) => prev?.filter((b) => b.id !== id));
      }
    },
    onReorder: async (blockIds) => {
      const realIds = blockIds.filter((id) => !id.startsWith("temp-"));
      if (realIds.length > 0) {
        await reorderBlocks(realIds);
      }
    },
  });

  if (rawBlocks === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="size-6 text-brand-ember animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <StoryRenderer
        blocks={editor.blocks}
        mode="editor"
        selectedBlockId={editor.selectedBlockId}
        onBlockSelect={editor.setSelectedBlockId}
        onBlockUpdate={editor.updateBlock}
        onBlockDelete={editor.deleteBlock}
        onBlockAdd={(type: BlockType, afterIndex: number) => editor.addBlock(type, afterIndex)}
        onBlockReorder={editor.reorderBlocks}
      />
    </div>
  );
}

export { BlockEditorPanel };
