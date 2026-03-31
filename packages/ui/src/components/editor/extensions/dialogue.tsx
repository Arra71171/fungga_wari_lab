"use client";

import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { DialogueBlock as UIDialogueBlock } from "@workspace/ui/components/DialogueBlock";

export interface DialogueOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    dialogue: {
      setDialogue: (options: { character: string; avatarUrl: string; quote: string }) => ReturnType;
    };
  }
}

const DialogueComponent = (props: any) => {
  const { character, avatarUrl, quote } = props.node.attrs;

  return (
    <NodeViewWrapper className="my-4">
      <div className="relative group rounded-none border border-border/40 p-1 bg-background/50">
        <UIDialogueBlock
          characterName={character}
          avatarUrl={avatarUrl}
          quote={quote}
          align="left"
        />
      </div>
    </NodeViewWrapper>
  );
};

export const DialogueExtension = Node.create<DialogueOptions>({
  name: "dialogue",

  group: "block",

  atom: true, // Not editable directly inside tiptap prose, just a widget

  addAttributes() {
    return {
      character: { default: "Unknown" },
      avatarUrl: { default: "" },
      quote: { default: "..." },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="dialogue"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "dialogue" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DialogueComponent);
  },

  addCommands() {
    return {
      setDialogue:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
