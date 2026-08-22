export type Mood = "idle" | "listening" | "thinking" | "speaking" | "warning";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  sources?: GroundingSource[];
  createdAt: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ElyraSettings {
  geminiApiKey: string;
  textModel: string;
  ttsModel: string;
  voiceName: string;
  useGeminiVoice: boolean;
  autoSpeak: boolean;
  whatsapp: WhatsAppSettings;
}

export interface WhatsAppSettings {
  enabled: boolean;
  phoneNumberId: string;
  accessToken: string;
  defaultRecipient: string;
}

export const DEFAULT_SETTINGS: ElyraSettings = {
  geminiApiKey: "",
  textModel: "gemini-3.7-flash",
  ttsModel: "gemini-2.5-flash-preview-tts",
  voiceName: "Kore",
  useGeminiVoice: true,
  autoSpeak: true,
  whatsapp: {
    enabled: false,
    phoneNumberId: "",
    accessToken: "",
    defaultRecipient: "",
  },
};

export const GEMINI_VOICES = [
  "Kore",
  "Puck",
  "Zephyr",
  "Charon",
  "Fenrir",
  "Leda",
  "Orus",
  "Aoede",
  "Callirrhoe",
  "Autonoe",
  "Achird",
  "Sulafat",
] as const;
