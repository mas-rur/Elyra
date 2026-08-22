"use client";

import { Mood } from "@/lib/types";
import { MOOD_META } from "@/lib/moods";

export function MoodAvatar({
  mood,
  amplitude = 0,
}: {
  mood: Mood;
  /** 0-1, drives extra ring scale while listening/speaking. */
  amplitude?: number;
}) {
  const meta = MOOD_META[mood];
  const active = mood === "listening" || mood === "speaking";

  return (
    <div className="relative flex items-center justify-center h-[280px] w-[280px] sm:h-[320px] sm:w-[320px]">
      {/* Outer ambient rings - always drifting gently, faster while active */}
      <div
        className="absolute inset-0 rounded-full border border-signal-500/25 animate-ring-pulse-slow"
        aria-hidden
      />
      <div
        className="absolute inset-6 rounded-full border border-ember-500/25 animate-ring-pulse-slow"
        style={{ animationDelay: "0.6s" }}
        aria-hidden
      />
      {active && (
        <div
          className="absolute inset-10 rounded-full border-2 border-ember-500/45 animate-ring-pulse"
          style={{ transform: `scale(${1 + amplitude * 0.15})` }}
          aria-hidden
        />
      )}

      {/* The hexagon itself */}
      <div
        className={`relative rounded-full transition-shadow duration-500 ${meta.ring}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={meta.src}
          src={meta.src}
          alt=""
          role="presentation"
          className="h-[220px] w-[220px] sm:h-[250px] sm:w-[250px] animate-fade-up select-none pointer-events-none"
          draggable={false}
        />
      </div>
    </div>
  );
}
