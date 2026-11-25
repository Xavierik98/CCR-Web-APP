import type { Config } from "tailwindcss";

// Palette extraite par echantillonnage du logo officiel CCR Famille (voir
// apps/public/public/logo-ccr-famille.jpg), pas choisie au hasard.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ccr: {
          gold: "#E3A638",
          "gold-light": "#F2C94D",
          magenta: "#DA2979",
          blue: "#4174B6",
          cream: "#FAF9F6",
          ink: "#201C16",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};

export default config;
