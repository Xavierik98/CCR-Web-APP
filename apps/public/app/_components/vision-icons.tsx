// Icônes au trait des trois piliers. Chaque tracé porte pathLength=1 et la
// classe draw-path : il se dessine quand la section devient visible
// (voir globals.css et Reveal).
const common = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  pathLength: 1,
  className: "draw-path",
};

function Rassembler() {
  return (
    <>
      <circle cx="48" cy="26" r="9" {...common} />
      <path d="M32 62c0-10 7-17 16-17s16 7 16 17" {...common} />
      <circle cx="22" cy="36" r="7" {...common} />
      <path d="M9 66c0-8 6-14 13-14 3 0 6 1 8 3" {...common} />
      <circle cx="74" cy="36" r="7" {...common} />
      <path d="M87 66c0-8-6-14-13-14-3 0-6 1-8 3" {...common} />
      <path d="M14 76c10 8 22 12 34 12s24-4 34-12" {...common} />
    </>
  );
}

function Former() {
  return (
    <>
      <rect x="10" y="64" width="16" height="22" rx="3" {...common} />
      <rect x="32" y="50" width="16" height="36" rx="3" {...common} />
      <rect x="54" y="34" width="16" height="52" rx="3" {...common} />
      <rect x="76" y="18" width="12" height="68" rx="3" {...common} />
      <circle cx="40" cy="20" r="5" {...common} />
      <path d="M40 25v12l-6 9M40 37l7 7M33 31h13" {...common} />
    </>
  );
}

function Envoyer() {
  return (
    <>
      <path d="M86 12 10 44l28 10 10 28 38-70Z" {...common} />
      <path d="M86 12 38 54" {...common} />
      <path d="M48 82l6-18" {...common} />
      <path d="M8 70c6-4 12-4 18 0M4 84c8-5 16-5 24 0" {...common} />
    </>
  );
}

const ICONS = { Rassembler, Former, Envoyer };

export function VisionIcon({ name, className }: { name: keyof typeof ICONS; className?: string }) {
  const Svg = ICONS[name];
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true" className={className}>
      <Svg />
    </svg>
  );
}
