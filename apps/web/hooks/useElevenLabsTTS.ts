import * as React from "react";

export type TTSState = "idle" | "loading" | "playing" | "paused" | "error";

// Default voice — Rachel (warm narration voice, great for stories)
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

/**
 * useElevenLabsTTS — Streams TTS audio from our /api/tts proxy (ElevenLabs backend).
 *
 * Architecture:
 * - Calls /api/tts (server route) which holds the API key server-side
 * - Receives audio/mpeg buffer, creates a Blob URL, plays via HTMLAudioElement
 * - No WASM, no Web Workers, no model downloads — instant start
 */
export function useElevenLabsTTS(
  textToRead: string | null,
  voiceId: string = DEFAULT_VOICE_ID,
) {
  const [state, setState] = React.useState<TTSState>("idle");
  const [error, setError] = React.useState<string | null>(null);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = React.useRef<string | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Always ready — ElevenLabs is API-based, no init needed
  const isReady = true;

  const cleanupAudio = React.useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  const stop = React.useCallback(() => {
    abortControllerRef.current?.abort();
    cleanupAudio();
    setState("idle");
    setError(null);
  }, [cleanupAudio]);

  const pause = React.useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setState("paused");
    }
  }, []);

  const resume = React.useCallback(() => {
    if (audioRef.current?.paused) {
      audioRef.current.play().catch(() => {});
      setState("playing");
    }
  }, []);

  const play = React.useCallback(async () => {
    if (!textToRead?.trim()) return;

    // Stop any prior playback / in-flight request
    abortControllerRef.current?.abort();
    cleanupAudio();
    setError(null);
    setState("loading");

    const cleanText = textToRead
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 2500);

    if (!cleanText) {
      setState("idle");
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText, voiceId }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({ error: "TTS failed" }));
        throw new Error((msg as { error?: string }).error ?? "TTS request failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => setState("playing");
      audio.onpause = () => {
        // onpause also fires on end — check ended
        if (!audio.ended) setState("paused");
      };
      audio.onended = () => {
        setState("idle");
        cleanupAudio();
      };
      audio.onerror = () => {
        setState("error");
        setError("Audio playback failed");
        cleanupAudio();
      };

      await audio.play();
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        // User cancelled — not an error
        return;
      }
      console.error("[ElevenLabsTTS] error:", err);
      setError(err instanceof Error ? err.message : "TTS unavailable");
      setState("error");
    }
  }, [textToRead, voiceId, cleanupAudio]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      cleanupAudio();
    };
  }, [cleanupAudio]);

  return { state, error, play, pause, resume, stop, isReady };
}
