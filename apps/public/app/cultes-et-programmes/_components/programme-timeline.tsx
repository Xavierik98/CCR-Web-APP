"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "../../_components/icon";
import { ACCENTS, type ProgrammeItem } from "../../_data/programme";
import { buildWhatsAppLink } from "../../_data/whatsapp";

const GLOW: Record<ProgrammeItem["accent"], string> = {
  gold: "from-ccr-gold/40",
  magenta: "from-ccr-magenta/40",
  blue: "from-ccr-blue/40",
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
      { threshold: 0.35 },
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
  const featured = "featured" in item && item.featured;

  const slide = seen
    ? "translate-x-0 opacity-100"
    : reversed
      ? "md:translate-x-12 translate-y-6 md:translate-y-0 opacity-0"
      : "md:-translate-x-12 translate-y-6 md:translate-y-0 opacity-0";
  const slideOther = seen
    ? "translate-x-0 opacity-100"
    : reversed
      ? "md:-translate-x-12 translate-y-6 md:translate-y-0 opacity-0"
      : "md:translate-x-12 translate-y-6 md:translate-y-0 opacity-0";

  return (
    <li
      ref={ref}
      className="relative grid items-center gap-8 pl-12 md:grid-cols-2 md:gap-24 md:pl-0"
    >
      <span
        aria-hidden="true"
        className={`absolute left-4 top-6 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full transition-all duration-700 md:left-1/2 md:top-1/2 md:-translate-y-1/2 ${
          seen
            ? "bg-ccr-gold-light/20 shadow-[0_0_24px_6px_rgba(242,201,77,0.45)]"
            : "bg-ccr-cream/5"
        }`}
      >
        <span
          className={`h-2.5 w-2.5 rounded-full transition-colors duration-700 ${
            seen ? "bg-ccr-gold-light" : "bg-ccr-cream/30"
          }`}
        />
      </span>

      <div
        className={`transition-all duration-700 ease-out ${slide} ${
          reversed ? "md:order-2" : ""
        }`}
      >
        <p
          className={`text-xs font-semibold uppercase tracking-[0.2em] ${accent.text}`}
        >
          {item.horaire}
        </p>
        <h2 className="mt-2 bg-gradient-to-b from-ccr-cream via-ccr-cream to-ccr-cream/40 bg-clip-text font-display text-5xl font-black leading-tight text-transparent md:text-6xl">
          {item.jour}
        </h2>
        <ul className="mt-5 space-y-3 text-ccr-cream/85">
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ccr-gold-light" />
            <span className="text-lg font-semibold">{item.titre}</span>
          </li>
          {"description" in item ? (
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ccr-gold-light" />
              <span>{item.description}</span>
            </li>
          ) : null}
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ccr-gold-light" />
            <span>Salle de réunion CCR Casablanca</span>
          </li>
        </ul>
        <button
          type="button"
          onClick={onSelect}
          className="mt-6 text-sm font-semibold text-ccr-gold-light transition-colors hover:text-ccr-cream"
        >
          Nous écrire à ce sujet &rarr;
        </button>
      </div>

      <button
        type="button"
        onClick={onSelect}
        aria-label={`${item.titre}, ${item.jour}`}
        className={`group relative transition-all delay-150 duration-700 ease-out ${slideOther} ${
          reversed ? "md:order-1" : ""
        }`}
      >
        <div
          aria-hidden="true"
          className={`absolute -inset-6 rounded-[2rem] bg-gradient-to-br ${GLOW[item.accent]} to-transparent opacity-60 blur-2xl transition-opacity group-hover:opacity-100`}
        />
        <div className="animate-float relative">
        <div className="relative overflow-hidden rounded-3xl border border-ccr-cream/10 bg-ccr-cream/[0.04] p-8 text-left backdrop-blur-sm transition-transform duration-500 group-hover:-rotate-1 group-hover:scale-[1.02]">
          <div className="flex items-start justify-between">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${accent.bg} ${accent.text}`}
            >
              <Icon name={item.icon} className="h-7 w-7" />
            </div>
            {featured ? (
              <span className="rounded-full bg-ccr-gold px-3 py-1 text-xs font-semibold text-ccr-ink">
                Culte principal
              </span>
            ) : null}
          </div>
          <p className="mt-10 font-display text-5xl font-black text-ccr-cream [font-variant-numeric:lining-nums]">
            {item.horaire.split(" - ")[0]}
          </p>
          <p className="mt-1 text-sm text-ccr-cream/50">
            jusqu&rsquo;à {item.horaire.split(" - ")[1]}
          </p>
          <div className="mt-6 h-px w-full bg-gradient-to-r from-ccr-gold-light/60 via-ccr-cream/10 to-transparent" />
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-ccr-cream/70">
            {item.titre}
          </p>
        </div>
        </div>
      </button>
    </li>
  );
}

export function ProgrammeTimeline({
  items,
}: {
  items: readonly ProgrammeItem[];
}) {
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

  return (
    <>
      <div ref={containerRef} className="relative">
        <div
          aria-hidden="true"
          className="absolute left-4 top-0 h-full w-px -translate-x-1/2 bg-ccr-cream/10 md:left-1/2"
        />
        <div
          aria-hidden="true"
          className="absolute left-4 top-0 w-px -translate-x-1/2 bg-gradient-to-b from-ccr-gold-light via-ccr-gold to-ccr-gold-light shadow-[0_0_14px_2px_rgba(242,201,77,0.5)] md:left-1/2"
          style={{ height: `${progress * 100}%` }}
        />

        <ol className="space-y-28 md:space-y-40">
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

      {selected ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="programme-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ccr-ink/70 p-6 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md animate-fade-in-up rounded-2xl bg-white p-8 text-ccr-ink shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${ACCENTS[selected.accent].bg} ${ACCENTS[selected.accent].text}`}
            >
              <Icon name={selected.icon} className="h-6 w-6" />
            </div>
            <p
              className={`mt-4 text-xs font-semibold uppercase tracking-wide ${ACCENTS[selected.accent].text}`}
            >
              {selected.jour}
            </p>
            <h2
              id="programme-dialog-title"
              className="mt-1 font-display text-2xl font-bold"
            >
              {selected.titre}
            </h2>
            <p className="mt-1 text-sm font-semibold text-ccr-ink/60">
              {selected.horaire}
            </p>
            {"description" in selected ? (
              <p className="mt-3 text-sm text-ccr-ink/70">
                {selected.description}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappLink(selected) ?? "/contact"}
                target={whatsappLink(selected) ? "_blank" : undefined}
                rel={whatsappLink(selected) ? "noopener noreferrer" : undefined}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-ccr-ink transition-transform hover:scale-105"
              >
                <Icon name="chat" className="h-4 w-4" />
                Contacter sur WhatsApp
              </a>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full border border-ccr-ink/20 px-5 py-3 text-sm font-semibold transition-colors hover:border-ccr-ink"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
