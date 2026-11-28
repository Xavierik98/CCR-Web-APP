import type { Metadata } from "next";
import Image from "next/image";
import { Icon } from "../_components/icon";
import { Reveal } from "../_components/reveal";
import { RevealText } from "../_components/reveal-text";
import { SupportForm } from "./_components/support-form";

export const metadata: Metadata = {
  title: "Demande de soutien",
  description: "Demander un soutien alimentaire à l'équipe sociale de CCR Famille Casablanca.",
};

const INTRANET_URL = process.env.NEXT_PUBLIC_INTRANET_URL ?? "https://ccr-famille-intranet.vercel.app";

const ETAPES = [
  { icon: "chat" as const, titre: "Vous remplissez", texte: "Quelques informations et vos besoins, en toute discrétion." },
  { icon: "users" as const, titre: "Nous vous contactons", texte: "L'équipe sociale vous répond sur WhatsApp." },
  { icon: "heart" as const, titre: "Nous vous aidons", texte: "Denrées et produits de première nécessité, selon le stock." },
];

// Même mise en page que la page Contact : bandeau photo animé, vagues, puis
// le formulaire posé sur une carte.
export default function DemandeDeSoutienPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-ccr-ink pb-32 pt-20 text-ccr-cream md:pt-28">
        <Image src="/images/galerie/photo-14.jpg" alt="" fill priority sizes="100vw" className="animate-slow-zoom object-cover object-center" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ccr-ink via-ccr-ink/85 to-ccr-magenta/40" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ccr-ink/70 via-transparent to-ccr-ink/30" />
        <div className="relative mx-auto max-w-6xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ccr-gold-light">Entraide</p>
          <RevealText as="h1" text="Besoin d'aide ?" className="mt-2 font-display text-5xl font-black md:text-6xl" />
          <Reveal delay={150}>
            <div className="mt-5 inline-flex items-center gap-3 rounded-2xl bg-white/95 py-2 pl-2 pr-4 shadow-lg backdrop-blur">
              <Image src="/images/partenaires/coeur-solidaire-symbole.png" alt="" width={44} height={41} className="h-10 w-10 object-contain" />
              <span className="text-sm font-semibold leading-tight text-ccr-ink">
                Avec l&rsquo;Association
                <br />
                Cœur Solidaire
              </span>
            </div>
          </Reveal>
          <Reveal delay={250}>
            <p className="mt-4 max-w-xl text-ccr-cream/80">
              Vous traversez une période difficile ? L&rsquo;accompagnement social de l&rsquo;église peut vous aider avec
              des denrées alimentaires et des produits de première nécessité. Remplissez ce formulaire, nous vous recontactons.
            </p>
          </Reveal>
        </div>
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-20 overflow-hidden">
          <svg viewBox="0 0 2880 80" preserveAspectRatio="none" className="animate-wave-slide-slow absolute bottom-0 left-0 h-full w-[200%] text-ccr-cream/40">
            <path d="M0,45 C360,10 720,80 1440,45 C1800,10 2160,80 2880,45 L2880,80 L0,80 Z" fill="currentColor" />
          </svg>
          <svg viewBox="0 0 2880 80" preserveAspectRatio="none" className="animate-wave-slide absolute bottom-0 left-0 h-full w-[200%] text-ccr-cream">
            <path d="M0,50 C360,80 1080,20 1440,50 C1800,80 2520,20 2880,50 L2880,80 L0,80 Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      <section className="mx-auto -mt-10 grid max-w-6xl gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-8">
        <Reveal>
          <div className="animate-swell grid gap-3 rounded-3xl bg-white p-5 shadow-[0_20px_50px_-25px_rgba(32,28,22,0.35)] sm:p-8 lg:gap-6">
            {ETAPES.map((e, i) => (
              <div key={e.titre} className="flex gap-4">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${["bg-ccr-gold text-ccr-ink", "bg-ccr-magenta text-ccr-cream", "bg-ccr-blue text-ccr-cream"][i]}`}>
                  <Icon name={e.icon} className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold sm:text-xl">{e.titre}</h2>
                  <p className="mt-0.5 text-sm text-ccr-ink/70">{e.texte}</p>
                </div>
              </div>
            ))}
            <div className="mt-2 border-t border-ccr-ink/10 pt-4 text-center">
              <Image src="/images/partenaires/coeur-solidaire-logo.png" alt="Association Cœur Solidaire" width={240} height={164} className="mx-auto h-auto w-40 sm:w-48" />
            </div>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="animate-swell-late">
            <SupportForm endpoint={`${INTRANET_URL}/api/soutien`} />
          </div>
        </Reveal>
      </section>
    </main>
  );
}
