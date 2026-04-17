import * as React from "react";

export type TTSState = "idle" | "loading" | "playing" | "paused" | "error";

/**
 * Kokoro-82M TTS hook — uses the ONNX-optimized model for browser inference.
 *
 * The inference has been moved to a Web Worker (`kokoro.worker.ts`) to prevent
 * the main UI thread from hanging due to the heavy WASM execution.
 */
export function useKokoroTTS(textToRead: string | null) {
  const [state, setState] = React.useState<TTSState>("idle");
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [isReady, setIsReady] = React.useState(false);

  const workerRef = React.useRef<Worker | null>(null);
  const audioContext = React.useRef<AudioContext | null>(null);
  const audioSource = React.useRef<AudioBufferSourceNode | null>(null);

  // Declare playAudioBuffer before the useEffect that uses it to avoid
  // temporal dead zone lint warnings — the effect callback captures this via closure.
  const playAudioBuffer = React.useCallback((audioArray: Float32Array, samplingRate: number) => {
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)();
      }

      // Render audio buffer from the generated Float32Array
      const audioBuffer = audioContext.current.createBuffer(
        1,
        audioArray.length,
        samplingRate
      );
      audioBuffer.getChannelData(0).set(audioArray);

      // Stop any prior playback
      if (audioSource.current) {
        try {
          audioSource.current.stop();
        } catch {
          /* already stopped */
        }
      }

      audioSource.current = audioContext.current.createBufferSource();
      audioSource.current.buffer = audioBuffer;
      audioSource.current.connect(audioContext.current.destination);
      audioSource.current.onended = () => {
        setState("idle");
        setProgress(0);
      };

      audioSource.current.start();
      setState("playing");
    } catch (err) {
      console.error("Audio playback error:", err);
      setError(err instanceof Error ? err.message : "Error playing audio");
      setState("error");
    }
  }, []);

  // Initialize Web Worker — declared after playAudioBuffer so the closure is valid
  React.useEffect(() => {
    let isMounted = true;

    const worker = new Worker(new URL("../workers/kokoro.worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      if (!isMounted) return;
      const { type, payload } = e.data;

      switch (type) {
        case "INIT_DONE":
          setIsReady(true);
          setState("idle");
          break;
        case "GENERATE_DONE":
          // payload: { audio: Float32Array, sampling_rate: number }
          playAudioBuffer(payload.audio, payload.sampling_rate);
          break;
        case "ERROR":
          console.error("Worker TTS Error:", payload);
          setError(payload);
          setState("error");
          break;
      }
    };

    setState("loading");
    worker.postMessage({ type: "INIT" });

    return () => {
      isMounted = false;
      worker.terminate();
      if (audioSource.current) {
        try { audioSource.current.stop(); } catch { /* already stopped */ }
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, [playAudioBuffer]);

  const play = React.useCallback(() => {
    if (!workerRef.current || !isReady || !textToRead) return;

    try {
      setState("loading");

      // Strip HTML tags, cap at ~1000 chars for a single generation pass
      const cleanText = textToRead
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 1000);

      if (!cleanText) {
        setState("idle");
        return;
      }

      // Send the text to the worker to generate audio
      workerRef.current.postMessage({
        type: "GENERATE",
        payload: { text: cleanText, voice: "af_heart" },
      });
    } catch (err) {
      console.error("TTS request error:", err);
      setError(
        err instanceof Error ? err.message : "Error sending TTS request"
      );
      setState("error");
    }
  }, [isReady, textToRead]);

  const pause = React.useCallback(() => {
    if (audioContext.current?.state === "running") {
      audioContext.current.suspend();
      setState("paused");
    }
  }, []);

  const resume = React.useCallback(() => {
    if (audioContext.current?.state === "suspended") {
      audioContext.current.resume();
      setState("playing");
    }
  }, []);

  const stop = React.useCallback(() => {
    if (audioSource.current) {
      try {
        audioSource.current.stop();
      } catch {
        /* already stopped */
      }
    }
    setState("idle");
    setProgress(0);
  }, []);

  return { state, error, progress, play, pause, resume, stop, isReady };
}
