import { NextRequest, NextResponse } from "next/server";
import {
  GeminiContent,
  GeminiError,
  generateChatTurn,
  parseCandidate,
} from "@/lib/gemini";

export const runtime = "nodejs";

interface ChatRequestBody {
  apiKey: string;
  model: string;
  history: { role: "user" | "assistant"; text: string }[];
  message: string;
  whatsapp?: {
    enabled: boolean;
    phoneNumberId: string;
    accessToken: string;
    defaultRecipient: string;
  };
}

export async function POST(req: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { apiKey, model, history, message, whatsapp } = body;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing Gemini API key. Add one in Settings." },
      { status: 401 }
    );
  }
  if (!message?.trim()) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  const whatsappAvailable = Boolean(
    whatsapp?.enabled && whatsapp.phoneNumberId && whatsapp.accessToken
  );

  const contents: GeminiContent[] = [
    ...history.map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: m.text }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  try {
    let data = await generateChatTurn({
      apiKey,
      model,
      contents,
      whatsappAvailable,
    });
    let parsed = parseCandidate(data);

    let actionTaken: { to: string; message: string } | null = null;

    // Function-calling round trip: Elyra asked to send a WhatsApp message.
    // We execute it server-side, then hand the result back so she can
    // confirm it in natural language.
    if (parsed.functionCalls.length > 0 && whatsappAvailable) {
      const call = parsed.functionCalls.find(
        (c) => c.name === "send_whatsapp_message"
      );
      if (call) {
        const to =
          (call.args.to as string | undefined) ||
          whatsapp!.defaultRecipient;
        const text = call.args.message as string;

        let functionResult: Record<string, unknown>;
        if (!to) {
          functionResult = {
            success: false,
            error:
              "No recipient number was given and no default recipient is configured.",
          };
        } else {
          try {
            const sendRes = await fetch(
              `${req.nextUrl.origin}/api/whatsapp/send`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  phoneNumberId: whatsapp!.phoneNumberId,
                  accessToken: whatsapp!.accessToken,
                  to,
                  message: text,
                }),
              }
            );
            const sendJson = await sendRes.json();
            functionResult = sendRes.ok
              ? { success: true, to, message: text }
              : { success: false, error: sendJson?.error ?? "Send failed" };
            if (sendRes.ok) actionTaken = { to, message: text };
          } catch (err) {
            functionResult = {
              success: false,
              error: err instanceof Error ? err.message : "Send failed",
            };
          }
        }

        contents.push({
          role: "model",
          parts: [{ functionCall: call }],
        });
        contents.push({
          role: "function",
          parts: [
            {
              functionResponse: {
                name: "send_whatsapp_message",
                response: functionResult,
              },
            },
          ],
        });

        data = await generateChatTurn({
          apiKey,
          model,
          contents,
          whatsappAvailable,
        });
        parsed = parseCandidate(data);
      }
    }

    return NextResponse.json({
      text: parsed.text || "I didn't catch a response for that - try again?",
      sources: parsed.sources,
      action: actionTaken,
    });
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
