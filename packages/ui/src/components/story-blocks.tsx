"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { cva } from "class-variance-authority"

// â”€â”€â”€ Block Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type BlockType =
  | "text"
  | "heading"
  | "image"
  | "dialogue"
  | "choice"
  | "divider"
  | "quote"
  | "scene_break"

export type BlockData = {
  _id: string
  type: BlockType
  order: number
  props: Record<string, unknown>
  storyId: string
  chapterId?: string
  sceneId?: string
  createdAt: number
  updatedAt: number
}

// â”€â”€â”€ Text Block â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type TextBlockProps = {
  content?: string
  alignment?: "left" | "center" | "right"
  dropCap?: boolean
  editable?: boolean
  onChange?: (props: { content: string }) => void
}

function TextBlock({
  content,
  alignment = "left",
  dropCap = false,
  editable = false,
  onChange,
}: TextBlockProps) {
  if (editable) {
    return (
      <textarea
        value={content ?? ""}
        onChange={(e) => onChange?.({ content: e.target.value })}
        placeholder="Write your storyâ€¦"
        aria-label="Block text content"
        className={cn(
          "w-full min-h-24 resize-none bg-transparent outline-none",
          "text-lg leading-relaxed font-sans text-foreground/90",
          "placeholder:text-muted-foreground/40",
          alignment === "center" && "text-center",
          alignment === "right" && "text-right"
        )}
      />
    )
  }

  return (
    <p
      data-slot="block-text"
      className={cn(
        "text-lg leading-relaxed font-sans text-foreground/90 whitespace-pre-wrap",
        alignment === "center" && "text-center",
        alignment === "right" && "text-right",
        dropCap && "first-letter:text-5xl first-letter:font-display first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:mt-1"
      )}
    >
      {content}
    </p>
  )
}

// â”€â”€â”€ Heading Block â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const headingVariants = cva("font-heading font-bold tracking-tight text-foreground", {
  variants: {
    level: {
      1: "text-4xl mt-12 mb-6 font-display italic",
      2: "text-2xl mt-10 mb-4 text-primary",
      3: "text-xl mt-8 mb-3",
    },
  },
  defaultVariants: {
    level: 2,
  },
})

type HeadingBlockProps = {
  text?: string
  level?: 1 | 2 | 3
  editable?: boolean
  onChange?: (props: { text: string }) => void
}

function HeadingBlock({
  text,
  level = 2,
  editable = false,
  onChange,
}: HeadingBlockProps) {
  const Tag = `h${level}` as "h1" | "h2" | "h3"

  if (editable) {
    return (
      <input
        value={text ?? ""}
        onChange={(e) => onChange?.({ text: e.target.value })}
        placeholder={`Heading ${level}`}
        aria-label={`Heading level ${level}`}
        className={cn(
          headingVariants({ level }),
          "w-full bg-transparent outline-none placeholder:text-muted-foreground/40"
        )}
      />
    )
  }

  return (
    <Tag data-slot="block-heading" className={headingVariants({ level })}>
      {text}
    </Tag>
  )
}

// â”€â”€â”€ Image Block â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type ImageBlockProps = {
  src?: string
  caption?: string
  style?: "full" | "inline" | "cinematic"
}

