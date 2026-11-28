"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { setAttendance } from "../actions";

type Category = "MAN" | "WOMAN" | "CHILD" | "UNKNOWN";
type Row = { id: string; lastName: string; firstName: string; present: boolean; category: Category };

const GROUPS: { key: Category; label: string; text: string; bar: string; ring: string }[] = [
  { key: "WOMAN", label: "Femmes", text: "text-ccr-magenta", bar: "bg-ccr-magenta", ring: "border-ccr-magenta/25" },
  { key: "MAN", label: "Hommes", text: "text-ccr-blue", bar: "bg-ccr-blue", ring: "border-ccr-blue/25" },
  { key: "CHILD", label: "Enfants", text: "text-[#b07a12]", bar: "bg-ccr-gold", ring: "border-ccr-gold/40" },
  { key: "UNKNOWN", label: "Autres (catégorie à compléter)", text: "text-ccr-ink/70", bar: "bg-ccr-ink/40", ring: "border-ccr-ink/15" },
];

// Pointage en direct : chaque case cochée ou décochée met à jour les totaux
// et est enregistrée aussitôt en base. Les personnes sont rangées par bloc
// (femmes, hommes, enfants, autres), nom puis prénom.
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
  const router = useRouter();
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
        router.refresh();
      } catch {
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
    ...(counts.UNKNOWN ? [`Autres : ${counts.UNKNOWN}`] : []),
  ].join("\n");

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-ccr-ink p-5 text-ccr-cream">
          <p className="text-sm text-ccr-cream/70">Total des présents</p>
          <p className="mt-1 font-display text-4xl font-black [font-variant-numeric:lining-nums]">{counts.total}</p>
        </div>
        {GROUPS.slice(0, 3).map((g) => (
          <div key={g.key} className={`rounded-2xl border bg-white p-5 ${g.ring}`}>
            <p className="text-sm text-ccr-ink/60">{g.label}</p>
            <p className={`mt-1 font-display text-4xl font-black [font-variant-numeric:lining-nums] ${g.text}`}>{counts[g.key]}</p>
          </div>
        ))}
      </div>

      <div className="sticky top-0 z-10 mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-ccr-ink/10 bg-white/95 px-4 py-3 backdrop-blur">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un nom ou un prénom"
          className="min-w-[200px] flex-1 rounded-lg border border-ccr-ink/15 px-3 py-2 text-sm outline-none focus:border-ccr-gold"
        />
        <span className="text-sm font-semibold">{counts.total} présent(s)</span>
        <span className={`text-xs ${status === "error" ? "text-red-600" : "text-ccr-ink/50"}`} aria-live="polite">
          {!editable
            ? "Consultation seule"
            : pending
              ? "Enregistrement…"
              : status === "saved"
                ? "Enregistré"
                : status === "error"
                  ? "Échec de l'enregistrement, réessayez"
                  : ""}
        </span>
      </div>

      <div className="space-y-5">
        {GROUPS.map((g) => {
          const list = rows.filter((r) => r.category === g.key);
          if (!list.length) return null;
          const visible = list.filter((r) => !q || `${r.lastName} ${r.firstName}`.toLowerCase().includes(q));
          return (
            <section key={g.key} className={`overflow-hidden rounded-2xl border bg-white ${g.ring}`}>
              <header className="flex items-center justify-between gap-3 border-b border-ccr-ink/5 px-5 py-3">
                <h2 className={`flex items-center gap-2 font-display text-lg font-bold ${g.text}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${g.bar}`} />
                  {g.label}
                </h2>
                <span className="text-sm text-ccr-ink/60">
                  <span className={`font-bold ${g.text}`}>{counts[g.key]}</span> présent(s) sur {list.length}
                </span>
              </header>
              <fieldset disabled={!editable} className="grid gap-x-4 gap-y-0.5 p-4 sm:grid-cols-2 xl:grid-cols-3">
                {visible.length === 0 ? <p className="px-2 text-sm text-ccr-ink/50">Aucun résultat.</p> : null}
                {visible.map((row) => (
                  <label
                    key={row.id}
                    className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm ${
                      editable ? "cursor-pointer hover:bg-ccr-cream" : ""
                    } ${checked.has(row.id) ? "bg-ccr-gold/10" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked.has(row.id)}
                      onChange={(e) => toggle(row.id, e.target.checked)}
                      className="h-4 w-4 shrink-0 accent-ccr-gold"
                    />
                    <span className="min-w-0 truncate">
                      {row.lastName ? (
                        <>
                          <span className="font-semibold uppercase tracking-wide">{row.lastName}</span>{" "}
                          <span className="text-ccr-ink/80">{row.firstName}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">{row.firstName}</span>{" "}
                          <span className="text-xs text-ccr-ink/40">nom à compléter</span>
                        </>
                      )}
                    </span>
                  </label>
                ))}
              </fieldset>
            </section>
          );
        })}
      </div>

      <section className="mt-8 rounded-2xl border border-ccr-ink/10 bg-white p-6">
        <h2 className="font-display text-xl font-bold">Rapport du culte</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <table className="w-full max-w-md text-sm">
            <tbody className="divide-y divide-ccr-ink/5">
              {GROUPS.map((g) =>
                g.key === "UNKNOWN" && !counts.UNKNOWN ? null : (
                  <tr key={g.key}>
                    <td className="py-2">{g.key === "UNKNOWN" ? "Autres" : g.label}</td>
                    <td className={`py-2 text-right font-semibold ${g.text}`}>{counts[g.key]}</td>
                  </tr>
                ),
              )}
              <tr className="border-t-2 border-ccr-ink/20">
                <td className="py-2 font-bold">Total</td>
                <td className="py-2 text-right font-display text-2xl font-black">{counts.total}</td>
              </tr>
            </tbody>
          </table>
          <div className="flex flex-wrap gap-3">
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
              className="rounded-full border border-ccr-ink/20 px-5 py-2 text-sm font-semibold hover:border-ccr-ink"
            >
              {copied ? "Rapport copié" : "Copier pour WhatsApp"}
            </button>
            <a href={`/presences/${eventId}/export`} className="rounded-full border border-ccr-ink/20 px-5 py-2 text-sm font-semibold hover:border-ccr-ink">
              Exporter en Excel
            </a>
            <a href={`/presences/${eventId}/rapport`} className="rounded-full bg-ccr-gold px-5 py-2 text-sm font-semibold text-ccr-ink hover:bg-ccr-gold-light">
              Générer le rapport (PDF)
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
