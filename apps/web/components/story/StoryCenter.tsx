"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { PortraitFrame } from "@workspace/ui/components/PortraitFrame";
import { RichTextRenderer } from "@workspace/ui/components/editor/rich-text-renderer";
import { EmberCanvas } from "./EmberCanvas";
import { useReadingPreferences } from "@/hooks/useReadingPreferences";
import { cn } from "@workspace/ui/lib/utils";
import { SplitSquareHorizontal } from "lucide-react";

// JSONContent is structurally { type?: string; content?: JSONContent[]; [key: string]: unknown }
type JSONContent = Record<string, unknown>;

export type SceneChoice = {
  _id: string;
  label: string;
  nextSceneId: string;
};

export type StoryScene = {
  _id: string;
  title?: string | null;
  order: number;
  tiptapContent?: JSONContent | null;
  content?: string | null;
  illustrationUrl?: string | null;
  imageUrl?: string | null;
  chapterTitle?: string;
  chapterOrder?: number;
  choices?: SceneChoice[];
};

type StoryCenterProps = {
  scene: StoryScene | null;
  storyTitle?: string;
  onChoiceSelect?: (nextSceneId: string) => void;
  nextSceneId?: string;
  isLastScene?: boolean;
};

export function StoryCenter({ scene, storyTitle, onChoiceSelect, nextSceneId, isLastScene }: StoryCenterProps) {
  const { preferences, isLoaded } = useReadingPreferences();

  if (!scene) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground/40">
          Select a scene to begin reading
        </p>
      </div>
    );
  }

  const illustrationSrc = scene.illustrationUrl ?? scene.imageUrl;

  // Determine font size classes
  const fontSizes = {
    small: "prose-p:text-base prose-p:leading-relaxed prose-h2:text-xl",
    medium: "prose-p:text-lg md:prose-p:text-xl prose-p:leading-[1.8] prose-h2:text-2xl",
    large: "prose-p:text-xl md:prose-p:text-2xl prose-p:leading-loose prose-h2:text-3xl",
    xlarge: "prose-p:text-2xl md:prose-p:text-3xl prose-p:leading-loose prose-h2:text-4xl",
  };

  const fontSizeClass = isLoaded ? fontSizes[preferences.fontSize] : fontSizes.medium;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24 space-y-16 relative">
      <EmberCanvas />

      {/* Edge-Bleed Vignette & Cultural Pattern Background */}
      <div className="absolute inset-x-0 inset-y-[-200px] pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Deep ambient glow */}
        <div className="absolute inset-x-[-100%] top-[10%] h-[120vh] bg-brand-ember/5 blur-[150px] rounded-[100%]" />
        
        {/* Edge-bleed shadow vignette to blend central content with margins */}
        <div className="absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-cinematic-bg via-cinematic-bg/60 to-transparent z-10" />
        <div className="absolute inset-y-0 left-0 w-[150px] bg-gradient-to-r from-cinematic-bg via-cinematic-bg/80 to-transparent z-10 hidden md:block" />
        <div className="absolute inset-y-0 right-0 w-[150px] bg-gradient-to-l from-cinematic-bg via-cinematic-bg/80 to-transparent z-10 hidden md:block" />

        {/* Vertical Cultural Pattern Borders using linear-gradient repeating segments */}
        <div 
          className="absolute inset-y-0 left-0 w-8 opacity-[0.03] z-0 hidden lg:block" 
          style={{ backgroundImage: "repeating-linear-gradient(0deg, var(--color-brand-ember) 0, var(--color-brand-ember) 2px, transparent 2px, transparent 12px, var(--color-brand-ember) 12px, var(--color-brand-ember) 24px, transparent 24px, transparent 64px)", backgroundSize: "100% 64px" }} 
        />
        <div 
          className="absolute inset-y-0 right-0 w-8 opacity-[0.03] z-0 hidden lg:block" 
          style={{ backgroundImage: "repeating-linear-gradient(0deg, var(--color-brand-ember) 0, var(--color-brand-ember) 2px, transparent 2px, transparent 12px, var(--color-brand-ember) 12px, var(--color-brand-ember) 24px, transparent 24px, transparent 64px)", backgroundSize: "100% 64px" }} 
        />
      </div>

      <motion.div
        key={scene._id}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.15 },
          },
        }}
        className="space-y-16 relative z-10"
      >
        {/* Context Breadcrumb */}
        <motion.div
          className="flex flex-col items-center text-center space-y-4 mb-4"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex items-center gap-4 text-cinematic-text-dim font-mono text-xs tracking-[0.2em] uppercase">
            <span>{storyTitle ?? "Story"}</span>
            <span className="text-brand-ember/50">✦</span>
            <span>{scene.chapterTitle ?? "Chapter"}</span>
          </div>
        </motion.div>

        {/* Title Block */}
        <motion.div
          className="text-center space-y-4"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black italic tracking-tight text-cinematic-text drop-shadow-sm px-4">
            {scene.title ?? "Untitled Scene"}
          </h1>
          <div className="w-12 h-0.5 bg-brand-ember/40 rounded-full mx-auto mt-6" />
        </motion.div>

        {/* Cinematic Illustration — Portrait */}
        {illustrationSrc && (
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.96 },
              visible: { opacity: 1, scale: 1 },
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full max-w-lg mx-auto"
          >
            <PortraitFrame
              imageUrl={illustrationSrc}
              alt={scene.title ?? "Scene illustration"}
              renderImage={({ src, alt, className }) => (
                <Image
                  src={src}
                  alt={alt}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 512px"
                  className={className}
                />
              )}
            />
          </motion.div>
        )}

        {/* Rich Text Content */}
        <motion.div
          className={cn(
            "mx-auto max-w-[65ch] space-y-6 prose prose-invert font-serif",
            "prose-headings:font-heading prose-headings:text-cinematic-text prose-headings:tracking-tight",
            "prose-strong:text-cinematic-text prose-strong:font-bold",
            "prose-blockquote:border-l-brand-ember/50 prose-blockquote:text-cinematic-text-dim",
            "prose-p:text-cinematic-text-dim prose-p:tracking-[0.01em]",
            fontSizeClass
          )}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {scene.tiptapContent ? (
            <RichTextRenderer content={scene.tiptapContent} />
          ) : scene.content ? (
            // Fallback: render legacy plain string content if no tiptap data
            scene.content
              .split("\n")
              .filter((p) => p.trim())
              .map((paragraph, i) => (
                <p key={i}>
                  {paragraph}
                </p>
              ))
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
               <p className="font-mono text-cinematic-text-dim text-xs uppercase tracking-widest">
                 Content not written yet
               </p>
            </div>
          )}
        </motion.div>
        
        {/* Navigation / Choices Node */}
        <motion.div
           className="mx-auto max-w-[55ch] space-y-4 pt-8"
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-50px" }}
           transition={{ duration: 0.6, ease: "easeOut" }}
         >
           {/* Section Divider */}
           <div className="flex items-center gap-4 py-4">
             <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-ember/30 to-transparent" />
             <SplitSquareHorizontal className="size-4 text-brand-ember/60" />
             <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-ember/30 to-transparent" />
           </div>

           {scene.choices && scene.choices.length > 0 && onChoiceSelect ? (
             <>
               <p className="text-center text-[10px] font-mono uppercase tracking-[0.25em] text-cinematic-text-dim/60">
                 Choose your path
               </p>

               <div className="flex flex-col gap-3 pt-2">
                 {scene.choices.map((choice, i) => (
                   <motion.button
                     key={choice._id}
                     onClick={() => onChoiceSelect(choice.nextSceneId)}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ duration: 0.4, delay: i * 0.1 }}
                     className={cn(
                       "group relative w-full text-left px-6 py-4 border border-cinematic-border/50 bg-cinematic-panel/40 backdrop-blur-sm",
                       "hover:border-brand-ember/50 hover:bg-brand-ember/5 transition-all duration-300 cursor-pointer",
                       "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ember/50"
                     )}
                   >
                     {/* Left accent bar */}
                     <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-ember/30 group-hover:bg-brand-ember transition-colors duration-300" />

                     <div className="flex items-center gap-4">
                       <span className="text-[10px] font-mono text-brand-ember/60 group-hover:text-brand-ember transition-colors">
                         {String.fromCharCode(65 + i)}
                       </span>
                       <span className="font-serif text-sm md:text-base text-cinematic-text-dim group-hover:text-cinematic-text transition-colors">
                         {choice.label}
                       </span>
                       <span className="ml-auto text-cinematic-text-dim/30 group-hover:text-brand-ember/60 transition-colors text-sm">
                         →
                       </span>
                     </div>
                   </motion.button>
                 ))}
               </div>
             </>
           ) : nextSceneId && onChoiceSelect ? (
             <div className="flex flex-col items-center gap-6 pt-4">
               <p className="text-center text-[10px] font-mono uppercase tracking-[0.25em] text-cinematic-text-dim/60">
                 Current Chapter Ended
               </p>
               <button
                 onClick={() => onChoiceSelect(nextSceneId)}
                 className="group inline-flex items-center gap-3 px-8 py-3 text-sm font-mono tracking-widest text-brand-ember uppercase border border-brand-ember/30 hover:border-brand-ember hover:bg-brand-ember/10 transition-all duration-300 bg-transparent"
               >
                 Continue to Next Chapter
                 <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
               </button>
             </div>
           ) : isLastScene ? (
             <div className="flex flex-col items-center text-center gap-8 pt-12 pb-8">
               <h2 className="text-4xl md:text-5xl font-heading font-black italic tracking-widest text-cinematic-text drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                 THE END
               </h2>
               <div className="w-16 h-px bg-brand-ember/50" />
               <p className="font-mono text-sm tracking-[0.2em] text-cinematic-text-dim/80 max-w-sm leading-loose">
                 Thank you for exploring this tale. Let the embers guide you to another.
               </p>
               <Link
                 href="/stories"
                 className="mt-4 px-6 py-3 border border-cinematic-text-dim/40 text-cinematic-text-dim hover:text-brand-ember hover:border-brand-ember transition-colors font-mono uppercase tracking-widest text-xs"
               >
                 Return to Archive
               </Link>
             </div>
           ) : (
             <div className="h-24" />
           )}
        </motion.div>
      </motion.div>
    </div>
  );
}
