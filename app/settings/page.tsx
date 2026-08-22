"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadSettings, saveSettings } from "@/lib/storage";
import { DEFAULT_SETTINGS, ElyraSettings, GEMINI_VOICES } from "@/lib/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<ElyraSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  function update<K extends keyof ElyraSettings>(key: K, value: ElyraSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function updateWhatsapp<K extends keyof ElyraSettings["whatsapp"]>(
    key: K,
    value: ElyraSettings["whatsapp"][K]
  ) {
    setSettings((prev) => ({
      ...prev,
      whatsapp: { ...prev.whatsapp, [key]: value },
    }));
    setSaved(false);
  }

  function handleSave() {
    saveSettings(settings);
    setSaved(true);
  }

  return (
    <main className="min-h-screen bg-paper-50 px-4 pb-24 pt-6 text-ink-950 sm:px-8">
      <div className="mx-auto flex max-w-xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="font-mono text-xs text-mist-600 hover:text-signal-500"
          >
            &larr; Back
          </Link>
          <h1 className="font-display text-lg">Settings</h1>
          <div className="w-10" />
        </div>

        <Section
          title="Gemini API key"
          description="Elyra's beta runs on your own Gemini key - it's stored only in this browser and sent straight to Google on each request, never to any Elyra server of ours."
        >
          <TextField
            label="API key"
            type="password"
            value={settings.geminiApiKey}
            onChange={(v) => update("geminiApiKey", v)}
            placeholder="AIza..."
          />
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-signal-500 underline decoration-dotted"
          >
            Get a free key from Google AI Studio
          </a>
        </Section>

        <Section title="Voice">
          <ToggleField
            label="Use Gemini's generated voice"
            description="Off falls back to your browser's built-in voice (works without extra API calls)."
            checked={settings.useGeminiVoice}
            onChange={(v) => update("useGeminiVoice", v)}
          />
          {settings.useGeminiVoice && (
            <SelectField
              label="Voice"
              value={settings.voiceName}
              onChange={(v) => update("voiceName", v)}
              options={GEMINI_VOICES.map((v) => ({ value: v, label: v }))}
            />
          )}
          <ToggleField
            label="Speak replies out loud automatically"
            checked={settings.autoSpeak}
            onChange={(v) => update("autoSpeak", v)}
          />
        </Section>

        <Section title="Models" description="Advanced - only change if you know what you're doing.">
          <TextField
            label="Text model"
            value={settings.textModel}
            onChange={(v) => update("textModel", v)}
          />
          <TextField
            label="TTS model"
            value={settings.ttsModel}
            onChange={(v) => update("ttsModel", v)}
          />
        </Section>

        <Section
          title="WhatsApp"
          description="Lets Elyra send WhatsApp messages when you ask her to, using Meta's WhatsApp Cloud API. This needs a Meta developer app and a phone number connected to WhatsApp Business - it's not something Elyra can set up on her own."
        >
          <ToggleField
            label="Enable WhatsApp sending"
            checked={settings.whatsapp.enabled}
            onChange={(v) => updateWhatsapp("enabled", v)}
          />
          {settings.whatsapp.enabled && (
            <>
              <TextField
                label="Phone number ID"
                value={settings.whatsapp.phoneNumberId}
                onChange={(v) => updateWhatsapp("phoneNumberId", v)}
                placeholder="From Meta's WhatsApp Cloud API dashboard"
              />
              <TextField
                label="Access token"
                type="password"
                value={settings.whatsapp.accessToken}
                onChange={(v) => updateWhatsapp("accessToken", v)}
              />
              <TextField
                label="Default recipient (optional)"
                value={settings.whatsapp.defaultRecipient}
                onChange={(v) => updateWhatsapp("defaultRecipient", v)}
                placeholder="15551234567"
              />
              <p className="text-xs leading-relaxed text-mist-600">
                To let Elyra receive and reply to WhatsApp messages on her
                own, deploy this app and point Meta&apos;s webhook at{" "}
                <code className="rounded bg-paper-100 border border-ink-200 px-1 py-0.5 font-mono">
                  /api/whatsapp/webhook
                </code>{" "}
                - that part reads its credentials from server environment
                variables (see the README), not from this page.
              </p>
            </>
          )}
        </Section>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="rounded-full bg-ink-950 px-5 py-2.5 text-sm font-medium text-paper-50 transition-opacity hover:opacity-90"
          >
            Save
          </button>
          {saved && (
            <span className="font-mono text-xs text-signal-500 animate-fade-up">
              Saved
            </span>
          )}
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-ink-200 bg-paper-100 p-5">
      <div>
        <h2 className="font-display text-sm text-ink-950">{title}</h2>
        {description && (
          <p className="mt-1 text-xs leading-relaxed text-mist-600">
            {description}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-xs text-mist-600">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-ink-300 bg-paper-50 px-3 py-2 text-sm text-ink-950 outline-none placeholder:text-mist-600/60 focus:border-signal-500/60"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-xs text-mist-600">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-ink-300 bg-paper-50 px-3 py-2 text-sm text-ink-950 outline-none focus:border-signal-500/60"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4">
      <span>
        <span className="block text-sm text-ink-950">{label}</span>
        {description && (
          <span className="block text-xs text-mist-600">{description}</span>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-signal-500" : "bg-ink-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper-100 transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
