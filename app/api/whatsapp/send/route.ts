import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const GRAPH_VERSION = "v21.0";

interface SendBody {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  message: string;
}

export async function POST(req: NextRequest) {
  let body: SendBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { phoneNumberId, accessToken, to, message } = body;
  if (!phoneNumberId || !accessToken) {
    return NextResponse.json(
      { error: "WhatsApp isn't connected. Add your Cloud API credentials in Settings." },
      { status: 401 }
    );
  }
  if (!to || !message) {
    return NextResponse.json(
      { error: "Missing recipient or message" },
      { status: 400 }
    );
  }

  const digitsOnly = to.replace(/[^\d]/g, "");

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: digitsOnly,
          type: "text",
          text: { body: message },
        }),
      }
    );

    const json = await res.json();
    if (!res.ok) {
      const reason =
        json?.error?.message ?? "Meta rejected the request";
      return NextResponse.json({ error: reason }, { status: res.status });
    }

    return NextResponse.json({ success: true, id: json?.messages?.[0]?.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Send failed" },
      { status: 500 }
    );
  }
}
