import type { Metadata } from "next";
import { PROGRAMME } from "../_data/programme";
import { ProgrammeGrid } from "./_components/programme-grid";

export const metadata: Metadata = {
  title: "Cultes et programmes",
  description:
    "Horaires des cultes, prieres et reunions de la semaine a CCR Famille, Casablanca.",
};

export default function CultesEtProgrammesPage() {
  return (
    <main>
      {/* Hero sombre : met en valeur le programme de la semaine, inspire du
          genre de benjamindeleuzetrading.com (fond sombre, halos de couleur,
          badge, grand titre centre). */}
      <section className="relative overflow-hidden bg-ccr-ink py-20 text-center text-ccr-cream">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-ccr-magenta/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-ccr-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-6rem] left-1/3 h-72 w-72 rounded-full bg-ccr-blue/20 blur-3xl" />

        <div className="relative mx-auto max-w-2xl px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-ccr-cream/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-ccr-gold-light">
            <span className="h-1.5 w-1.5 rounded-full bg-ccr-gold-light" />
            Cultes &amp; programmes
          </span>
          <h1 className="mt-5 font-display text-4xl font-black leading-tight md:text-5xl">
            Toute la semaine, un temps pour grandir ensemble
          </h1>
          <p className="mt-4 text-ccr-cream/70">
            Priere, enseignement, communion fraternelle : chaque jour a son
            rendez-vous. Cliquez sur une carte pour nous ecrire a son sujet.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <ProgrammeGrid items={PROGRAMME} />
      </section>
    </main>
  );
}
