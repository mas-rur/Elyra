"use client";

import { useEffect, useRef, useState } from "react";
import { MoodAvatar } from "@/components/MoodAvatar";
import { MicButton } from "@/components/MicButton";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { Topbar } from "@/components/Topbar";
import { Composer } from "@/components/Composer";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useMicAmplitude } from "@/hooks/useMicAmplitude";
import { loadSettings } from "@/lib/storage";
import { DEFAULT_SETTINGS, ElyraSettings } from "@/lib/types";
import { MOOD_META } from "@/lib/moods";

export default function Home() {
  const [settings, setSettings] = useState<ElyraSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSettings(loadSettings());
    setHydrated(true);
  }, []);

  const { mood, messages, error, sendMessage, stopSpeaking } =
    useVoiceAssistant(settings);

  const { supported, isListening, interimTranscript, start, stop } =
    useSpeechRecognition({
      onFinalResult: (transcript) => sendMessage(transcript),
    });

  const amplitude = useMicAmplitude(isListening);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, interimTranscript]);

  const displayMood = isListening ? "listening" : mood;

  return (
    <main className="flex min-h-screen flex-col bg-paper-50">
      <Topbar hasKey={Boolean(settings.geminiApiKey)} />

      <div className="flex flex-1 flex-col items-center px-4">
        <div className="flex flex-col items-center pt-4 sm:pt-8">
          <MoodAvatar mood={displayMood} amplitude={amplitude} />
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-mist-600">
            {isListening ? "Listening" : MOOD_META[mood].label}
          </p>
          {interimTranscript && (
            <p className="mt-2 max-w-sm text-center text-sm text-mist-600 animate-fade-up">
              &ldquo;{interimTranscript}&rdquo;
            </p>
          )}
        </div>

        {error && (
          <div className="mt-4 max-w-md rounded-xl border border-warn-500/30 bg-warn-500/10 px-4 py-2.5 text-center text-sm text-warn-500 animate-fade-up">
            {error}
            {!settings.geminiApiKey && (
              <>
                {" "}
                <a href="/settings" className="underline">
                  Add your key
                </a>
              </>
            )}
          </div>
        )}

        <div className="mt-8 w-full max-w-xl flex-1 overflow-y-auto pb-4">
          <TranscriptPanel messages={messages} />
          <div ref={transcriptEndRef} />
        </div>
      </div>

      <div className="sticky bottom-0 flex flex-col items-center gap-4 border-t border-ink-200 bg-paper-50/90 px-4 py-5 backdrop-blur">
        {!supported && (
          <p className="text-center text-xs text-mist-600 font-mono">
            Voice input isn&apos;t supported in this browser - try Chrome or
            Edge, or just type below.
          </p>
        )}
        <div className="flex items-center gap-4">
          <MicButton
            mood={mood}
            isListening={isListening}
            onStart={start}
            onStop={stop}
            disabled={!supported || !hydrated}
          />
          {mood === "speaking" && (
            <button
              type="button"
              onClick={stopSpeaking}
              className="rounded-full border border-ink-300 px-3 py-1.5 text-xs font-mono text-mist-600 hover:border-signal-500/50 hover:text-signal-500"
            >
              Stop
            </button>
          )}
        </div>
        <div className="w-full max-w-xl">
          <Composer
            onSend={sendMessage}
            disabled={mood === "thinking" || mood === "speaking"}
          />
        </div>
      </div>
    </main>
  );
}
