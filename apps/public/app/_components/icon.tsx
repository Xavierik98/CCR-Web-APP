import type { ReactNode } from "react";

// Jeu d'icones minimal, dessinees a la main (pas de dependance externe),
// utilisees pour donner un repere visuel rapide sur les cartes de programme
// et de departements.
const PATHS: Record<string, ReactNode> = {
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </>
  ),
  book: (
    <>
      <path d="M12 6c-1.5-1-4-1.5-7-1v13c3-.5 5.5 0 7 1 1.5-1 4-1.5 7-1V5c-3-.5-5.5 0-7 1Z" />
      <path d="M12 6v13" />
    </>
  ),
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
  home: (
    <>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9" />
    </>
  ),
  star: (
    <path d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9Z" />
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M2 20c0-3.3 3-5 7-5s7 1.7 7 5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M22 20c0-2.5-1.8-4-4-4.5" />
    </>
  ),
  heart: (
    <path d="M12 20s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9Z" />
  ),
  spark: (
    <>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  map: (
    <>
      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5h16v11H9l-5 4V5Z" />
      <path d="M8 9h8M8 12.5h5" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3l1.5-2h7L17 8h3v11H4Z" />
      <circle cx="12" cy="13.5" r="3.2" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="7" width="12" height="10" rx="1.5" />
      <path d="M15 10.5 21 7v10l-6-3.5Z" />
    </>
  ),
};

export function Icon({
  name,
  className,
}: {
  name: keyof typeof PATHS;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
