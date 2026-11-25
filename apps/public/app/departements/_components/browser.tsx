"use client";

import { useMemo, useState } from "react";
import { Icon } from "../../_components/icon";
import type { Departement } from "../../_data/departements";

// Recherche + filtre par categorie, inspires de l'interface de
// servir.egliseicc.com (guide des ministeres). Filtrage cote client : la
// liste des departements est connue a la construction, pas besoin d'API.
const CATEGORIE_STYLE: Record<
  Departement["categorie"],
  { text: string; bg: string; border: string; icon: "heart" | "spark" }
> = {
  Ministere: {
    text: "text-ccr-magenta",
    bg: "bg-ccr-magenta/10",
    border: "border-t-ccr-magenta",
    icon: "heart",
  },
  "Formation et metier": {
    text: "text-ccr-blue",
    bg: "bg-ccr-blue/10",
    border: "border-t-ccr-blue",
    icon: "spark",
  },
};

export function DepartementsBrowser({
  departements,
}: {
  departements: Departement[];
}) {
  const [query, setQuery] = useState("");
  const [categorie, setCategorie] = useState<"Toutes" | Departement["categorie"]>(
    "Toutes",
  );

  const resultats = useMemo(() => {
    return departements.filter((d) => {
      const matchCategorie = categorie === "Toutes" || d.categorie === categorie;
      const matchQuery = d.nom.toLowerCase().includes(query.trim().toLowerCase());
      return matchCategorie && matchQuery;
    });
  }, [departements, query, categorie]);

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-2xl border border-ccr-ink/10 bg-white p-3 shadow-sm sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un departement"
          className="flex-1 rounded-lg border border-ccr-ink/15 px-3 py-2 text-sm outline-none focus:border-ccr-gold focus:ring-2 focus:ring-ccr-gold/30"
          aria-label="Rechercher un departement"
        />
        <select
          value={categorie}
          onChange={(event) =>
            setCategorie(event.target.value as typeof categorie)
          }
          className="rounded-lg border border-ccr-ink/15 px-3 py-2 text-sm outline-none focus:border-ccr-gold focus:ring-2 focus:ring-ccr-gold/30 sm:w-56"
          aria-label="Filtrer par categorie"
        >
          <option value="Toutes">Toutes les categories</option>
          <option value="Ministere">Ministere</option>
          <option value="Formation et metier">Formation et metier</option>
        </select>
      </div>

      {resultats.length === 0 ? (
        <p className="mt-10 text-sm text-ccr-ink/50">
          Aucun departement ne correspond a votre recherche.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resultats.map((pole) => {
            const style = CATEGORIE_STYLE[pole.categorie];
            return (
              <article
                key={pole.nom}
                className={`rounded-2xl border border-t-4 border-ccr-ink/10 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md ${style.border}`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${style.bg} ${style.text}`}
                >
                  <Icon name={style.icon} className="h-5 w-5" />
                </div>
                <span
                  className={`mt-3 inline-block rounded-full ${style.bg} ${style.text} px-3 py-1 text-xs font-semibold uppercase tracking-wide`}
                >
                  {pole.categorie}
                </span>
                <h2 className="mt-3 font-display text-xl font-bold">{pole.nom}</h2>
                <p className="mt-2 text-sm text-ccr-ink/70">{pole.description}</p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
