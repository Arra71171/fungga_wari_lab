import { KokoroTTS } from "kokoro-js";

// Keep a singleton instance in the worker
let ttsInstance: InstanceType<typeof KokoroTTS> | null = null;

self.addEventListener("message", async (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case "INIT":
      try {
        if (!ttsInstance) {
          ttsInstance = await KokoroTTS.from_pretrained(
            "onnx-community/Kokoro-82M-v1.0-ONNX",
            {
              dtype: "q8",
              device: "wasm",
            }
          );
        }
        self.postMessage({ type: "INIT_DONE" });
      } catch (err) {
        self.postMessage({
          type: "ERROR",
          payload: err instanceof Error ? err.message : "Initialization failed",
        });
      }
      break;

    case "GENERATE":
      try {
        if (!ttsInstance) {
          throw new Error("TTS is not initialized yet");
        }
        const { text, voice } = payload;
        
        const audioData = await ttsInstance.generate(text, { voice });
        
        self.postMessage({
          type: "GENERATE_DONE",
          payload: {
            audio: audioData.audio,
            sampling_rate: audioData.sampling_rate,
          },
        });
      } catch (err) {
        self.postMessage({
          type: "ERROR",
          payload: err instanceof Error ? err.message : "Generation failed",
        });
      }
      break;
  }
});

// Explicitly export empty for TS
export {};
