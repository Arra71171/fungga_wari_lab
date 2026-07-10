"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import { toggleLike } from "@/actions/socialActions";
import { cn } from "@workspace/ui/lib/utils";

export function LikeButton({ 
  storyId, 
  initialLiked = false,
  likeCount = 0,
  disabled = false
}: { 
  storyId: string;
  initialLiked?: boolean;
  likeCount?: number;
  disabled?: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(likeCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (disabled || isLoading) return;
    
    // Optimistic update
    setLiked(!liked);
    setCount(prev => liked ? prev - 1 : prev + 1);
    setIsLoading(true);

    const res = await toggleLike(storyId);
    
    setIsLoading(false);

    if (res.error) {
      // Revert on error
      setLiked(liked);
      setCount(likeCount);
      alert(res.error);
    } else if (res.liked !== undefined) {
      setLiked(res.liked);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={disabled || isLoading}
      className={cn(
        "group flex items-center gap-2 rounded-none border border-border bg-background px-3 py-1.5 transition-all hover:bg-secondary/20",
        liked && "border-brand-ember/50 bg-brand-ember/5"
      )}
      aria-label={liked ? "Unlike story" : "Like story"}
    >
      <Heart 
        className={cn(
          "size-4 transition-colors",
          liked 
            ? "fill-brand-ember text-brand-ember" 
            : "text-muted-foreground group-hover:text-foreground"
        )} 
      />
      <span className={cn(
        "font-mono text-xs font-medium tabular-nums",
        liked ? "text-brand-ember" : "text-muted-foreground group-hover:text-foreground"
      )}>
        {count}
      </span>
    </button>
  );
}
