"use client";

import { useMemo, useState, useTransition } from "react";
import { setAttendance } from "../actions";

type Category = "MAN" | "WOMAN" | "CHILD" | "UNKNOWN";
type Row = { id: string; name: string; present: boolean; category: Category };

const GROUPS: { key: Category; label: string; tone: string }[] = [
  { key: "MAN", label: "Hommes", tone: "text-ccr-blue" },
  { key: "WOMAN", label: "Femmes", tone: "text-ccr-magenta" },
  { key: "CHILD", label: "Enfants", tone: "text-[#b07a12]" },
  { key: "UNKNOWN", label: "Catégorie à compléter", tone: "text-ccr-ink/60" },
];

// Pointage en direct : chaque case cochée ou décochée met à jour les totaux
// (hommes, femmes, enfants, total) et est enregistrée aussitôt en base.
export function Checklist({
  eventId,
  eventLabel,
  rows,
  editable,
}: {
  eventId: string;
  eventLabel: string;
  rows: Row[];
  editable: boolean;
}) {
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState(() => new Set(rows.filter((r) => r.present).map((r) => r.id)));
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const q = query.trim().toLowerCase();

  const counts = useMemo(() => {
    const c = { MAN: 0, WOMAN: 0, CHILD: 0, UNKNOWN: 0, total: 0 };
    for (const r of rows) {
      if (checked.has(r.id)) {
        c[r.category] += 1;
        c.total += 1;
      }
    }
    return c;
  }, [rows, checked]);

  function toggle(id: string, present: boolean) {
    const next = new Set(checked);
    if (present) next.add(id);
    else next.delete(id);
    setChecked(next);
    startTransition(async () => {
      try {
        await setAttendance(eventId, id, present);
        setStatus("saved");
      } catch {
        // Retour à l'état précédent si l'enregistrement échoue.
        setChecked((cur) => {
          const back = new Set(cur);
          if (present) back.delete(id);
          else back.add(id);
          return back;
        });
        setStatus("error");
      }
    });
  }

  const report = [
    `Rapport de présence - ${eventLabel}`,
    `Total : ${counts.total} présents`,
    `Hommes : ${counts.MAN}`,
    `Femmes : ${counts.WOMAN}`,
    `Enfants : ${counts.CHILD}`,
    ...(counts.UNKNOWN ? [`Catégorie à compléter : ${counts.UNKNOWN}`] : []),
  ].join("\n");

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-ccr-ink p-5 text-ccr-cream">
          <p className="text-sm text-ccr-cream/70">Total des présents</p>
          <p className="mt-1 font-display text-4xl font-black [font-variant-numeric:lining-nums]">{counts.total}</p>
        </div>
        {GROUPS.slice(0, 3).map((g) => (
          <div key={g.key} className="rounded-2xl border border-ccr-ink/[0.06] bg-white p-5">
            <p className="text-sm text-ccr-ink/60">{g.label}</p>
            <p className={`mt-1 font-display text-4xl font-black [font-variant-numeric:lining-nums] ${g.tone}`}>{counts[g.key]}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-ccr-ink/[0.06] bg-white p-6">
        <div className="sticky top-0 z-10 -mx-6 -mt-6 mb-4 flex flex-wrap items-center gap-3 rounded-t-2xl border-b border-ccr-ink/10 bg-white px-6 py-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un nom"
            className="min-w-[180px] flex-1 rounded-lg border border-ccr-ink/15 px-3 py-2 text-sm outline-none focus:border-ccr-gold"
          />
          <span className="text-sm font-semibold">{counts.total} présent(s)</span>
          {editable ? (
            <span className={`text-xs ${status === "error" ? "text-red-600" : "text-ccr-ink/50"}`} aria-live="polite">
              {pending ? "Enregistrement…" : status === "saved" ? "Enregistré" : status === "error" ? "Échec de l'enregistrement, réessayez" : ""}
            </span>
          ) : (
            <span className="text-xs text-ccr-ink/50">Consultation seule</span>
          )}
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(report);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch {
                setCopied(false);
              }
            }}
            className="rounded-full border border-ccr-ink/20 px-4 py-1.5 text-xs font-semibold hover:border-ccr-ink"
          >
            {copied ? "Rapport copié" : "Copier le rapport"}
          </button>
        </div>

        {GROUPS.map((g) => {
          const list = rows.filter((r) => r.category === g.key);
          if (!list.length) return null;
          return (
            <fieldset key={g.key} className="mb-6" disabled={!editable}>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-ccr-ink/50">
                {g.label} ({counts[g.key]}/{list.length})
              </legend>
              <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((row) => (
                  <label
                    key={row.id}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
                      editable ? "cursor-pointer hover:bg-ccr-gold/10" : ""
                    } ${checked.has(row.id) ? "font-semibold" : ""} ${q && !row.name.toLowerCase().includes(q) ? "hidden" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked.has(row.id)}
                      onChange={(e) => toggle(row.id, e.target.checked)}
                      className="h-4 w-4 accent-ccr-gold"
                    />
                    {row.name}
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}

        <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-ccr-cream p-4 font-sans text-sm text-ccr-ink/80">{report}</pre>
      </div>
    </div>
  );
}
