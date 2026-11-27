"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ANNONCE } from "../_data/annonce";

const START = new Date(ANNONCE.debut).getTime();
const END = new Date(ANNONCE.fin).getTime();

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { j: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

const pad = (n: number) => String(n).padStart(2, "0");

function Star() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className="h-2.5 w-2.5 shrink-0 text-ccr-gold">
      <path d="M6 0l1.4 4.6L12 6l-4.6 1.4L6 12 4.6 7.4 0 6l4.6-1.4z" fill="currentColor" />
    </svg>
  );
}

// Bandeau d'annonce : compte à rebours fixe à gauche, informations qui
// défilent en boucle à droite. Le décompte n'est calculé qu'une fois la page
// chargée dans le navigateur, pour toujours afficher l'heure exacte.
export function AnnouncementBar() {
  const [now, setNow] = useState<number | null>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    try {
      setClosed(sessionStorage.getItem("annonce-fermee") === ANNONCE.debut);
    } catch {
      // Stockage indisponible (navigation privée) : le bandeau reste affiché.
    }
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (closed || (now !== null && now >= END)) return null;
  const live = now !== null && now >= START;
  const left = now === null ? null : parts(START - now);

  const track = (
    <div className="flex shrink-0 items-center gap-6 pr-6">
      {ANNONCE.messages.map((m) => (
        <span key={m} className="flex items-center gap-6 whitespace-nowrap">
          <span>{m}</span>
          <Star />
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative z-[60] bg-[#0c1028] text-ccr-cream">
      <div className="flex items-stretch">
        <Link
          href={ANNONCE.lien}
          className="flex shrink-0 items-center gap-3 bg-gradient-to-r from-[#f25c2a] to-ccr-gold px-3 py-2 text-ccr-ink sm:px-4"
        >
          <span className="hidden text-[10px] font-bold uppercase leading-tight tracking-[0.18em] sm:block">
            31
            <br />
            déc.
          </span>
          {live ? (
            <span className="text-xs font-bold uppercase tracking-wide">C&rsquo;est maintenant !</span>
          ) : (
            <span className="flex items-baseline gap-1.5 font-display font-black [font-variant-numeric:lining-nums_tabular-nums]" aria-live="off">
              {(["j", "h", "m", "s"] as const).map((k) => (
                <span key={k} className={`flex items-baseline ${k === "s" ? "hidden sm:flex" : ""}`}>
                  <span className="text-base leading-none sm:text-lg">{left ? (k === "j" ? left.j : pad(left[k])) : "--"}</span>
                  <span className="ml-0.5 font-body text-[10px] font-bold uppercase">{k === "m" ? "min" : k}</span>
                </span>
              ))}
            </span>
          )}
        </Link>

        <Link
          href={ANNONCE.lien}
          aria-label={`${ANNONCE.titre} : ${ANNONCE.messages.join(", ")}`}
          className="group flex min-w-0 flex-1 items-center overflow-hidden text-xs font-medium sm:text-sm [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]"
        >
          <div className="flex w-max animate-ticker group-hover:[animation-play-state:paused]" aria-hidden="true">
            {track}
            {track}
          </div>
        </Link>

        <button
          type="button"
          onClick={() => {
            setClosed(true);
            try {
              sessionStorage.setItem("annonce-fermee", ANNONCE.debut);
            } catch {
              // Rien à faire : le bandeau est fermé pour cette page.
            }
          }}
          aria-label="Masquer l'annonce"
          className="shrink-0 px-3 text-ccr-cream/60 transition-colors hover:text-ccr-cream"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
