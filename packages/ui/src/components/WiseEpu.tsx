"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Loader, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";

// ─── Types ────────────────────────────────────────────────────────────────────

type WiseEpuProps = {
  apiRoute?: string;
  className?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

function WiseEpu({ apiRoute = "/api/wise-epu", className }: WiseEpuProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  // Gate portal mount to client-only — prevents SSR hydration mismatch
  const [portalMounted, setPortalMounted] = React.useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => { setPortalMounted(true); }, []);

  const { messages, sendMessage, status, error, clearError } = useChat({
    transport: new DefaultChatTransport({ api: apiRoute }),
    onError: (err) => {
      console.error("[WiseEpu] chat error:", err);
    },
  });
  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll to latest message
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;
    void sendMessage({ text: trimmed });
    setInputValue("");
  }

  // Render nothing during SSR — portal only works on the client
  if (!portalMounted) return null;

  return ReactDOM.createPortal(
    // Portaled directly into document.body — bypasses ALL ancestor CSS
    // containing blocks (flex on <html>, Framer Motion transforms, etc.).
    // position: fixed will always be relative to the true viewport.
    <div
      data-slot="wise-epu"
      className={cn(
        "fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none",
        // Respect iOS home-indicator safe area so the trigger doesn't hide behind it
        "[padding-bottom:env(safe-area-inset-bottom,0px)]",
        className,
      )}
    >
      {/* ── Chat Panel ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-[calc(100vw-3rem)] sm:w-[360px] h-[min(520px,80dvh)] max-h-[80dvh] flex flex-col border border-border bg-background shadow-brutal overflow-hidden origin-bottom-right pointer-events-auto"
            role="dialog"
            aria-label="Wise-Epu — Ancient Lore Keeper"
            aria-modal="false"
          >
            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/20 shrink-0">
              <div className="flex items-center gap-2.5">
                {/* Ember avatar */}
                <div className="relative size-7 border border-primary/50 bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                  <motion.div
                    className="absolute inset-0 bg-primary/15"
                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <span className="relative z-10 text-base font-meetei font-black text-primary leading-none select-none">
                    ꯏ
                  </span>
                </div>
                <div className="leading-none">
                  <p className="text-xs font-heading font-black uppercase tracking-tight text-foreground">
                    Wise-Epu
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">
                    Lore Keeper · Active
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Wise-Epu"
                className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* ── Messages ─────────────────────────────────────────────────── */}
            <div className="overflow-y-auto overscroll-contain p-4 space-y-3 flex-1 min-h-0 flex flex-col">
              {/* Empty state — vertically centered within fixed panel */}
              {messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
                  <div className="w-10 h-10 border border-primary/30 bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl text-primary font-meetei font-black select-none">ꯏ</span>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">
                    <span className="text-brand-ember font-bold block mb-1.5 text-xs">
                      Khurumjari! (Welcome!)
                    </span>
                    I am Wise-Epu, keeper of the old lore.
                    <br />
                    Ask me about our stories, Meitei traditions,
                    <br />
                    or the folklore of this sacred land.
                  </p>
                  {/* Suggestion chips */}
                  <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                    {[
                      "What stories do you have?",
                      "Tell me about Loktak Lake",
                      "Meitei creation myths",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          void sendMessage({ text: suggestion });
                        }}
                        className="text-[10px] font-mono px-2 py-1 border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors focus-visible:ring-1 focus-visible:ring-ring outline-none"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message list */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[88%] px-3 py-2 text-[11px] font-sans leading-relaxed",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground border border-border",
                    )}
                  >
                    {message.parts.map((part, i) => {
                      if (part.type === "text") {
                        return (
                          <span key={i} className="whitespace-pre-wrap">
                            {part.text}
                          </span>
                        );
                      }
                      if (part.type === "tool-invocation") {
                        return (
                          <span
                            key={i}
                            className="text-muted-foreground italic text-[10px]"
                          >
                            Consulting the archive…
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary border border-border px-3 py-2 flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="size-1.5 bg-brand-ember rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="flex justify-start mt-2">
                  <div className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-2 text-[11px] font-sans leading-relaxed max-w-[88%] space-y-1.5">
                    <p className="font-bold">
                      {error.message.includes("rate") || error.message.includes("429")
                        ? "Wise-Epu is resting…"
                        : "Connection Error"}
                    </p>
                    <p className="text-destructive/80">
                      {error.message.includes("rate") || error.message.includes("429")
                        ? "Too many questions at once! Please wait a moment before asking again."
                        : error.message}
                    </p>
                    <button
                      type="button"
                      onClick={clearError}
                      className="text-[10px] underline underline-offset-2 text-destructive/70 hover:text-destructive focus-visible:ring-1 focus-visible:ring-ring"
                      aria-label="Dismiss error"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input ────────────────────────────────────────────────────── */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-border flex items-center shrink-0"
            >
              <input
                ref={inputRef}
                id="wise-epu-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask the elder…"
                disabled={isLoading}
                aria-label="Message to Wise-Epu"
                className="flex-1 px-4 py-3 text-base sm:text-[11px] font-mono bg-transparent text-foreground placeholder:text-muted-foreground/50 border-none outline-none disabled:opacity-40"
              />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                disabled={!inputValue.trim() || isLoading}
                aria-label="Send message to Wise-Epu"
                className="h-full px-3 rounded-none border-l border-border shrink-0"
              >
                {isLoading ? (
                  <Loader className="size-3 animate-spin" />
                ) : (
                  <Send className="size-3" />
                )}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Trigger Button ─────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close Wise-Epu" : "Open Wise-Epu — Lore Keeper"}
        aria-expanded={isOpen}
        className="pointer-events-auto relative size-14 flex items-center justify-center bg-primary text-primary-foreground shadow-brutal hover:-translate-y-1 active:translate-y-0 hover:shadow-brutal-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {/* Pulse ring when closed */}
        <AnimatePresence>
          {!isOpen && (
            <motion.span
              key="pulse"
              className="absolute inset-0 border-2 border-primary"
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="size-5" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <span className="font-meetei font-black text-2xl leading-none select-none">
                ꯏ
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>,
    document.body
  );
}

export { WiseEpu };

export type { WiseEpuProps };
