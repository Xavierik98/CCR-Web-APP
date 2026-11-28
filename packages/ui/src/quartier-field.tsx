"use client";

import { useState } from "react";
import { AUTRE_QUARTIER, QUARTIERS_CASABLANCA } from "./quartiers";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");

// Liste des quartiers de Casablanca ; « Autre quartier » ouvre un champ libre.
// Le formulaire reçoit toujours un seul champ (name), avec le quartier choisi ou écrit.
export function QuartierField({
  name = "neighborhood",
  defaultValue,
  className = "",
}: {
  name?: string;
  defaultValue?: string | null;
  className?: string;
}) {
  const known = defaultValue ? QUARTIERS_CASABLANCA.find((q) => norm(q) === norm(defaultValue)) : undefined;
  const [choice, setChoice] = useState<string>(known ?? (defaultValue ? AUTRE_QUARTIER : ""));
  const [other, setOther] = useState(known ? "" : defaultValue ?? "");
  return (
    <>
      <input type="hidden" name={name} value={choice === AUTRE_QUARTIER ? other.trim() : choice} />
      <select value={choice} onChange={(e) => setChoice(e.target.value)} className={className}>
        <option value="">Choisir un quartier…</option>
        {QUARTIERS_CASABLANCA.map((q) => (
          <option key={q} value={q}>
            {q}
          </option>
        ))}
        <option value={AUTRE_QUARTIER}>{AUTRE_QUARTIER}…</option>
      </select>
      {choice === AUTRE_QUARTIER ? (
        <input value={other} onChange={(e) => setOther(e.target.value)} placeholder="Nom du quartier" maxLength={60} className={`${className} mt-2`} />
      ) : null}
    </>
  );
}
