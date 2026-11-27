import type { Metadata } from "next";
import { RevealText } from "../_components/reveal-text";
import { PROGRAMME } from "../_data/programme";
import { ProgrammeTimeline } from "./_components/programme-timeline";

export const metadata: Metadata = {
  title: "Cultes et programmes",
  description:
    "Horaires des cultes, prières et réunions de la semaine à CCR Famille, Casablanca.",
};

const BLOBS = [
  { cls: "-left-32 top-[3%] h-[26rem] w-[26rem] bg-ccr-magenta/35", delay: "0s" },
  { cls: "-right-40 top-[18%] h-[30rem] w-[30rem] bg-ccr-gold/25", delay: "-5s" },
  { cls: "left-1/4 top-[38%] h-[24rem] w-[24rem] bg-ccr-blue/30", delay: "-9s" },
  { cls: "-left-24 top-[58%] h-[28rem] w-[28rem] bg-ccr-gold/20", delay: "-3s" },
  { cls: "-right-24 top-[75%] h-[26rem] w-[26rem] bg-ccr-magenta/30", delay: "-11s" },
  { cls: "left-1/3 top-[90%] h-[22rem] w-[22rem] bg-ccr-blue/25", delay: "-7s" },
];

// Positions et durées fixes (pas d'aléatoire) : rendu identique serveur/client.
const PARTICLES = Array.from({ length: 36 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  top: `${(i * 53 + 17) % 100}%`,
  size: 2 + (i % 3),
  duration: `${12 + ((i * 7) % 14)}s`,
  delay: `-${(i * 5) % 20}s`,
  color: ["#F2C94D", "#DA2979", "#6f9fe0"][i % 3],
}));

// Frise verticale sur un fond qui vit en continu : grille qui défile, halos
// de couleur qui dérivent et particules lumineuses qui montent.
export default function CultesEtProgrammesPage() {
  return (
    <main className="relative isolate overflow-hidden bg-ccr-ink text-ccr-cream">
      <div
        aria-hidden="true"
        className="animate-grid-pan pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(250,249,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(250,249,246,0.05)_1px,transparent_1px)] bg-[size:72px_72px]"
      />
      {BLOBS.map((b, i) => (
        <div
          key={i}
          aria-hidden="true"
          className={`animate-drift pointer-events-none absolute -z-10 rounded-full blur-3xl [animation-duration:14s] ${b.cls}`}
          style={{ animationDelay: b.delay }}
        />
      ))}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="animate-rise pointer-events-none absolute -z-10 rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 10px 2px ${p.color}`,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}

      <section className="relative mx-auto max-w-3xl px-6 pb-16 pt-24 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-ccr-cream/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-ccr-gold-light">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ccr-gold-light" />
          Cultes &amp; programmes
        </span>
        <RevealText
          as="h1"
          text="Toute la semaine, un temps pour grandir ensemble"
          className="mt-4 font-display text-3xl font-black leading-tight sm:text-5xl md:mt-6 md:text-6xl"
        />
        <p className="mx-auto mt-3 max-w-xl text-sm text-ccr-cream/70 sm:mt-5 sm:text-base">
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
