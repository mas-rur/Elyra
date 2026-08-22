// Thin wrapper around the Gemini REST API. We call `generateContent` directly
// over fetch instead of pulling in the @google/genai SDK, so the whole app
// has zero third-party API-client dependencies to drift out of date.
//
// Docs: https://ai.google.dev/api/generate-content
//       https://ai.google.dev/gemini-api/docs/speech-generation

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

export class GeminiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function geminiFetch(apiKey: string, model: string, body: unknown) {
  const res = await fetch(
    `${GEMINI_BASE}/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new GeminiError(
      `Gemini API error (${res.status}): ${errText}`,
      res.status
    );
  }

  return res.json();
}

export const ELYRA_SYSTEM_INSTRUCTION = (whatsappAvailable: boolean) => `
You are Elyra, a warm, sharp, and concise voice assistant. You are heard, not
read: replies are spoken aloud through text-to-speech, so write the way you'd
actually talk. Keep answers tight - a sentence or two for simple things, a
short paragraph at most for anything meatier. No headers, no bullet lists, no
markdown, no asterisks: plain spoken sentences only, since this text is
converted straight to audio.

You have two tools:
- Google Search grounding, for anything current, factual, or research-y.
  Use it whenever the answer might be time-sensitive or you're not certain -
  don't guess when you can check.
- ${
  whatsappAvailable
    ? "send_whatsapp_message, for sending a WhatsApp message on the user's behalf. Only call it when the user clearly asks you to send, text, or message someone. Confirm the recipient and content back to them in your reply."
    : "WhatsApp sending is not connected right now. If asked to send a message, say it needs to be turned on in Settings first."
}
`.trim();

export const SEND_WHATSAPP_FUNCTION_DECLARATION = {
  name: "send_whatsapp_message",
  description:
    "Send a WhatsApp text message to a phone number on the user's behalf.",
  parameters: {
    type: "object",
    properties: {
      to: {
        type: "string",
        description:
          "Recipient phone number in international format, digits only (e.g. 15551234567). If the user didn't give one, use the configured default recipient.",
      },
      message: {
        type: "string",
        description: "The message body to send.",
      },
    },
    required: ["message"],
  },
};

export interface GeminiContentPart {
  text?: string;
  functionCall?: { name: string; args: Record<string, unknown> };
  functionResponse?: { name: string; response: Record<string, unknown> };
}

export interface GeminiContent {
  role: "user" | "model" | "function";
  parts: GeminiContentPart[];
}

export async function generateChatTurn(opts: {
  apiKey: string;
  model: string;
  contents: GeminiContent[];
  whatsappAvailable: boolean;
}) {
  const tools: Record<string, unknown>[] = [{ google_search: {} }];
  if (opts.whatsappAvailable) {
    tools.push({ functionDeclarations: [SEND_WHATSAPP_FUNCTION_DECLARATION] });
  }

  return geminiFetch(opts.apiKey, opts.model, {
    contents: opts.contents,
    systemInstruction: {
      parts: [{ text: ELYRA_SYSTEM_INSTRUCTION(opts.whatsappAvailable) }],
    },
    tools,
    generationConfig: {
      temperature: 0.8,
    },
  });
}

export async function generateSpeech(opts: {
  apiKey: string;
  model: string;
  voiceName: string;
  text: string;
}) {
  const data = await geminiFetch(opts.apiKey, opts.model, {
    contents: [{ role: "user", parts: [{ text: opts.text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: opts.voiceName } },
      },
    },
  });

  const part = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  if (!part?.data) {
    throw new GeminiError("Gemini returned no audio data", 502);
  }
  return { base64Pcm: part.data as string, mimeType: (part.mimeType as string) ?? "audio/L16;rate=24000" };
}

/** Pull the first candidate's text + any functionCall parts + grounding sources out of a generateContent response. */
export function parseCandidate(data: any) {
  const candidate = data?.candidates?.[0];
  const parts: GeminiContentPart[] = candidate?.content?.parts ?? [];
  const text = parts
    .map((p) => p.text)
    .filter(Boolean)
    .join(" ")
    .trim();
  const functionCalls = parts
    .filter((p) => p.functionCall)
    .map((p) => p.functionCall!);
  const groundingChunks = candidate?.groundingMetadata?.groundingChunks ?? [];
  const sources = groundingChunks
    .map((c: any) => c?.web)
    .filter(Boolean)
    .map((w: any) => ({ title: w.title ?? w.uri, uri: w.uri }));
  return { text, functionCalls, sources, rawParts: parts };
}
