"use client";

import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { MoveRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../select";

export type SceneOption = {
  id: string;
  title: string;
};

export interface ChoiceOptions {
  HTMLAttributes: Record<string, unknown>;
  /** Available scenes to populate the dropdown. When non-empty, renders a <select>. */
  scenes: SceneOption[];
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    choice: {
      setChoice: () => ReturnType;
    };
  }
}

function ChoiceComponent(props: NodeViewProps) {
  const { label, nextSceneId } = props.node.attrs as {
    label: string;
    nextSceneId: string;
  };

  // Read scenes from extension options — Tiptap passes them via the extension instance
  const scenes: SceneOption[] = (props.extension.options as ChoiceOptions).scenes ?? [];

  const updateAttributes = (attrs: Record<string, string>) => {
    props.updateAttributes(attrs);
  };

  return (
    <NodeViewWrapper className="my-4" data-drag-handle>
      <div className="relative group flex flex-col gap-3 p-4 border-2 border-border bg-secondary/30 hover:border-brand-ember/50 transition-colors">
        <div className="flex items-center gap-3 text-brand-ochre">
          <MoveRight className="size-4" />
          <span className="text-fine font-mono uppercase tracking-widest font-bold">Story Choice</span>
        </div>

        {/* Label */}
        <div className="flex flex-col gap-1">
          <label className="text-nano font-mono uppercase tracking-widest text-muted-foreground">
            Choice Label
          </label>
          <input
            type="text"
            placeholder="e.g. 'Take the left path'"
            className="w-full bg-transparent border-b border-border pb-1 focus:outline-none focus:border-brand-ember font-sans text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors"
            value={label}
            onChange={(e) => updateAttributes({ label: e.target.value })}
            onKeyDown={(e) => { e.stopPropagation(); }}
          />
        </div>

        {/* Target Scene — dropdown when scenes are available, plain input as fallback */}
        <div className="flex flex-col gap-1">
          <label className="text-nano font-mono uppercase tracking-widest text-muted-foreground">
            Jumps to Scene
          </label>

          {scenes.length > 0 ? (
            <Select
              value={nextSceneId}
              onValueChange={(value) => updateAttributes({ nextSceneId: value })}
            >
              <SelectTrigger className="w-full bg-transparent border-x-0 border-t-0 border-b border-border pb-1 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-brand-ember font-mono text-xs text-foreground rounded-none shadow-none h-auto px-0 pt-0">
                <SelectValue placeholder="— Select a scene —" />
              </SelectTrigger>
              <SelectContent>
                {scenes.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <input
              type="text"
              placeholder="Scene ID (e.g. scene_2)"
              className="w-full bg-transparent border-b border-border pb-1 focus:outline-none focus:border-brand-ember font-mono text-xs text-foreground placeholder:text-muted-foreground/50 transition-colors"
              value={nextSceneId}
              onChange={(e) => updateAttributes({ nextSceneId: e.target.value })}
              onKeyDown={(e) => { e.stopPropagation(); }}
            />
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const ChoiceExtension = Node.create<ChoiceOptions>({
  name: "choice",
  group: "block",
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      scenes: [],
    };
  },

  addAttributes() {
    return {
      label: { default: "" },
      nextSceneId: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="choice"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "choice" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChoiceComponent);
  },

  addCommands() {
    return {
      setChoice:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              label: "",
              nextSceneId: "",
            },
          });
        },
    };
  },
});
