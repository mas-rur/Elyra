import { NextRequest, NextResponse } from "next/server";
import { generateChatTurn, parseCandidate } from "@/lib/gemini";

export const runtime = "nodejs";

/**
 * This route only does anything once you've deployed the app somewhere with
 * a public URL and registered that URL as the webhook for a WhatsApp Cloud
 * API app in Meta's developer console - it can't be exercised from inside
 * this sandbox. It reads its credentials from server environment variables
 * (see .env.example) rather than the browser-stored settings, because Meta
 * calls this endpoint directly with no logged-in session attached.
 */

// Meta's one-time verification handshake when you register the webhook URL.
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// Incoming messages from users on WhatsApp.
export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null);
  const entry = payload?.entry?.[0]?.changes?.[0]?.value;
  const message = entry?.messages?.[0];

  // Not a text message (delivery receipt, image, etc.) - nothing to do.
  if (!message || message.type !== "text") {
    return NextResponse.json({ ok: true });
  }

  const from: string = message.from;
  const text: string = message.text?.body ?? "";

  const geminiKey = process.env.GEMINI_API_KEY;
  const autoReply = process.env.ELYRA_WHATSAPP_AUTOREPLY === "true";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!autoReply || !geminiKey || !phoneNumberId || !accessToken) {
    return NextResponse.json({ ok: true });
  }

  try {
    const data = await generateChatTurn({
      apiKey: geminiKey,
      model: process.env.GEMINI_TEXT_MODEL || "gemini-3.7-flash",
      contents: [{ role: "user", parts: [{ text }] }],
      whatsappAvailable: false,
    });
    const { text: replyText } = parseCandidate(data);

    await fetch(`${req.nextUrl.origin}/api/whatsapp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumberId,
        accessToken,
        to: from,
        message: replyText || "Sorry, I didn't catch that.",
      }),
    });
  } catch {
    // Swallow errors here - Meta retries webhooks that return non-2xx, and
    // we don't want a Gemini hiccup to trigger repeated retries.
  }

  return NextResponse.json({ ok: true });
}
