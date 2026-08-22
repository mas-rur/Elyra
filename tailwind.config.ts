import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds. 50 matches the exact fill color baked into the
        // avatar SVGs, so the page and the character read as one material.
        paper: {
          50: "#f9f9f9",
          100: "#ffffff",
        },
        // Dark ink tones - text, the blob's own fill, strong borders.
        ink: {
          950: "#0a0a0c",
          800: "#17171a",
          700: "#2b2b30",
          300: "#dedcd2",
          200: "#eae8de",
        },
        // Muted text on light surfaces.
        mist: {
          600: "#6b6b74",
          400: "#8a8a95",
        },
        ember: {
          300: "#f3d9a8",
          500: "#c9822e",
          600: "#a8661f",
        },
        signal: {
          300: "#c7cdff",
          500: "#4f5ce0",
          600: "#3c46c4",
        },
        warn: {
          300: "#f3c9ba",
          500: "#c65a3a",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        "ring-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.5" },
          "50%": { transform: "scale(1.08)", opacity: "0.9" },
        },
        "ring-pulse-slow": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.35" },
          "50%": { transform: "scale(1.04)", opacity: "0.6" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        drift: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "ring-pulse": "ring-pulse 1.6s ease-in-out infinite",
        "ring-pulse-slow": "ring-pulse-slow 3.2s ease-in-out infinite",
        "fade-up": "fade-up 0.4s ease-out both",
        drift: "drift 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
