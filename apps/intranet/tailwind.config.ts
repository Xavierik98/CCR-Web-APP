import type { Config } from "tailwindcss";

// Meme palette que le site public (section 7 : identite visuelle partagee entre
// les deux espaces), usage plus sobre puisque l'intranet est oriente productivite.
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
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};

export default config;
