"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useSupabaseAuth } from "@workspace/auth/supabase-provider";

export function BookmarkToggle({ storyId }: { storyId: string }) {
  const [isBookmarked, setIsBookmarked] = React.useState<boolean | undefined>(undefined);
  const [isToggling, setIsToggling] = React.useState(false);
  const { user, supabase, isLoaded } = useSupabaseAuth();

  React.useEffect(() => {
    async function checkBookmark() {
      if (!user || !storyId) return;
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('story_id', storyId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!error) {
        setIsBookmarked(!!data);
      }
    }
    checkBookmark();
  }, [storyId, user, supabase]);

  // Only show for authenticated users
  if (!isLoaded || !user || isBookmarked === undefined) return null;

  const handleToggle = async () => {
    if (!user || isToggling) return;
    setIsToggling(true);
    try {
      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('story_id', storyId)
          .eq('user_id', user.id);
        setIsBookmarked(false);
      } else {
        await supabase
          .from('bookmarks')
          .insert({ story_id: storyId, user_id: user.id });
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
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
  );
}
