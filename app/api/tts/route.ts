import { NextRequest, NextResponse } from "next/server";
import { GeminiError, generateSpeech } from "@/lib/gemini";
import { parseSampleRate, pcmBase64ToWavBuffer } from "@/lib/wav";

export const runtime = "nodejs";

interface TtsRequestBody {
  apiKey: string;
  model: string;
  voiceName: string;
  text: string;
}

export async function POST(req: NextRequest) {
  let body: TtsRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { apiKey, model, voiceName, text } = body;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing Gemini API key" }, { status: 401 });
  }
  if (!text?.trim()) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  try {
    const { base64Pcm, mimeType } = await generateSpeech({
      apiKey,
      model,
      voiceName,
      text: text.slice(0, 4000),
    });
    const sampleRate = parseSampleRate(mimeType);
    const wav = pcmBase64ToWavBuffer(base64Pcm, sampleRate);
    const dataUrl = `data:audio/wav;base64,${wav.toString("base64")}`;
    return NextResponse.json({ audioDataUrl: dataUrl });
  } catch (err) {
    if (err instanceof GeminiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
