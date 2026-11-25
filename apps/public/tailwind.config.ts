import type { Config } from "tailwindcss";

// Palette et typographie neutres : la charte graphique CCR n'est pas encore fournie.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
