import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAccess } from "@/lib/auth";
import { loadAttendanceReport } from "@/lib/attendance-report";
import { formatDate } from "@/lib/labels";
import { PrintButton } from "./print-button";

// Rapport imprimable (ou enregistrable en PDF depuis la fenêtre d'impression).
export default async function RapportPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAccess("presences");
  const { id } = await params;
  const report = await loadAttendanceReport(id);
  if (!report) notFound();
  const generated = new Date().toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Casablanca" });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/presences/${id}`} className="text-sm font-semibold text-ccr-ink/50 hover:text-ccr-magenta">
          &larr; Retour au pointage
        </Link>
        <PrintButton />
      </div>

      <article className="rounded-2xl bg-white p-10 shadow-sm print:rounded-none print:p-0 print:shadow-none">
        <header className="flex items-center justify-between gap-6 border-b-2 border-ccr-gold pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ccr-ink/50">Rapport de présence</p>
            <h1 className="mt-1 font-display text-3xl font-black">{report.event.title}</h1>
            <p className="text-sm text-ccr-ink/70">{formatDate(report.event.startAt)}</p>
          </div>
          <Image src="/logo-ccr-famille.png" alt="CCR Famille" width={40} height={70} className="h-16 w-auto" />
        </header>

        <section className="mt-6 grid grid-cols-5 gap-3 text-center">
          {report.groups.map((g) => (
            <div key={g.key} className="rounded-xl border border-ccr-ink/10 p-3">
              <p className="text-xs text-ccr-ink/60">{g.label}</p>
              <p className="font-display text-2xl font-black">{g.present.length}</p>
            </div>
          ))}
          <div className="rounded-xl bg-ccr-ink p-3 text-ccr-cream print:border print:border-ccr-ink print:bg-white print:text-ccr-ink">
            <p className="text-xs opacity-70">Total</p>
            <p className="font-display text-2xl font-black">{report.total}</p>
          </div>
        </section>

        {report.groups.map((g) =>
          g.present.length === 0 ? null : (
            <section key={g.key} className="mt-8 break-inside-avoid">
              <h2 className="border-b border-ccr-ink/10 pb-1 font-display text-lg font-bold">
                {g.label} <span className="text-sm font-normal text-ccr-ink/50">({g.present.length} présent(s))</span>
              </h2>
              <ol className="mt-2 grid grid-cols-2 gap-x-6 text-sm">
                {g.present.map((m, i) => (
                  <li key={m.id} className="flex gap-2 py-0.5">
                    <span className="w-6 text-right text-ccr-ink/40">{i + 1}.</span>
                    <span>
                      {m.lastName ? <span className="font-semibold uppercase">{m.lastName} </span> : null}
                      {m.firstName}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ),
        )}

        <footer className="mt-10 border-t border-ccr-ink/10 pt-3 text-xs text-ccr-ink/50">
          CCR Famille Casablanca. Rapport généré le {generated}.
        </footer>
      </article>
    </div>
  );
}
