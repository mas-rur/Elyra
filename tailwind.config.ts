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
        ink: {
          950: "#0a0a0c",
          900: "#131316",
          800: "#1c1c21",
          700: "#28282f",
          600: "#38383f",
        },
        mist: {
          400: "#8a8a95",
          300: "#a8a8b3",
        },
        paper: {
          100: "#f2f0ea",
        },
        ember: {
          300: "#f0c98a",
          400: "#e8b46a",
          500: "#d99a45",
        },
        signal: {
          300: "#a9b3ff",
          400: "#7c8cff",
          500: "#5c6bee",
        },
        warn: {
          400: "#e8896a",
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
          "0%, 100%": { transform: "scale(1)", opacity: "0.25" },
          "50%": { transform: "scale(1.04)", opacity: "0.45" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "drift": {
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
