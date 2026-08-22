import { DEFAULT_SETTINGS, ElyraSettings } from "./types";

const KEY = "elyra:settings:v1";

/**
 * Beta note: the Gemini key and WhatsApp token are kept in the browser's
 * localStorage only. They're sent to /api/* on each request and forwarded
 * straight to Google/Meta - Elyra's own server never stores them. That's
 * fine for local/personal use, but don't deploy this build publicly without
 * moving secrets to a real per-user server-side store first.
 */
export function loadSettings(): ElyraSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      whatsapp: { ...DEFAULT_SETTINGS.whatsapp, ...(parsed.whatsapp ?? {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: ElyraSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(settings));
}
