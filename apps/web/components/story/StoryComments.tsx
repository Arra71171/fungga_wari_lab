"use client";

import React, { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { addComment, deleteComment } from "@/actions/socialActions";
import { Textarea } from "@workspace/ui/components/textarea";

import { Trash2 } from "lucide-react";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  users: {
    name: string | null;
    alias: string | null;
    avatar_url: string | null;
  } | null;
};

export function StoryComments({ 
  storyId, 
  comments, 
  currentUserId 
}: { 
  storyId: string; 
  comments: Comment[]; 
  currentUserId?: string;
}) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const res = await addComment({ storyId, content });
    setIsSubmitting(false);

    if (res.error) {
      alert(res.error);
    } else {
      setContent("");
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    const res = await deleteComment(commentId);
    if (res.error) {
      alert(res.error);
    }
  };

  return (
    <div className="mt-16 border-t border-border pt-12">
      <h3 className="mb-6 font-heading text-2xl font-black uppercase text-foreground">
        Discussion
      </h3>

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="mb-10 space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            className="min-h-[100px] border-border bg-secondary/10 font-mono focus-visible:ring-primary"
          />
          <Button 
            type="submit" 
            disabled={isSubmitting || !content.trim()}
            className="rounded-full bg-primary font-mono text-primary-foreground hover:bg-primary/90"
          >
            Post Comment
          </Button>
        </form>
      ) : (
        <div className="mb-10 rounded-lg border border-border bg-secondary/10 p-6 text-center">
          <p className="font-mono text-sm text-muted-foreground">
            Please sign in to join the discussion.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <div className="size-10 border border-border rounded-full overflow-hidden flex items-center justify-center shrink-0">
              {comment.users?.avatar_url ? (
                <img src={comment.users.avatar_url} alt="" className="object-cover w-full h-full" />
              ) : (
                <div className="bg-secondary font-mono text-xs w-full h-full flex items-center justify-center">
                  {comment.users?.name?.slice(0, 2).toUpperCase() || "AN"}
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-sm font-bold text-foreground">
                    {comment.users?.name || comment.users?.alias || "Anonymous"}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                {currentUserId === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
              <p className="font-mono text-sm leading-relaxed text-muted-foreground">
                {comment.content}
              </p>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-center font-mono text-sm text-muted-foreground italic">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </div>
  );
}
