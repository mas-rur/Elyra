"use client";

import Link from "next/link";

export function Topbar({ hasKey }: { hasKey: boolean }) {
  return (
    <header className="flex items-center justify-between px-5 py-4 sm:px-8">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-ember-500" aria-hidden />
        <span className="font-display text-lg tracking-wide text-ink-950">
          Elyra
        </span>
        <span className="ml-2 rounded-full border border-ink-300 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-mist-600">
          Beta
        </span>
      </div>
      <Link
        href="/settings"
        className="flex items-center gap-1.5 rounded-full border border-ink-300 px-3 py-1.5 text-xs font-mono text-mist-600 transition-colors hover:border-signal-500/50 hover:text-signal-500"
      >
        {!hasKey && (
          <span className="h-1.5 w-1.5 rounded-full bg-warn-500" aria-hidden />
        )}
        Settings
      </Link>
    </header>
  );
}
