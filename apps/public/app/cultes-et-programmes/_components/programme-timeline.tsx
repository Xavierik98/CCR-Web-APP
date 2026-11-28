"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Icon } from "../../_components/icon";
import { ACCENTS, type ProgrammeItem } from "../../_data/programme";
import { buildWhatsAppLink } from "../../_data/whatsapp";
import { AnalogClock } from "./analog-clock";

// Une palette par couleur de rendez-vous, reprise partout (carte, horloge,
// fenêtre "nous écrire", bouton) pour une suite de couleurs cohérente.
const THEME: Record<
  ProgrammeItem["accent"],
  { hex: string; glow: string; overlay: string; button: string; ring: string }
> = {
  gold: {
    hex: "#F2C94D",
    glow: "from-ccr-gold/45",
    overlay: "from-[#13100c] via-[#13100c]/40 to-ccr-gold/20",
    button: "bg-ccr-gold text-ccr-ink hover:bg-ccr-gold-light",
    ring: "ring-ccr-gold/40",
  },
  magenta: {
    hex: "#DA2979",
    glow: "from-ccr-magenta/45",
    overlay: "from-[#13100c] via-[#13100c]/40 to-ccr-magenta/25",
    button: "bg-ccr-magenta text-ccr-cream hover:brightness-110",
    ring: "ring-ccr-magenta/40",
  },
  blue: {
    hex: "#6f9fe0",
    glow: "from-ccr-blue/50",
    overlay: "from-[#13100c] via-[#13100c]/40 to-ccr-blue/25",
    button: "bg-ccr-blue text-ccr-cream hover:brightness-110",
    ring: "ring-ccr-blue/40",
  },
};

function whatsappLink(item: ProgrammeItem) {
  const message = `Bonjour, je suis intéressé(e) par "${item.titre}" (${item.jour}, ${item.horaire}). Pouvez-vous m'en dire plus ?`;
  return buildWhatsAppLink(message);
}

// S'allume quand la ligne entre dans l'écran, et le reste ensuite.
function useSeen<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSeen(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, seen };
}

function TimelineRow({
  item,
  reversed,
  onSelect,
}: {
  item: ProgrammeItem;
  reversed: boolean;
  onSelect: () => void;
}) {
  const { ref, seen } = useSeen<HTMLLIElement>();
  const accent = ACCENTS[item.accent];
  const theme = THEME[item.accent];
  const featured = "featured" in item && item.featured;
  const [debut, fin] = item.horaire.split(" - ");

  const hidden = (fromRight: boolean) =>
    `opacity-0 ${fromRight ? "translate-x-6 md:translate-x-12" : "-translate-x-6 md:-translate-x-12"}`;
  const slide = seen ? "translate-x-0 opacity-100" : hidden(reversed);
  const slideOther = seen ? "translate-x-0 opacity-100" : hidden(!reversed);

  return (
    <li
      ref={ref}
      className="relative grid grid-cols-2 items-center gap-7 md:gap-24"
    >
      <span
        aria-hidden="true"
        className={`absolute left-1/2 top-1/2 flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-700 md:h-5 md:w-5 ${
          seen ? "bg-ccr-gold-light/20 shadow-[0_0_24px_6px_rgba(242,201,77,0.45)]" : "bg-ccr-cream/5"
        }`}
      >
        <span
          className={`h-2.5 w-2.5 rounded-full transition-colors duration-700 ${
            seen ? "bg-ccr-gold-light" : "bg-ccr-cream/30"
          }`}
        />
      </span>

      <div className={`transition-all duration-700 ease-out ${slide} ${reversed ? "order-2" : ""}`}>
        <p className={`text-[10px] font-semibold uppercase tracking-[0.12em] md:text-xs md:tracking-[0.2em] ${accent.text}`}>
          {item.horaire}
        </p>
        <h2 className="mt-1 bg-gradient-to-b from-ccr-cream via-ccr-cream to-ccr-cream/40 bg-clip-text font-display text-2xl font-black leading-tight text-transparent md:mt-2 md:text-6xl">
          {item.jour}
        </h2>
        <ul className="mt-2 space-y-1.5 text-ccr-cream/85 md:mt-5 md:space-y-3">
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: theme.hex }} />
            <span className="text-[13px] font-semibold leading-snug md:text-lg">{item.titre}</span>
          </li>
          {"description" in item ? (
            <li className="hidden gap-3 md:flex">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: theme.hex }} />
              <span>{item.description}</span>
            </li>
          ) : null}
          <li className="hidden gap-3 md:flex">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: theme.hex }} />
            <span>Salle de réunion CCR Casablanca</span>
          </li>
        </ul>
        <button
          type="button"
          onClick={onSelect}
          className="mt-2 text-xs font-semibold transition-opacity hover:opacity-80 md:mt-6 md:text-sm"
          style={{ color: theme.hex }}
        >
          <span className="md:hidden">Nous écrire &rarr;</span>
          <span className="hidden md:inline">Nous écrire à ce sujet &rarr;</span>
        </button>
      </div>

      <button
        type="button"
        onClick={onSelect}
        aria-label={`${item.titre}, ${item.jour}`}
        className={`group relative text-left transition-all delay-150 duration-700 ease-out ${slideOther} ${
          reversed ? "order-1" : ""
        }`}
      >
        <div
          aria-hidden="true"
          className={`absolute -inset-3 rounded-[2rem] bg-gradient-to-br md:-inset-6 ${theme.glow} to-transparent opacity-60 blur-2xl transition-opacity group-hover:opacity-100`}
        />
        <div className="animate-float relative">
          <div className={`relative overflow-hidden rounded-2xl bg-[#1b1712] ring-1 md:rounded-3xl ${theme.ring} transition-transform duration-500 group-hover:-rotate-1 group-hover:scale-[1.02]`}>
            <div className="relative aspect-[16/10]">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="(min-width: 768px) 520px, 100vw"
                className="object-cover transition-transform duration-[1.5s] group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${theme.overlay}`} />
              {featured ? (
                <span className="absolute right-2 top-2 rounded-full bg-ccr-gold px-2 py-0.5 text-[9px] font-semibold text-ccr-ink md:right-4 md:top-4 md:px-3 md:py-1 md:text-xs">
                  Culte principal
                </span>
              ) : null}
              <div className={`absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg md:left-4 md:top-4 md:h-10 md:w-10 md:rounded-xl ${accent.bg} ${accent.text} backdrop-blur`}>
                <Icon name={item.icon} className="h-4 w-4 md:h-5 md:w-5" />
              </div>
            </div>
            <div className="relative flex items-end gap-2 px-2.5 pb-3 md:gap-5 md:px-6 md:pb-6">
              <AnalogClock
                time={debut}
                ready={seen}
                accent={theme.hex}
                className="-mt-6 h-11 w-11 shrink-0 drop-shadow-xl md:-mt-12 md:h-24 md:w-24"
              />
              <div className="pb-1">
                <p className="font-display text-xl font-black text-ccr-cream [font-variant-numeric:lining-nums] md:text-4xl">
                  {debut}
                </p>
                <p className="text-[10px] text-ccr-cream/50 md:text-sm">jusqu&rsquo;à {fin}</p>
              </div>
            </div>
            <div className="mx-6 hidden h-px bg-gradient-to-r from-transparent via-ccr-cream/15 to-transparent md:block" />
            <p className="hidden px-6 py-4 text-sm font-semibold uppercase tracking-wide text-ccr-cream/70 md:block">
              {item.titre}
            </p>
          </div>
        </div>
      </button>
    </li>
  );
}

