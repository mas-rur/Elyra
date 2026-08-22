import { Mood } from "./types";

// Neutral is its own asset now - surprised is reserved for an actual
// moment of surprise (see the brief flash triggered in
// useVoiceAssistant.ts after a WhatsApp send succeeds), not reused as
// filler for idle/speaking.
export const MOOD_META: Record<
  Mood,
  { src: string; label: string; ring: string }
> = {
  idle: {
    src: "/avatars/neutral.svg",
    label: "Ready when you are",
    ring: "shadow-[0_0_60px_-10px_rgba(201,130,46,0.35)]",
  },
  listening: {
    src: "/avatars/suspicious.svg",
    label: "Listening",
    ring: "shadow-[0_0_80px_-10px_rgba(201,130,46,0.55)]",
  },
  thinking: {
    src: "/avatars/confused.svg",
    label: "Thinking",
    ring: "shadow-[0_0_70px_-10px_rgba(79,92,224,0.45)]",
  },
  speaking: {
    src: "/avatars/neutral.svg",
    label: "Speaking",
    ring: "shadow-[0_0_90px_-10px_rgba(79,92,224,0.55)]",
  },
  warning: {
    src: "/avatars/suspicious.svg",
    label: "Needs attention",
    ring: "shadow-[0_0_70px_-10px_rgba(198,90,58,0.5)]",
  },
  surprise: {
    src: "/avatars/surprised.svg",
    label: "Oh!",
    ring: "shadow-[0_0_100px_-10px_rgba(201,130,46,0.65)]",
  },
};
