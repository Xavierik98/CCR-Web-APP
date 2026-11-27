// Pictogrammes animés des ministères, dessinés pour le site (pas de banque
// d'icônes). Chaque dessin a un petit mouvement continu qui lui est propre :
// notes qui s'envolent du piano, ondes du mégaphone, pièce qui tombe dans la
// tirelire, cœur qui bat dans les mains, porte qui s'ouvre sur l'accueil.
// Les animations sont définies dans globals.css (préfixe dept-).
export type DepartementIcon = "louange" | "communication" | "finances" | "social" | "ordre";

export function DepartmentIcon({ name, className = "" }: { name: DepartementIcon; className?: string }) {
  const common = {
    viewBox: "0 0 64 64",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  if (name === "louange") {
    return (
      <svg {...common}>
        {/* Clavier */}
        <rect x="6" y="34" width="52" height="22" rx="3" />
        <path d="M16.4 34v22M26.8 34v22M37.2 34v22M47.6 34v22" />
        <path d="M13 34h6v12h-6zM23.4 34h6v12h-6zM44.2 34h6v12h-6z" fill="currentColor" stroke="none" />
        {/* Notes qui s'envolent */}
        <g className="dept-note">
          <path d="M22 26V12l10-3v14" />
          <ellipse cx="19.5" cy="26" rx="3" ry="2.3" fill="currentColor" stroke="none" />
          <ellipse cx="29.5" cy="23" rx="3" ry="2.3" fill="currentColor" stroke="none" />
        </g>
        <g className="dept-note dept-note-late">
          <path d="M45 24V12" />
          <path d="M45 12c3 1 5 3 5 6" />
          <ellipse cx="42.6" cy="24" rx="2.8" ry="2.1" fill="currentColor" stroke="none" />
        </g>
      </svg>
    );
  }

  if (name === "communication") {
    return (
      <svg {...common}>
        {/* Mégaphone */}
        <path d="M10 26v12a2 2 0 0 0 2 2h6l18 10V14L18 24h-6a2 2 0 0 0-2 2z" />
        <path d="M18 40l3 12h6l-2-9" />
        {/* Ondes */}
        <path className="dept-wave" d="M43 25c3 3 3 11 0 14" />
        <path className="dept-wave dept-wave-2" d="M48 20c6 6 6 18 0 24" />
        <path className="dept-wave dept-wave-3" d="M53 15c9 9 9 25 0 34" />
      </svg>
    );
  }

  if (name === "finances") {
    return (
      <svg {...common}>
        {/* Tirelire */}
        <path d="M14 36c0-9 8-15 19-15 7 0 12 2 16 6l5-2-1 7c2 2 3 4 3 6l-4 1c-1 3-3 5-6 7v6h-6v-4c-2 .5-5 .5-7 0v4h-6v-6c-5-2-8-5-9-9l-4-1z" />
        <circle cx="45" cy="33" r="1.4" fill="currentColor" stroke="none" />
        <path d="M27 24h10" />
        {/* Pièce qui tombe dans la fente */}
        <g className="dept-coin">
          <circle cx="32" cy="10" r="5" />
          <path d="M32 7.5v5" />
        </g>
      </svg>
    );
  }

  if (name === "social") {
    return (
      <svg {...common}>
        {/* Mains ouvertes */}
        <path d="M6 44l8-4c3-1.5 6-1.5 9 0l6 3h7a3 3 0 0 1 0 6H26" />
        <path d="M36 49l12-6c2.5-1.2 5 1.5 3.4 3.8C48 52 42 56 33 56H20l-8 3" />
        {/* Cœur qui bat */}
        <path
          className="dept-heart"
          d="M32 33s-11-6.5-11-14a6 6 0 0 1 11-3.4A6 6 0 0 1 43 19c0 7.5-11 14-11 14z"
          fill="currentColor"
          fillOpacity="0.2"
        />
      </svg>
    );
  }

  return (
    <svg {...common}>
      {/* Porte d'accueil qui s'entrouvre */}
      <path d="M14 56V12a2 2 0 0 1 2-2h26a2 2 0 0 1 2 2v44" />
      <path d="M8 56h48" />
      <g className="dept-door">
        <path d="M14 10l20 5v41l-20 0z" fill="currentColor" fillOpacity="0.15" />
        <circle cx="29" cy="35" r="1.6" fill="currentColor" stroke="none" />
      </g>
      {/* Personne accueillie */}
      <g className="dept-guest">
        <circle cx="52" cy="28" r="3.5" />
        <path d="M52 32v12M52 36l-5 4M52 44l-3 8M52 44l3 8" />
      </g>
    </svg>
  );
}