function ImageBlock({ src, caption, style = "inline" }: ImageBlockProps) {
  if (!src) {
    return (
      <div
        data-slot="block-image-placeholder"
        className="w-full h-48 rounded-none border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-sm"
      >
        No image set
      </div>
    )
  }

  return (
    <figure
      data-slot="block-image"
      className={cn(
        "my-8",
        style === "full" && "w-full -mx-4 md:-mx-12",
        style === "cinematic" && "w-full -mx-4 md:-mx-24"
      )}
    >
      <img
        src={src}
        alt={caption ?? "Story illustration"}
        className={cn(
          "w-full object-cover",
          style === "inline" && "rounded-none max-h-96",
          style === "full" && "rounded-none max-h-[60vh]",
          style === "cinematic" && "rounded-none max-h-[80vh]"
        )}
      />
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground italic font-sans">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

// â”€â”€â”€ Dialogue Block â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type DialogueBlockProps = {
  character?: string
  avatar?: string
  text?: string
  editable?: boolean
  onChange?: (props: { text: string }) => void
}

function StoryDialogueBlock({
  character,
  avatar,
  text,
  editable = false,
  onChange,
}: DialogueBlockProps) {
  return (
    <div
      data-slot="block-dialogue"
      className="flex gap-4 items-start my-6 max-w-2xl mx-auto"
    >
      {avatar ? (
        <img
          src={avatar}
          alt={character ?? "Character"}
          className="size-12 rounded-none border-2 border-brand-ember/20 object-cover flex-shrink-0"
        />
      ) : (
        <div className="size-12 rounded-none bg-secondary flex items-center justify-center flex-shrink-0 border-2 border-brand-ember/20">
          <span className="text-xs font-mono text-brand-ochre uppercase">
            {character?.charAt(0) ?? "?"}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        {character && (
          <span className="block mb-1 text-xs font-semibold uppercase tracking-wider text-brand-ochre">
            {character}
          </span>
        )}
        {editable ? (
          <textarea
            value={text ?? ""}
            onChange={(e) => onChange?.({ text: e.target.value })}
            placeholder="Character dialogueâ€¦"
            aria-label={`Dialogue for ${character ?? "character"}`}
            className="w-full min-h-16 resize-none bg-secondary/50 px-5 py-3 text-sm leading-relaxed text-foreground outline-none rounded-none"
          />
        ) : (
          <div className="bg-secondary/50 px-5 py-3 text-sm leading-relaxed text-foreground rounded-none">
            {text}
          </div>
        )}
      </div>
    </div>
  )
}


// â”€â”€â”€ Choice Block â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type ChoiceOption = {
  label: string
  nextSceneId?: string
}

type ChoiceBlockProps = {
  options?: ChoiceOption[]
  onChoose?: (option: ChoiceOption) => void
}

function ChoiceBlock({ options, onChoose }: ChoiceBlockProps) {
  if (!options || options.length === 0) return null

  return (
    <div data-slot="block-choice" className="my-8 max-w-2xl mx-auto space-y-3">
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => {
            onChoose?.(opt)
            if (opt.nextSceneId) {
              window.dispatchEvent(new CustomEvent('story:choice', { detail: { sceneId: opt.nextSceneId } }))
            }
          }}
          className={cn(
            "w-full text-left px-5 py-3 rounded-none border-2 border-border",
            "text-sm font-sans text-foreground",
            "transition-all duration-200",
            "hover:border-primary hover:bg-primary/5",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// â”€â”€â”€ Divider Block â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type DividerBlockProps = {
  style?: "line" | "symbol"
}

function DividerBlock({ style = "line" }: DividerBlockProps) {
  if (style === "symbol") {
    return (
      <div data-slot="block-divider-symbol" className="my-12 flex justify-center gap-3 text-primary/60">
        <span className="text-lg">âœ¦</span>
        <span className="text-lg">âœ¦</span>
        <span className="text-lg">âœ¦</span>
      </div>
    )
  }

  return (
    <div data-slot="block-divider" className="my-12 flex justify-center">
      <div className="h-px w-24 bg-border" />
    </div>
  )
}

// â”€â”€â”€ Quote Block â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type QuoteBlockProps = {
  content?: string
  attribution?: string
}

function QuoteBlock({ content, attribution }: QuoteBlockProps) {
  return (
    <blockquote
      data-slot="block-quote"
      className="border-l-4 border-primary pl-6 py-2 my-6 bg-accent/20 italic text-muted-foreground"
    >
      <p className="text-lg leading-relaxed">{content}</p>
      {attribution && (
        <footer className="mt-2 text-sm font-mono text-primary/80 not-italic">
          â€” {attribution}
        </footer>
      )}
    </blockquote>
  )
}

// â”€â”€â”€ Scene Break Block â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function SceneBreakBlock() {
  return (
    <div data-slot="block-scene-break" className="my-16 flex flex-col items-center gap-2">
      <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
        Scene
      </span>
      <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  )
}

// â”€â”€â”€ Block Registry â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BLOCK_MAP: Record<BlockType, React.ComponentType<any>> = {
  text: TextBlock,
  heading: HeadingBlock,
  image: ImageBlock,
  dialogue: StoryDialogueBlock,
  choice: ChoiceBlock,
  divider: DividerBlock,
  quote: QuoteBlock,
  scene_break: SceneBreakBlock,
}

export {
  TextBlock,
  HeadingBlock,
  ImageBlock,
  StoryDialogueBlock,
  ChoiceBlock,
  DividerBlock,
  QuoteBlock,
  SceneBreakBlock,
}