export function ProgrammeTimeline({ items }: { items: readonly ProgrammeItem[] }) {
  const [selected, setSelected] = useState<ProgrammeItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  // La ligne dorée se remplit au fil du défilement.
  useEffect(() => {
    const onScroll = () => {
      const node = containerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const passed = window.innerHeight * 0.55 - rect.top;
      setProgress(Math.min(1, Math.max(0, passed / rect.height)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  const theme = selected ? THEME[selected.accent] : null;
  const link = selected ? whatsappLink(selected) : null;

  return (
    <>
      <div ref={containerRef} className="relative">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-ccr-cream/10"
        />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-gradient-to-b from-ccr-gold-light via-ccr-gold to-ccr-gold-light shadow-[0_0_14px_2px_rgba(242,201,77,0.5)]"
          style={{ height: `${progress * 100}%` }}
        />

        <ol className="space-y-10 md:space-y-40">
          {items.map((item, index) => (
            <TimelineRow
              key={item.titre}
              item={item}
              reversed={index % 2 === 1}
              onSelect={() => setSelected(item)}
            />
          ))}
        </ol>
      </div>

      {selected && theme ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="programme-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#13100c]/80 p-6 backdrop-blur-md"
          onClick={() => setSelected(null)}
        >
          <div
            className={`relative w-full max-w-md animate-fade-in-up overflow-hidden rounded-3xl bg-[#1b1712] text-ccr-cream shadow-2xl ring-1 ${theme.ring}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative aspect-[16/8]">
              <Image src={selected.image} alt="" fill sizes="448px" className="object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-t ${theme.overlay}`} />
            </div>
            <div className="relative px-8 pb-8">
              <div className="-mt-12 flex items-end gap-4">
                <AnalogClock
                  time={selected.horaire.split(" - ")[0]}
                  ready
                  accent={theme.hex}
                  className="h-24 w-24 shrink-0 drop-shadow-xl"
                />
                <div className="pb-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: theme.hex }}>
                    {selected.jour}
                  </p>
                  <p className="text-sm font-semibold text-ccr-cream/70">{selected.horaire}</p>
                </div>
              </div>
              <h2 id="programme-dialog-title" className="mt-5 font-display text-3xl font-black">
                {selected.titre}
              </h2>
              {"description" in selected ? (
                <p className="mt-3 text-sm text-ccr-cream/70">{selected.description}</p>
              ) : null}
              <p className="mt-3 text-sm text-ccr-cream/60">
                Écrivez-nous, un responsable vous répondra pour vous accueillir.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={link ?? "/contact"}
                  target={link ? "_blank" : undefined}
                  rel={link ? "noopener noreferrer" : undefined}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all hover:scale-105 ${theme.button}`}
                >
                  <Icon name="whatsapp" className="h-4 w-4" />
                  Nous écrire sur WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-full border border-ccr-cream/20 px-5 py-3 text-sm font-semibold transition-colors hover:border-ccr-cream/60"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
