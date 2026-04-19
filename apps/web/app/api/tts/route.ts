import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import https from "node:https";

const requestSchema = z.object({
  text: z.string().min(1).max(2500),
  // Sarah — warm, expressive female narration voice (free tier, premade)
  voiceId: z.string().default("EXAVITQu4vr4xnSDxMaL"),
});

// eleven_turbo_v2_5 — lowest latency, free tier compatible
const ELEVENLABS_MODEL = "eleven_turbo_v2_5";
const ELEVENLABS_HOST = "api.elevenlabs.io";

/** Call ElevenLabs TTS via Node's native https to bypass Next.js fetch patching */
function elevenLabsRequest(
  voiceId: string,
  body: string,
  apiKey: string,
): Promise<{ status: number; contentType: string | null; buffer: Buffer }> {
  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname: ELEVENLABS_HOST,
      path: `/v1/text-to-speech/${voiceId}`,
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
        "Content-Length": Buffer.byteLength(body),
      },
      timeout: 30_000,
    };

    const req = https.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => {
        resolve({
          status: res.statusCode ?? 0,
          contentType: res.headers["content-type"] ?? null,
          buffer: Buffer.concat(chunks),
        });
      });
      res.on("error", reject);
    });

    req.on("timeout", () => {
      req.destroy(new Error("ElevenLabs request timed out"));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TTS service is not configured." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { text, voiceId } = parsed.data;

  const requestBody = JSON.stringify({
    text,
    model_id: ELEVENLABS_MODEL,
    voice_settings: {
      stability: 0.50,
      similarity_boost: 0.80,
      style: 0.25,
      use_speaker_boost: true,
    },
  });

  let result: { status: number; contentType: string | null; buffer: Buffer };
  try {
    result = await elevenLabsRequest(voiceId, requestBody, apiKey);
  } catch (err) {
    console.error("[TTS API] Network error reaching ElevenLabs:", err);
    return NextResponse.json(
      { error: "Could not reach TTS service." },
      { status: 503 },
    );
  }

  if (result.status !== 200) {
    const errText = result.buffer.toString("utf-8");
    console.error(
      `[TTS API] ElevenLabs HTTP ${result.status} — voice: ${voiceId} — model: ${ELEVENLABS_MODEL}`,
      "\nBody:", errText,
    );

    let detail = errText;
    try {
      const parsed = JSON.parse(errText) as { detail?: { message?: string } | string };
      if (typeof parsed.detail === "string") detail = parsed.detail;
      else if (typeof parsed.detail?.message === "string") detail = parsed.detail.message;
    } catch { /* not JSON */ }

    return NextResponse.json(
      { error: detail || "TTS generation failed.", status: result.status },
      { status: 502 },
    );
  }

  // Allocate a fresh ArrayBuffer (plain, never SharedArrayBuffer) and copy bytes in
  const audioBuffer = new ArrayBuffer(result.buffer.byteLength);
  new Uint8Array(audioBuffer).set(result.buffer);

  return new NextResponse(audioBuffer, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, no-store",
    },
  });
}
