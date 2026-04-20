import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Neo Lumen palette ──────────────────────────── */
        "lime-signal": {
          50:  "#F0FBE0",
          200: "#D1F27A",
          400: "#B5E82F",   // ★ primary UI
          600: "#7DB313",
          800: "#3B6D11",
        },
        "violet-deep": {
          50:  "#EEEDFE",
          200: "#CECBF6",
          400: "#7F77DD",
          600: "#534AB7",   // ★ secondary
          800: "#26215C",
        },
        "peach-streak": {
          50:  "#FAECE7",
          200: "#F5C4B3",
          400: "#FF8A5B",   // ★ rewards / XP / streaks
          600: "#D85A30",
          800: "#712B13",
        },
        "ink-violet": {
          base:    "#0B0A1A",
          surface: "#14132B",
          raised:  "#1E1C3F",
          hover:   "#272556",
          muted:   "#6E6B8F",
          text:    "#E8E6F5",
        },
        "text-neo": {
          primary:   "#E8E6F5",
          secondary: "#A6A2C7",
          tertiary:  "#6E6B8F",
          accent:    "#B5E82F",
        },
        "border-neo": {
          DEFAULT: "#2F2C55",
          subtle:  "#1B1938",
          focus:   "#B5E82F",
          error:   "#FF5B7A",
        },
        negative: "#FF5B7A",
        /* ── V2.0 Kinetic Drop (legacy, kept for compat) ── */
        ink: {
          900: "#0E0E0E",
          800: "#131313",
          700: "#1A1A1A",
          600: "#262626",
          500: "#2E2E2E",
          400: "#484847",
        },
        lime: {
          DEFAULT: "#CAFD00",
          soft:    "#F3FFCA",
          ink:     "#516700",
          glow:    "rgba(202,253,0,0.20)",
        },
        plasma: {
          DEFAULT: "#D277FF",
          deep:    "#7D01B1",
          ink:     "#380052",
          glow:    "rgba(210,119,255,0.20)",
        },
        fog: {
          DEFAULT: "#ADAAAA",
          muted:   "#7A7777",
        },
        edge: {
          DEFAULT: "rgba(72,72,71,0.20)",
          strong:  "rgba(72,72,71,0.40)",
        },
        positive: "#10B981",
      },

      fontFamily: {
        pretendard: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        body:    ["var(--font-manrope)",       "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "ui-monospace", "monospace"],
      },

      boxShadow: {
        "card":            "0 1px 3px rgba(0,0,0,0.50), 0 1px 2px rgba(0,0,0,0.35)",
        "card-raised":     "0 4px 16px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.35)",
        "sheet":           "0 -8px 32px rgba(0,0,0,0.65)",
        "glow-accent":     "0 0 24px rgba(181,232,47,0.35)",
        "glow-positive":   "0 0 16px rgba(181,232,47,0.30)",
        "glow-violet":     "0 0 22px rgba(127,119,221,0.35)",
        /* legacy */
        "glow-lime":   "0 8px 30px rgba(202,253,0,0.20)",
        "glow-plasma": "0 8px 30px rgba(210,119,255,0.25)",
      },

      backgroundImage: {
        "gradient-hero":        "linear-gradient(135deg, #0B0A1A 0%, #1A1740 100%)",
        "gradient-accent-glow": "radial-gradient(ellipse at 50% 0%, rgba(181,232,47,0.18) 0%, transparent 70%)",
        "gradient-lime":        "linear-gradient(135deg, #B5E82F 0%, #7DB313 100%)",
        "gradient-violet":      "linear-gradient(135deg, #7F77DD 0%, #26215C 100%)",
        "gradient-peach":       "linear-gradient(135deg, #FF8A5B 0%, #D85A30 100%)",
        /* legacy */
        "lime-drop":   "linear-gradient(135deg, #F3FFCA 0%, #CAFD00 100%)",
        "plasma-drop": "linear-gradient(135deg, #D277FF 0%, #7D01B1 100%)",
      },

      borderRadius: {
        "sm-neo": "8px",
        "md-neo": "12px",
        "lg-neo": "16px",
        "xl-neo": "24px",
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4" },
          "50%":      { opacity: "0.8" },
        },
        "skeleton-shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%":   { opacity: "0", transform: "translateY(100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },

      animation: {
        "fade-up":     "fade-up 300ms cubic-bezier(0.0,0.0,0.2,1) both",
        "pulse-glow":  "pulse-glow 3s ease-in-out infinite",
        "scale-in":    "scale-in 250ms cubic-bezier(0.0,0.0,0.2,1) both",
        "slide-up":    "slide-up 350ms cubic-bezier(0.0,0.0,0.2,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
