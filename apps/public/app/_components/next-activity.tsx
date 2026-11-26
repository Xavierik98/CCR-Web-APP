"use client";

import { useEffect, useState } from "react";
import {
  getNextActivity,
  PROGRAMME,
  type ProgrammeItem,
} from "../_data/programme";

const JOURS_COURTS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MOIS_COURTS = [
  "Janv",
  "Févr",
  "Mars",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sept",
  "Oct",
  "Nov",
  "Déc",
];

// Calcule côté client (après montage, pour éviter tout décalage avec l'heure
// de génération de la page statique) la prochaine activité du programme
// hebdomadaire réel : la carte change donc seule, au fil des jours, sans
// qu'il faille modifier le code chaque semaine.
export function NextActivity() {
  const [next, setNext] = useState<{ item: ProgrammeItem; date: Date } | null>(
    null,
  );

  useEffect(() => {
    setNext(getNextActivity(PROGRAMME, new Date()));
  }, []);

  if (!next) return null;

  const { item, date } = next;

  return (
    <div className="mt-6 flex flex-col gap-4 overflow-hidden rounded-2xl border border-ccr-ink/10 bg-white transition-shadow hover:shadow-md sm:flex-row">
      <div className="flex shrink-0 flex-col items-center justify-center bg-ccr-gold/10 px-8 py-6 text-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-ccr-gold">
          {JOURS_COURTS[date.getDay()]}
        </span>
        <span className="font-display text-4xl font-black text-ccr-ink">
          {String(date.getDate()).padStart(2, "0")}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-ccr-ink/60">
          {MOIS_COURTS[date.getMonth()]} {date.getFullYear()}
        </span>
      </div>
      <div className="flex-1 px-6 py-6">
        <h3 className="font-display text-xl font-bold">{item.titre}</h3>
        <p className="mt-2 text-sm font-semibold text-ccr-ink/80">{item.horaire}</p>
        <p className="text-sm text-ccr-ink/60">Salle de réunion CCR Casablanca</p>
      </div>
    </div>
  );
}
