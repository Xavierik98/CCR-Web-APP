import type { Metadata } from "next";
import Link from "next/link";
import { YoutubeBackground } from "../_components/youtube-background";
import { DEPARTEMENTS } from "../_data/departements";
import { DepartementsBrowser } from "./_components/browser";

export const metadata: Metadata = {
  title: "Départements",
  description:
    "Les ministères et pôles de compétences de CCR Famille Casablanca.",
};

export default function DepartementsPage() {
  return (
    <main>
      <section className="relative isolate min-h-[380px] overflow-hidden bg-ccr-ink py-16">
        <YoutubeBackground videoId="_8GzXCXd1GI" />
        <div className="absolute inset-0 bg-ccr-ink/70" />
        <div className="relative mx-auto max-w-5xl px-6">
          <h1 className="font-display text-4xl font-black text-ccr-cream">
            Nos départements
          </h1>
          <p className="mt-3 max-w-2xl text-ccr-cream/80">
            Des ministères et des pôles de compétences où chacun peut servir,
            apprendre et mettre son savoir-faire au service des autres.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <DepartementsBrowser departements={DEPARTEMENTS} />

        <div className="mt-16 rounded-2xl bg-ccr-ink px-8 py-10 text-center text-ccr-cream">
          <h2 className="font-display text-2xl font-bold">
            L&rsquo;église a un besoin
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ccr-cream/70">
            Vous voyez un besoin et une solution à apporter, en dehors des
            départements ci-dessus ? Proposez-la, un responsable vous
            recontactera.
          </p>
          <Link
            href="/mon-eglise-a-un-besoin"
            className="mt-6 inline-block rounded-full bg-ccr-gold px-6 py-3 text-sm font-semibold text-ccr-ink transition-colors hover:bg-ccr-gold-light"
          >
            Faire une proposition
          </Link>
        </div>
      </div>
    </main>
  );
}
