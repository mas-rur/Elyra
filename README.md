# Elyra

A voice-first AI assistant. Talk to her, ask her to look something up, or have
her send a WhatsApp message for you. Built with Next.js (App Router), and
in beta: you bring your own Gemini API key, stored only in your browser.

## What it does

- **Voice conversation** - press-to-talk mic (browser Web Speech API) in,
  spoken replies out.
- **Research and browsing** - every reply can use Gemini's Google Search
  grounding tool, so Elyra checks the web instead of guessing when it matters.
- **WhatsApp** - ask her to send a message and, if you've connected your
  WhatsApp Cloud API credentials in Settings, she'll send it via Meta's API
  and confirm back to you.
- **Mood avatar** - the hexagon in the middle switches between three states:
  idle/speaking (surprised), listening (wary/attentive), and thinking
  (confused), using the animated SVGs you provided.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000, go to **Settings**, and paste in a Gemini API
key (free from [Google AI Studio](https://aistudio.google.com/apikey)).
That's the only thing required to start talking to Elyra.

Voice input needs a Chromium-based browser (Chrome, Edge) - Safari and
Firefox don't support the SpeechRecognition API yet. Typing always works.

## About the voice

You linked [MisoTTS](https://github.com/MisoLabsAI/MisoTTS) as a reference.
Worth knowing before you plan around it: it's an 8B-parameter model that
needs a 24GB+ VRAM GPU to run inference, so it can't run in a browser or a
serverless Next.js deploy - it would need its own always-on GPU server
behind an API you self-host. That's a real option later (swap the TTS call
in `lib/gemini.ts` for a fetch to your own MisoTTS endpoint), but it's a
separate infrastructure project from this app.

For the beta, Elyra's voice comes from **Gemini's own TTS models**
(`gemini-2.5-flash-preview-tts` by default, configurable in Settings) -
it's expressive, it uses the same key you already have to bring, and there's
nothing extra to host. There's also a plain browser-voice fallback with no
API cost, toggleable in Settings.

## About WhatsApp

The send side works as soon as you add a WhatsApp Cloud API phone number ID
and access token in Settings (from Meta's developer console) - ask Elyra to
send a message and she will.

The *receive* side (Elyra listening for messages sent to your WhatsApp
number and replying on her own) needs a public webhook, which only works
once you deploy this app somewhere with a real URL - it can't be
demonstrated on localhost. See `.env.example` and
`app/api/whatsapp/webhook/route.ts` for what's needed: register that route's
URL as your Meta app's webhook, set `WHATSAPP_VERIFY_TOKEN` to match, and
set `ELYRA_WHATSAPP_AUTOREPLY=true`.

## Project layout

```
app/
  page.tsx                 main voice screen
  settings/page.tsx         Gemini key, voice, WhatsApp config
  api/chat/route.ts         Gemini chat + Google Search grounding + WhatsApp function calling
  api/tts/route.ts          Gemini text-to-speech -> WAV
  api/whatsapp/send/route.ts    sends via Meta Cloud API
  api/whatsapp/webhook/route.ts verification + incoming-message auto-reply
components/                 MoodAvatar, MicButton, TranscriptPanel, Composer, Topbar
hooks/                      useVoiceAssistant (state machine), useSpeechRecognition, useMicAmplitude
lib/                        gemini.ts (REST calls), types, moods, storage, wav
public/avatars/             your three SVGs
```

## Beta security note

Your Gemini key and WhatsApp token live in `localStorage` and get sent to
Elyra's own `/api/*` routes on each request, which forward them straight to
Google/Meta - nothing is written to a database. That's fine for local or
personal use. If you ever deploy this somewhere other people will use, move
those secrets to real per-user, server-side storage first - don't ship
`localStorage`-held API keys to a multi-user production app.

## What wasn't built here

This is a working app, not a fully hosted product: nobody has run `npm
install`/`npm run build` on it (this environment has no package registry
access), and the WhatsApp receive flow needs your own deployment + Meta
app review to actually fire. Test locally, watch the terminal for type
errors on first build, and treat the WhatsApp webhook as a starting point
rather than a drop-in.
