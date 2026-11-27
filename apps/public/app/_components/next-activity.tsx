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
    <div className="mt-6 flex overflow-hidden rounded-3xl border border-ccr-ink/10 bg-white shadow-[0_10px_30px_-18px_rgba(32,28,22,0.35)] transition-shadow hover:shadow-md">
      <div className="flex w-24 shrink-0 flex-col items-center justify-center bg-ccr-gold/10 px-3 py-5 text-center sm:w-auto sm:px-8 sm:py-6">
        <span className="text-xs font-semibold uppercase tracking-wide text-ccr-gold">
          {JOURS_COURTS[date.getDay()]}
        </span>
        <span className="font-display text-3xl font-black text-ccr-ink [font-variant-numeric:lining-nums] sm:text-4xl">
          {String(date.getDate()).padStart(2, "0")}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-ccr-ink/60">
          {MOIS_COURTS[date.getMonth()]} {date.getFullYear()}
        </span>
      </div>
      <div className="min-w-0 flex-1 px-5 py-5 sm:px-6 sm:py-6">
        <h3 className="font-display text-lg font-bold sm:text-xl">{item.titre}</h3>
        <p className="mt-2 text-sm font-semibold text-ccr-ink/80">{item.horaire}</p>
        <p className="text-sm text-ccr-ink/60">Salle de réunion CCR Casablanca</p>
      </div>
    </div>
  );
}
