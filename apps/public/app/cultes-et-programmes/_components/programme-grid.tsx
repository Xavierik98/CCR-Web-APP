"use client";

import { useEffect, useState } from "react";
import { Icon } from "../../_components/icon";
import { Reveal } from "../../_components/reveal";
import { ACCENTS, type ProgrammeItem } from "../../_data/programme";
import { buildWhatsAppLink } from "../../_data/whatsapp";

function whatsappLink(item: ProgrammeItem) {
  const message = `Bonjour, je suis intéressé(e) par "${item.titre}" (${item.jour}, ${item.horaire}). Pouvez-vous m'en dire plus ?`;
  return buildWhatsAppLink(message);
}

export function ProgrammeGrid({ items }: { items: readonly ProgrammeItem[] }) {
  const [selected, setSelected] = useState<ProgrammeItem | null>(null);

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
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const accent = ACCENTS[item.accent];
          const featured = "featured" in item && item.featured;
          return (
            <Reveal key={item.titre} delay={index * 90}>
              <button
                type="button"
                onClick={() => setSelected(item)}
                className={`h-full w-full rounded-2xl border border-ccr-ink/10 p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg ${
                  featured ? "bg-ccr-ink text-ccr-cream" : "bg-white"
                } ${"span" in item && item.span ? "sm:col-span-2" : ""}`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    featured
                      ? "bg-ccr-cream/10 text-ccr-gold-light"
                      : `${accent.bg} ${accent.text}`
                  }`}
                >
                  <Icon name={item.icon} className="h-5 w-5" />
                </div>

                <p
                  className={`mt-4 text-xs font-semibold uppercase tracking-wide ${
                    featured ? "text-ccr-gold-light" : accent.text
                  }`}
                >
                  {item.jour}
                </p>
                <h2 className="mt-1 font-display text-xl font-bold">{item.titre}</h2>
                <p
                  className={`mt-1 text-sm font-semibold ${
                    featured ? "text-ccr-cream/80" : "text-ccr-ink/60"
                  }`}
                >
                  {item.horaire}
                </p>
                {"description" in item ? (
                  <p
                    className={`mt-3 text-sm ${
                      featured ? "text-ccr-cream/70" : "text-ccr-ink/60"
                    }`}
                  >
                    {item.description}
                  </p>
                ) : null}
              </button>
            </Reveal>
          );
        })}
      </div>

      {selected ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="programme-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ccr-ink/60 p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md animate-fade-in-up rounded-2xl bg-white p-8 shadow-2xl"
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
            <h2 id="programme-dialog-title" className="mt-1 font-display text-2xl font-bold">
              {selected.titre}
            </h2>
            <p className="mt-1 text-sm font-semibold text-ccr-ink/60">
              {selected.horaire}
            </p>
            {"description" in selected ? (
              <p className="mt-3 text-sm text-ccr-ink/70">{selected.description}</p>
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
