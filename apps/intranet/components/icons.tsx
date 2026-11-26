import type { SVGProps } from "react";

// Pictogrammes au trait, dessinés à la main pour l'intranet (pas de dépendance).
const PATHS = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  users: "M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M21 19v-1a4 4 0 0 0-3-3.85M16 3.15a3.5 3.5 0 0 1 0 6.7",
  check: "M9 11.5 11.5 14 16 9M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2",
  layers: "m12 3 9 5-9 5-9-5zM3 13l9 5 9-5",
  coins: "M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6",
  megaphone: "M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1M15 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12",
  inbox: "M3 13h5l1.5 3h5L16 13h5M5.5 5h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z",
  heart: "M12 20s-7-4.4-9-9.2C1.7 7.5 4 4 7.5 4c2 0 3.4 1.2 4.5 2.6C13.1 5.2 14.5 4 16.5 4 20 4 22.3 7.5 21 10.8 19 15.6 12 20 12 20",
  key: "M15 9a3 3 0 1 0 0-.01M11.3 11.2 3 19.5V21h3v-2h2v-2h2l1.8-1.8A6 6 0 1 0 11.3 11.2",
  calendar: "M4 6h16a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1M3 10h18M8 3v4M16 3v4",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 7v5l3 2",
  pen: "M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16zM13.5 6.5l4 4",
  plus: "M12 5v14M5 12h14",
  logout: "M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 16l-4-4 4-4M6 12h10",
  arrow: "M5 12h14M13 6l6 6-6 6",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d={PATHS[name]} />
    </svg>
  );
}
