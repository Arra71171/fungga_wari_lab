"use client";

import * as React from "react";
import { MessageSquare, Send, X } from "lucide-react";
import { useSupabaseAuth } from "@workspace/auth/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { AvatarBadge } from "@workspace/ui/components/AvatarBadge";
import { getMessages, sendMessage } from "@/actions/messageActions";

type Message = {
  id: string;
  content: string;
  created_at: string | null;
  author_id: string;
  users: {
    id: string;
    name: string | null;
    avatar_url: string | null;
    custom_avatar_url: string | null;
  } | null;
};

export function TeamChat() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [messages, setMessages] = React.useState<Message[] | undefined>(undefined);
  const [isSending, setIsSending] = React.useState(false);
  const { user } = useSupabaseAuth();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // ── Initial load ────────────────────────────────────────────────────────────
  React.useEffect(() => {
    getMessages(50).then((msgs) => setMessages(msgs as Message[]));
  }, []);

  // ── Supabase Realtime subscription ─────────────────────────────────────────
  React.useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("team-chat-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: "story_id=is.null,task_id=is.null",
        },
        async (payload) => {
          // Fetch the full message with user info
          const { data } = await supabase
            .from("messages")
            .select(`
              id, content, created_at, author_id,
              users ( id, name, avatar_url, custom_avatar_url )
            `)
            .eq("id", payload.new.id)
            .single();

          if (data) {
            setMessages((prev) =>
              prev ? [...prev, data as Message] : [data as Message]
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Scroll to bottom when messages change ──────────────────────────────────
  React.useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // ── Send handler ────────────────────────────────────────────────────────────
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || isSending) return;

    const temp = content;
    setContent("");
    setIsSending(true);

    try {
      await sendMessage(temp);
    } catch (err) {
      console.error(err);
      setContent(temp); // restore on error
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 text-foreground">
      {isOpen && (
        <div className="flex h-96 w-80 flex-col overflow-hidden rounded-none border border-border bg-card shadow-lg sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="font-heading font-semibold">Team Chat</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 hover:bg-muted/50">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Message List */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages === undefined ? (
              <div className="animate-pulse space-y-4 pt-4 text-center text-sm text-muted-foreground">
                Connecting...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground pt-10">No messages yet.</div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.author_id === user?.id;
                const avatar = msg.users?.custom_avatar_url ?? msg.users?.avatar_url ?? undefined;
                const name = msg.users?.name ?? "Unknown";

                return (
                  <div key={msg.id} className={cn("flex gap-3", isMe ? "flex-row-reverse" : "")}>
                    <AvatarBadge
                      src={avatar}
                      alt={name}
                      size="sm"
                      className="shrink-0"
                    />
                    <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                      <span className="text-xs text-muted-foreground mb-1">{name}</span>
                      <div
                        className={cn(
                          "rounded-none px-3 py-2 text-sm",
                          isMe
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-3 bg-muted/10">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <Input
                autoFocus
                placeholder="Type a message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 bg-background border-border"
              />
              <Button type="submit" size="icon" disabled={!content.trim() || isSending}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <Button
          size="icon"
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-none shadow-lg transition-transform hover:scale-105 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
