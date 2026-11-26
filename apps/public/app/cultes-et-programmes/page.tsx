import type { Metadata } from "next";
import { PROGRAMME } from "../_data/programme";
import { ProgrammeTimeline } from "./_components/programme-timeline";

export const metadata: Metadata = {
  title: "Cultes et programmes",
  description:
    "Horaires des cultes, prières et réunions de la semaine à CCR Famille, Casablanca.",
};

// Frise verticale : ligne dorée au centre, chaque rendez-vous de la semaine
// en alternance à gauche et à droite, sur un fond sombre quadrillé dont les
// halos de couleur dérivent lentement.
export default function CultesEtProgrammesPage() {
  return (
    <main className="relative isolate overflow-hidden bg-ccr-ink text-ccr-cream">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(250,249,246,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(250,249,246,0.04)_1px,transparent_1px)] bg-[size:72px_72px]"
      />
      <div
        aria-hidden="true"
        className="animate-drift pointer-events-none absolute -left-32 top-[5%] -z-10 h-96 w-96 rounded-full bg-ccr-magenta/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animate-drift pointer-events-none absolute -right-32 top-[30%] -z-10 h-[28rem] w-[28rem] rounded-full bg-ccr-gold/15 blur-3xl"
        style={{ animationDelay: "-7s" }}
      />
      <div
        aria-hidden="true"
        className="animate-drift pointer-events-none absolute left-1/4 top-[60%] -z-10 h-96 w-96 rounded-full bg-ccr-blue/20 blur-3xl"
        style={{ animationDelay: "-13s" }}
      />
      <div
        aria-hidden="true"
        className="animate-drift pointer-events-none absolute -right-24 top-[85%] -z-10 h-80 w-80 rounded-full bg-ccr-magenta/20 blur-3xl"
        style={{ animationDelay: "-4s" }}
      />

      <section className="relative mx-auto max-w-3xl px-6 pb-16 pt-24 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-ccr-cream/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-ccr-gold-light">
          <span className="h-1.5 w-1.5 rounded-full bg-ccr-gold-light" />
          Cultes &amp; programmes
        </span>
        <h1 className="mt-6 bg-gradient-to-b from-ccr-cream to-ccr-cream/50 bg-clip-text font-display text-5xl font-black leading-tight text-transparent md:text-6xl">
          Toute la semaine, un temps pour grandir ensemble
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-ccr-cream/70">
          Prière, enseignement, communion fraternelle : chaque jour a son
          rendez-vous. Cliquez sur un rendez-vous pour nous écrire à son sujet.
        </p>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-32 pt-8">
        <ProgrammeTimeline items={PROGRAMME} />
      </section>
    </main>
  );
}
