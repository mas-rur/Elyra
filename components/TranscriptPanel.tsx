"use client";

import { ChatMessage } from "@/lib/types";

export function TranscriptPanel({ messages }: { messages: ChatMessage[] }) {
  if (messages.length === 0) {
    return (
      <p className="text-center text-sm text-mist-400 font-mono">
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
            className={`inline-block rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
              m.role === "user"
                ? "bg-signal-400/15 text-paper-100"
                : "bg-ink-800 text-paper-100"
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
                  className="text-xs font-mono text-mist-400 underline decoration-dotted hover:text-signal-300"
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
