import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  text: z.string().min(1).max(2500),
  voiceId: z.string().default("21m00Tcm4TlvDq8ikWAM"), // Rachel — warm, storytelling voice
});

// ElevenLabs model — Turbo v2.5 for lowest latency, English optimised
const ELEVENLABS_MODEL = "eleven_turbo_v2_5";

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

  const elevenRes = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL,
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.85,
          style: 0.35,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!elevenRes.ok) {
    const errText = await elevenRes.text().catch(() => "Unknown error");
    console.error("[TTS API] ElevenLabs error:", elevenRes.status, errText);
    return NextResponse.json(
      { error: "TTS generation failed.", status: elevenRes.status },
      { status: 502 },
    );
  }

  // Stream the audio directly to the client
  const audioBuffer = await elevenRes.arrayBuffer();

  return new NextResponse(audioBuffer, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, no-store",
    },
  });
}
