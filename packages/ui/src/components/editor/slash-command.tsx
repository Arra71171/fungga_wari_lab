"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Extension, type Editor, type Range } from "@tiptap/core";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { type GetReferenceClientRect, type Instance } from "tippy.js";
import { Heading1, Heading2, TextQuote, List, Type, MessageCircle, Image as ImageIcon, MoveRight } from "lucide-react";

export interface CommandItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: ({ editor, range }: { editor: Editor; range: Range }) => void;
}

function getSuggestionItems({ query }: { query: string }) {
  return [
    {
      title: "Text",
      description: "Just start typing with plain text.",
      icon: <Type className="size-4" />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).setNode("paragraph").run();
      },
    },
    {
      title: "Heading 1",
      description: "Big section heading.",
      icon: <Heading1 className="size-4" />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
      },
    },
    {
      title: "Heading 2",
      description: "Medium section heading.",
      icon: <Heading2 className="size-4" />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
      },
    },
    {
      title: "Bullet List",
      description: "Create a simple bulleted list.",
      icon: <List className="size-4" />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: "Quote",
      description: "Capture a story element.",
      icon: <TextQuote className="size-4" />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).setNode("blockquote").run();
      },
    },
    {
      title: "Dialogue",
      description: "Format script or spoken dialogue.",
      icon: <MessageCircle className="size-4" />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).run();
        // Since it's a browser prompt, wrap in setTimeout to avoid slash menu blocking issues
        setTimeout(() => {
          const characterName = window.prompt("Character Name:", "Elder");
          if (!characterName) return;
          const quote = window.prompt("What do they say?", "Long ago...");
          if (!quote) return;
          
          editor.chain().focus().setDialogue({
            character: characterName,
            avatarUrl: "/avatars/default.png",
            quote: quote,
          }).run();
        }, 10);
      },
    },
    {
      title: "Image",
      description: "Embed an image from a URL.",
      icon: <ImageIcon className="size-4" />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).run();
        setTimeout(() => {
          const url = window.prompt("Image URL:");
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }, 10);
      },
    },
    {
      title: "Choice",
      description: "Interactive story path choice.",
      icon: <MoveRight className="size-4" />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).setChoice().run();
      },
    },
  ].filter((item) => item.title.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10);
}

export const CommandMenuList = forwardRef(function CommandMenuList(props: { items: CommandItemProps[]; command: (item: CommandItemProps) => void }, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevItems, setPrevItems] = useState(props.items);

  if (props.items !== prevItems) {
    setPrevItems(props.items);
    setSelectedIndex(0);
  }

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  if (props.items.length === 0) {
    return null;
  }

  return (
    <div className="z-50 min-w-[12rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-brutal animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
      {props.items.map((item: CommandItemProps, index: number) => (
        <button
          className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors 
            ${index === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 hover:text-accent-foreground"}
          `}
          key={index}
          onClick={() => selectItem(index)}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-background border border-border">
            {item.icon}
          </div>
          <div className="flex flex-col text-left">
            <span className="font-medium">{item.title}</span>
            <span className="text-fine text-muted-foreground">{item.description}</span>
          </div>
        </button>
      ))}
    </div>
  );
});

CommandMenuList.displayName = "CommandMenuList";

export const SlashCommand = Extension.create({
  name: "slashCommand",
  addOptions() {
    return {
      char: "/",
      suggestionCommand: ({ editor, range, props }: { editor: Editor; range: Range; props: { command: (args: { editor: Editor; range: Range }) => void } }) => {
        props.command({ editor, range });
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      items: ({ query }: { query: string }) => [] as any[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: () => ({}) as any,
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: this.options.char,
        command: this.options.suggestionCommand,
        items: this.options.items,
        render: this.options.render,
      }),
    ];
  },
});

export const renderItems: SuggestionOptions["render"] = () => {
  let component: ReactRenderer | null = null;
  let popup: Instance[] | null = null;

  return {
    onStart: (props) => {
      component = new ReactRenderer(CommandMenuList, {
        props,
        editor: props.editor,
      });

      if (!props.clientRect) {
        return;
      }

      popup = (tippy as unknown as CallableFunction)("body", {
        getReferenceClientRect: props.clientRect as GetReferenceClientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
      });
    },
    onUpdate(props) {
      component?.updateProps(props);

      if (!props.clientRect) {
        return;
      }

      popup?.[0]?.setProps({
        getReferenceClientRect: props.clientRect as GetReferenceClientRect,
      });
    },
    onKeyDown(props) {
      if (props.event.key === "Escape") {
        popup?.[0]?.hide();
        return true;
      }
      return (component?.ref as { onKeyDown?: (p: typeof props) => boolean })?.onKeyDown?.(props) ?? false;
    },
    onExit() {
      popup?.[0]?.destroy();
      component?.destroy();
    },
  };
};

export const slashCommandConfig = SlashCommand.configure({
  items: getSuggestionItems,
  render: renderItems,
});
