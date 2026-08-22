"use client";

import { useCallback, useRef, useState } from "react";
import { ChatMessage, ElyraSettings, Mood } from "@/lib/types";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function useVoiceAssistant(settings: ElyraSettings) {
  const [mood, setMood] = useState<Mood>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const speak = useCallback((text: string) => {
    return new Promise<void>((resolve) => {
      const s = settingsRef.current;
      setMood("speaking");

      const finish = () => {
        setMood("idle");
        resolve();
      };

      if (s.useGeminiVoice && s.geminiApiKey) {
        fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey: s.geminiApiKey,
            model: s.ttsModel,
            voiceName: s.voiceName,
            text,
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (!data.audioDataUrl) throw new Error(data.error || "TTS failed");
            const audio = new Audio(data.audioDataUrl);
            audioRef.current = audio;
            audio.onended = finish;
            audio.onerror = finish;
            audio.play().catch(finish);
          })
          .catch(() => {
            // Fall back to the browser voice if Gemini TTS fails.
            speakWithBrowser(text, finish);
          });
      } else {
        speakWithBrowser(text, finish);
      }
    });
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const s = settingsRef.current;
      setError(null);

      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        text,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);

      if (!s.geminiApiKey) {
        setError("Add your Gemini API key in Settings to talk to Elyra.");
        setMood("warning");
        return;
      }

      setMood("thinking");

      try {
        const history = [...messages, userMsg].slice(-16).map((m) => ({
          role: m.role,
          text: m.text,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey: s.geminiApiKey,
            model: s.textModel,
            history: history.slice(0, -1),
            message: text,
            whatsapp: s.whatsapp,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");

        const assistantMsg: ChatMessage = {
          id: uid(),
          role: "assistant",
          text: data.text,
          sources: data.sources,
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // A little delight when something actually happened in the world -
        // this is the one moment "surprised" gets used, on purpose.
        if (data.action) {
          setMood("surprise");
          await new Promise((r) => setTimeout(r, 1400));
        }

        if (s.autoSpeak) {
          await speak(data.text);
        } else {
          setMood("idle");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setMood("warning");
      }
    },
    [messages, speak]
  );

  const stopSpeaking = useCallback(() => {
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    setMood("idle");
  }, []);

  return { mood, setMood, messages, error, sendMessage, speak, stopSpeaking };
}

function speakWithBrowser(text: string, onDone: () => void) {
  if (!("speechSynthesis" in window)) {
    onDone();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.onend = onDone;
  utterance.onerror = onDone;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
