"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { SignedIn, useAuth } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/client";

export function BookmarkToggle({ storyId }: { storyId: string }) {
  const [isBookmarked, setIsBookmarked] = React.useState<boolean | undefined>(undefined);
  const [isToggling, setIsToggling] = React.useState(false);
  const { userId } = useAuth();
  const supabase = createClient();

  React.useEffect(() => {
    async function checkBookmark() {
      if (!userId || !storyId) return;
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('story_id', storyId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (!error) {
        setIsBookmarked(!!data);
      }
    }
    checkBookmark();
  }, [storyId, userId, supabase]);

  if (isBookmarked === undefined) return null; // loading

  const handleToggle = async () => {
    if (!userId || isToggling) return;
    setIsToggling(true);
    try {
      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('story_id', storyId)
          .eq('user_id', userId);
        setIsBookmarked(false);
      } else {
        await supabase
          .from('bookmarks')
          .insert({ story_id: storyId, user_id: userId });
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <SignedIn>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-brand-ember hover:bg-brand-ember/10 transition-colors"
        onClick={handleToggle}
        aria-label={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
        disabled={isToggling}
      >
        {isBookmarked ? (
          <BookmarkCheck className="size-5 text-brand-ember" />
        ) : (
          <Bookmark className="size-5" />
        )}
      </Button>
    </SignedIn>
  );
}
