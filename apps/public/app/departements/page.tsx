import type { Metadata } from "next";
import Link from "next/link";
import { DEPARTEMENTS } from "../_data/departements";
import { DepartementsBrowser } from "./_components/browser";

export const metadata: Metadata = {
  title: "Departements",
  description: "Les ministeres et poles de competences de CCR Famille Casablanca.",
};

export default function DepartementsPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-ccr-magenta/10 via-ccr-cream to-ccr-blue/10 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h1 className="font-display text-4xl font-black">Nos departements</h1>
          <p className="mt-3 max-w-2xl text-ccr-ink/70">
            Des ministeres et des poles de competences ou chacun peut servir,
            apprendre et mettre son savoir-faire au service des autres.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <DepartementsBrowser departements={DEPARTEMENTS} />

        <div className="mt-16 rounded-2xl bg-ccr-ink px-8 py-10 text-center text-ccr-cream">
          <h2 className="font-display text-2xl font-bold">
            L&rsquo;eglise a un besoin
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ccr-cream/70">
            Un savoir-faire a proposer, une envie de servir ? Signalez-vous, un
            responsable de departement vous recontactera.
          </p>
          <Link
            href="/mon-eglise-a-un-besoin"
            className="mt-6 inline-block rounded-full bg-ccr-gold px-6 py-3 text-sm font-semibold text-ccr-ink transition-colors hover:bg-ccr-gold-light"
          >
            Je me signale
          </Link>
        </div>
      </div>
    </main>
  );
}
