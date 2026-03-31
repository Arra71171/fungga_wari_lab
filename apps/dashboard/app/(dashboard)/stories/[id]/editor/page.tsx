"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft, Save, FileImage, LayoutPanelLeft } from "lucide-react";
import Link from "next/link";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function StoryEditorPage({ params }: { params: { id: string } }) {
  const [isAssetSidebarOpen, setAssetSidebarOpen] = React.useState(true);
  
  const editor = useEditor({
    extensions: [StarterKit],
    content: `
      <h2>The Mysterious Village</h2>
      <p>You arrive at a mysterious village shrouded in mist. The air is thick with the scent of pine and a subtle, ancient magic that seems to hum in the background.</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px]',
      },
    },
  });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/stories" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-primary/80 border border-primary/20 bg-primary/10 px-1.5 py-0.5 rounded">
                Draft
              </span>
            </div>
            <h1 className="font-heading text-xl font-bold tracking-tight mt-1">
              Chapter 1: The Beginning
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className={`gap-2 ${isAssetSidebarOpen ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
            onClick={() => setAssetSidebarOpen(!isAssetSidebarOpen)}
          >
            <LayoutPanelLeft className="size-4" /> 
            {isAssetSidebarOpen ? "Close Assets" : "Assets"}
          </Button>
          <Button className="gap-2 shadow-sm shadow-brand-ember/20">
            <Save className="size-4" /> Save
          </Button>
        </div>
      </div>

      {/* Editor & Sidebar Layout */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* Main Editor Canvas */}
        <div className="flex-1 bg-secondary/10 border border-border/40 rounded-none overflow-y-auto p-10 backdrop-blur-sm relative">
          
          {/* Mock selected Cinematic Illustration preview */}
          <div className="w-full h-64 border-2 border-dashed border-primary/40 rounded-none bg-background/50 flex flex-col items-center justify-center text-primary/60 hover:bg-primary/5 transition-colors cursor-pointer group mb-8">
            <div className="size-12 rounded-none bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileImage className="size-6" />
            </div>
            <span className="font-heading font-semibold text-sm">Select Cinematic Illustration</span>
            <span className="font-mono text-[10px] text-muted-foreground">From Asset Vault</span>
          </div>

          <div className="text-muted-foreground font-mono text-xs uppercase tracking-widest mb-4 border-b border-border/50 pb-2">
            Story Content (Tiptap)
          </div>
          
          <EditorContent editor={editor} />
        </div>

        {/* Asset Picker Sidebar */}
        {isAssetSidebarOpen && (
          <div className="w-80 h-full bg-secondary/20 border border-border/40 rounded-none flex flex-col overflow-hidden shrink-0">
            <div className="p-4 border-b border-border/30 bg-background/50 backdrop-blur-md">
              <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
                <FileImage className="size-4 text-primary" />
                Asset Explorer
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-center text-muted-foreground text-xs font-mono p-4 bg-background/50 rounded-none border border-dashed border-border/50">
                No related assets.<br/>Upload in the Vault.
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
