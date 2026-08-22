"use client";

import { Mood } from "@/lib/types";

export function MicButton({
  mood,
  isListening,
  onStart,
  onStop,
  disabled,
}: {
  mood: Mood;
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}) {
  const busy = mood === "thinking" || mood === "speaking";

  return (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={isListening ? onStop : onStart}
      aria-pressed={isListening}
      aria-label={isListening ? "Stop listening" : "Start talking to Elyra"}
      className={`group relative flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${
        isListening
          ? "border-ember-400 bg-ember-400/10 text-ember-300"
          : "border-ink-600 bg-ink-900 text-paper-100 hover:border-signal-400/60 hover:text-signal-300"
      }`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="relative z-10"
      >
        <path
          d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M19 11a7 7 0 01-14 0M12 18v3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      {isListening && (
        <span className="absolute inset-0 rounded-full border border-ember-400 animate-ring-pulse" />
      )}
    </button>
  );
}
