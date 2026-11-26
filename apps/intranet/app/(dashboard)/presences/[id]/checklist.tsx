"use client";

import { useState } from "react";

type Row = { id: string; name: string; present: boolean };

// Liste de pointage filtrable. Les cases masquées par le filtre restent dans
// le formulaire et sont donc bien envoyées à l'enregistrement.
export function Checklist({ groups }: { groups: { label: string; rows: Row[] }[] }) {
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState(
    () => new Set(groups.flatMap((g) => g.rows.filter((r) => r.present).map((r) => r.id))),
  );
  const q = query.trim().toLowerCase();

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-6 mb-4 flex flex-wrap items-center gap-3 border-b border-ccr-ink/10 bg-white px-6 py-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filtrer par nom"
          className="flex-1 rounded-lg border border-ccr-ink/15 px-3 py-2 text-sm outline-none focus:border-ccr-gold"
        />
        <span className="text-sm font-semibold">{checked.size} présent(s)</span>
      </div>
      {groups.map((group) => (
        <fieldset key={group.label} className="mb-6">
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-ccr-ink/50">
            {group.label} ({group.rows.filter((r) => checked.has(r.id)).length}/{group.rows.length})
          </legend>
          <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-3">
            {group.rows.map((row) => (
              <label
                key={row.id}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-ccr-gold/10 ${
                  q && !row.name.toLowerCase().includes(q) ? "hidden" : ""
                }`}
              >
                <input
                  type="checkbox"
                  name="present"
                  value={row.id}
                  checked={checked.has(row.id)}
                  onChange={(e) => {
                    const next = new Set(checked);
                    if (e.target.checked) next.add(row.id);
                    else next.delete(row.id);
                    setChecked(next);
                  }}
                  className="h-4 w-4 accent-ccr-gold"
                />
                {row.name}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
