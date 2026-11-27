"use client";

import { useMemo, useState } from "react";
import { Reveal } from "../../_components/reveal";
import { DepartmentIcon } from "./department-icon";
import type { Departement } from "../../_data/departements";
import { buildWhatsAppLink } from "../../_data/whatsapp";

function joinLink(nom: string) {
  const message = `Bonjour, je souhaite rejoindre le département "${nom}". Pouvez-vous me recontacter ?`;
  return (
    buildWhatsAppLink(message) ??
    `/mon-eglise-a-un-besoin?departement=${encodeURIComponent(nom)}`
  );
}

// Teintes de chaque ministère (fond du visuel, halo animé, pictogramme).
const COULEURS: Record<Departement["couleur"], { panel: string; blob: string; icon: string; chip: string; link: string; bar: string }> = {
  gold: { panel: "bg-gradient-to-br from-[#fff4dc] to-[#fde7b8]", blob: "bg-ccr-gold/35", icon: "text-[#9a6a0c]", chip: "bg-ccr-gold/15 text-[#9a6a0c]", link: "text-[#9a6a0c]", bar: "bg-ccr-gold" },
  blue: { panel: "bg-gradient-to-br from-[#e6effb] to-[#cfe0f6]", blob: "bg-ccr-blue/25", icon: "text-ccr-blue", chip: "bg-ccr-blue/10 text-ccr-blue", link: "text-ccr-blue", bar: "bg-ccr-blue" },
  green: { panel: "bg-gradient-to-br from-[#e5f5ec] to-[#c9ead6]", blob: "bg-emerald-500/25", icon: "text-emerald-700", chip: "bg-emerald-500/10 text-emerald-700", link: "text-emerald-700", bar: "bg-emerald-500" },
  magenta: { panel: "bg-gradient-to-br from-[#fce7f0] to-[#f8cfe0]", blob: "bg-ccr-magenta/25", icon: "text-ccr-magenta", chip: "bg-ccr-magenta/10 text-ccr-magenta", link: "text-ccr-magenta", bar: "bg-ccr-magenta" },
  violet: { panel: "bg-gradient-to-br from-[#efe9fb] to-[#ddd1f5]", blob: "bg-violet-500/25", icon: "text-violet-700", chip: "bg-violet-500/10 text-violet-700", link: "text-violet-700", bar: "bg-violet-500" },
};

export function DepartementsBrowser({
  departements,
}: {
  departements: Departement[];
}) {
  const [query, setQuery] = useState("");
  // Une seule catégorie (Ministère) pour l'instant : seul le nom est filtré.
  const categorie: "Toutes" | Departement["categorie"] = "Toutes";

  const resultats = useMemo(() => {
    return departements.filter((d) => {
      const matchCategorie = categorie === "Toutes" || d.categorie === categorie;
      const matchQuery = d.nom.toLowerCase().includes(query.trim().toLowerCase());
      return matchCategorie && matchQuery;
    });
  }, [departements, query, categorie]);

  return (
    <div>
      <div className="flex rounded-2xl border border-ccr-ink/10 bg-white p-2 shadow-sm">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un département"
          className="flex-1 rounded-xl border-0 bg-ccr-ink/[0.04] px-4 py-3 text-[15px] outline-none focus:border-ccr-gold focus:ring-2 focus:ring-ccr-gold/30"
          aria-label="Rechercher un département"
        />
      </div>

      {resultats.length === 0 ? (
        <p className="mt-10 text-sm text-ccr-ink/50">
          Aucun département ne correspond à votre recherche.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resultats.map((pole, i) => {
            const c = COULEURS[pole.couleur];
            const href = joinLink(pole.nom);
            const external = href.startsWith("http");
            return (
              <Reveal key={pole.nom} delay={i * 120} className="h-full">
                <a
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  aria-label={`Rejoindre le département ${pole.nom}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-ccr-ink/10 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_50px_-24px_rgba(32,28,22,0.45)]"
                >
                  <div className={`relative flex h-44 items-center justify-center overflow-hidden ${c.panel}`}>
                    <span aria-hidden="true" className={`animate-blob absolute h-36 w-36 ${c.blob} opacity-80`} style={{ animationDelay: `${-i * 1.7}s` }} />
                    <span aria-hidden="true" className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/30 blur-xl" />
                    <DepartmentIcon
                      name={pole.icone}
                      className={`relative h-24 w-24 ${c.icon} transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110`}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] ${c.chip}`}>
                      {pole.categorie}
                    </span>
                    <h2 className="mt-3 font-display text-xl font-bold">{pole.nom}</h2>
                    <p className="mt-2 flex-1 text-sm text-ccr-ink/70">{pole.description}</p>
                    <span className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold ${c.link}`}>
                      Rejoindre ce département
                      <span className="transition-transform duration-300 group-hover:translate-x-1.5">&rarr;</span>
                    </span>
                  </div>
                  <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 ${c.bar}`} />
                </a>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
