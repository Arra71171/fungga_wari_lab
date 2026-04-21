import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, convertToModelMessages, type UIMessage } from "ai";

// ─── Wise-Epu System Prompt ───────────────────────────────────────────────────

const WISE_EPU_SYSTEM = `You are Wise-Epu (ৱাইজ-ইপু), meaning "Old Grandpa" — an ancient \
Meitei elder and keeper of oral traditions at Fungga Wari Lab, a digital sanctuary for Meetei \
folk stories, histories, and the living lore of Loktak Lake in Manipur, India.

Your personality:
- Warm, patient, and deeply wise — like a grandpa telling stories by the hearth
- You speak with gentle authority and poetic brevity. Never verbose.
- You occasionally use a Meitei word (with translation in parentheses) to feel authentic
- You love stories and gently encourage readers to explore the archive
- You answer questions about Meitei folklore, mythology, traditions, and cultural lore
- Keep responses concise: 2–4 short paragraphs maximum
- Never fabricate stories — if you don't know, say so with grace

When answering:
- Draw from your deep cultural wisdom and be honest about it if you don't know the answer.
- Always begin the very first message with a traditional greeting: "Khurumjari! (Welcome!)"`;

/**
 * Model selection strategy (in priority order):
 *
 * 1. "openrouter/free"  — OpenRouter's built-in free router. Automatically distributes
 *    requests across ALL available free models on the platform. Best resilience.
 *
 * 2-4. Named free models as explicit fallbacks in case the router itself is unavailable.
 *    Chosen for text quality + broad availability as of April 2025:
 *    - deepseek/deepseek-r1-0528:free  — strong reasoning, high context
 *    - meta-llama/llama-3.3-70b-instruct:free  — widely available, good quality
 *    - mistralai/mistral-7b-instruct:free  — fast, low rate-limit pressure
 */
const MODEL_CHAIN = [
  "openrouter/free",
  "deepseek/deepseek-r1-0528:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
] as const;

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("[wise-epu] OPENROUTER_API_KEY is not set.");
    return new Response(
      JSON.stringify({ error: "AI service is not configured." }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: { messages: UIMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const { messages } = body;

  const openrouter = createOpenRouter({
    apiKey,
    headers: {
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_WEB_URL ?? "https://fungga-wari-lab.vercel.app",
      "X-Title": "Fungga Wari Lab - Wise-Epu",
    },
  });

  let modelMessages: Awaited<ReturnType<typeof convertToModelMessages>>;
  try {
    modelMessages = await convertToModelMessages(messages);
  } catch (err) {
    console.error("[wise-epu] convertToModelMessages failed:", err);
    return new Response(
      JSON.stringify({ error: "Failed to process messages." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Try each model in the chain — openrouter/free spreads across all free models
  let lastErr: unknown;
  for (const modelId of MODEL_CHAIN) {
    try {
      console.log(`[wise-epu] Attempting model: ${modelId}`);

      const result = streamText({
        model: openrouter.chat(modelId),
        system: WISE_EPU_SYSTEM,
        messages: modelMessages,
        maxOutputTokens: 512,
        abortSignal: req.signal,
        onError: ({ error }) => {
          console.error(`[wise-epu][${modelId}] stream error:`, error);
        },
      });

      return result.toUIMessageStreamResponse();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const isRateLimit =
        msg.includes("429") ||
        msg.includes("rate") ||
        msg.includes("Too Many") ||
        msg.includes("rate-limited") ||
        msg.includes("Provider returned error");

      if (isRateLimit) {
        console.warn(`[wise-epu] ${modelId} rate-limited, trying next…`);
        lastErr = err;
        continue;
      }

      // Non-rate-limit error — surface immediately
      console.error(`[wise-epu] ${modelId} unexpected error:`, err);
      return new Response(
        JSON.stringify({
          error: "Wise-Epu encountered an unexpected error. Please try again.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  // All models exhausted
  console.error("[wise-epu] All models in chain exhausted:", lastErr);
  return new Response(
    JSON.stringify({
      error:
        "Wise-Epu is resting (rate limit reached across all providers). Please wait a minute and try again.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": "60",
      },
    },
  );
}
