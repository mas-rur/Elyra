import { Mood } from "./types";

export const MOOD_META: Record<
  Mood,
  { src: string; label: string; ring: string }
> = {
  idle: {
    src: "/avatars/surprised.svg",
    label: "Ready when you are",
    ring: "shadow-[0_0_60px_-10px_rgba(232,180,106,0.35)]",
  },
  listening: {
    src: "/avatars/suspicious.svg",
    label: "Listening",
    ring: "shadow-[0_0_80px_-10px_rgba(232,180,106,0.55)]",
  },
  thinking: {
    src: "/avatars/confused.svg",
    label: "Thinking",
    ring: "shadow-[0_0_70px_-10px_rgba(124,140,255,0.5)]",
  },
  speaking: {
    src: "/avatars/surprised.svg",
    label: "Speaking",
    ring: "shadow-[0_0_90px_-10px_rgba(124,140,255,0.6)]",
  },
  warning: {
    src: "/avatars/suspicious.svg",
    label: "Needs attention",
    ring: "shadow-[0_0_70px_-10px_rgba(232,137,106,0.55)]",
  },
};
