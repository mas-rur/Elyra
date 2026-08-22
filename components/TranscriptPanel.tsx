"use client";

import { ChatMessage } from "@/lib/types";

export function TranscriptPanel({ messages }: { messages: ChatMessage[] }) {
  if (messages.length === 0) {
    return (
      <p className="text-center text-sm text-mist-600 font-mono">
        Tap the mic, or type below, to start.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`animate-fade-up max-w-[85%] ${
            m.role === "user" ? "self-end text-right" : "self-start text-left"
          }`}
        >
          <div
            className={`inline-block rounded-2xl border px-4 py-2.5 text-[15px] leading-relaxed ${
              m.role === "user"
                ? "border-signal-500/20 bg-signal-500/10 text-ink-950"
                : "border-ink-200 bg-paper-100 text-ink-950"
            }`}
          >
            {m.text}
          </div>
          {m.sources && m.sources.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-2 justify-end">
              {m.sources.slice(0, 4).map((s, i) => (
                <a
                  key={i}
                  href={s.uri}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-mist-600 underline decoration-dotted hover:text-signal-500"
                >
                  {new URL(s.uri).hostname.replace("www.", "")}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
