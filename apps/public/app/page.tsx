import Image from "next/image";
import Link from "next/link";
import { Icon } from "./_components/icon";
import { Reveal } from "./_components/reveal";
import { DEPARTEMENTS } from "./_data/departements";
import { PILIERS } from "./_data/piliers";

// Structure de la page d'accueil (section 1.A du cahier des charges). Les sections
// sans donnee officielle (actualites, temoignages) restent honnetes : aucun
// contenu generique ou invente n'est publie a leur place.

const LIENS_RAPIDES = [
  { href: "/departements", label: "Nos departements", icon: "spark" as const },
  { href: "/cultes-et-programmes", label: "Cultes et programmes", icon: "clock" as const },
  { href: "/mon-eglise-a-un-besoin", label: "Servir", icon: "heart" as const },
  { href: "/contact", label: "Nous trouver", icon: "map" as const },
];

const ACCENTS = {
  gold: { text: "text-ccr-gold", bg: "bg-ccr-gold/10" },
  magenta: { text: "text-ccr-magenta", bg: "bg-ccr-magenta/10" },
  blue: { text: "text-ccr-blue", bg: "bg-ccr-blue/10" },
};

const DEPARTEMENTS_APERCU = DEPARTEMENTS.slice(0, 4);

export default function HomePage() {
  return (
    <main>
      <section className="relative isolate flex min-h-[520px] items-center overflow-hidden md:min-h-[640px]">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/hero-culte.jpg"
            alt=""
            fill
            priority
            className="animate-slow-zoom object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ccr-ink via-ccr-ink/75 to-ccr-ink/40" />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-16">
          <h1 className="animate-fade-in-up font-display text-5xl font-black leading-[1.05] tracking-tight text-ccr-cream md:text-6xl">
            La famille
            <br />
            <span className="text-ccr-magenta">CCR</span>{" "}
            <span className="text-ccr-gold-light">a Casablanca</span>
          </h1>
          <p
            className="animate-fade-in-up mt-6 max-w-md text-lg text-ccr-cream/80"
            style={{ animationDelay: "150ms" }}
          >
            Une eglise qui accueille, qui forme et qui envoie, en plein coeur
            de Casablanca.
          </p>
          <div
            className="animate-fade-in-up mt-8 flex flex-wrap gap-4"
            style={{ animationDelay: "300ms" }}
          >
            <Link
              href="/a-propos"
              className="rounded-full border border-ccr-cream/50 px-6 py-3 text-sm font-semibold text-ccr-cream transition-colors hover:bg-ccr-cream/10"
            >
              Decouvrir l&rsquo;eglise
            </Link>
            <Link
              href="/cultes-et-programmes"
              className="rounded-full bg-ccr-gold px-6 py-3 text-sm font-semibold text-ccr-ink transition-transform hover:scale-105 hover:bg-ccr-gold-light"
            >
              Participer a un culte
            </Link>
          </div>
        </div>
      </section>

      {/* Bande de liens rapides, inspiree de la bande d'icones d'impactcentrechretien.com */}
      <section className="relative bg-ccr-ink pb-16 pt-10 text-ccr-cream">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
          {LIENS_RAPIDES.map((lien, index) => (
            <Reveal key={lien.href} delay={index * 80}>
              <Link href={lien.href} className="group flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ccr-cream/20 text-ccr-gold-light transition-all group-hover:scale-110 group-hover:border-ccr-gold-light">
                  <Icon name={lien.icon} className="h-5 w-5" />
                </span>
                <span className="font-display text-base font-semibold">
                  {lien.label}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* Vague de transition vers le contenu clair, dans l'esprit des bandes
            courbes de familletransformation.com. */}
        <svg
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-10 w-full translate-y-full text-ccr-ink"
        >
          <path
            d="M0,0 C360,60 1080,-30 1440,20 L1440,60 L0,60 Z"
            fill="currentColor"
          />
        </svg>
      </section>

      <Reveal>
        <section className="mx-auto max-w-5xl px-6 py-20 text-center">
          <h2 className="font-display text-3xl font-bold">Notre vision</h2>
          <p className="mx-auto mt-3 max-w-xl text-ccr-ink/70">
            Rassembler &middot; Former &middot; Envoyer, en trois mots qui
            decrivent le chemin de chaque personne qui franchit nos portes.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PILIERS.map((pilier, index) => {
              const accent = ACCENTS[pilier.accent];
              return (
                <Reveal key={pilier.nom} delay={index * 120}>
                  <article className="h-full rounded-2xl border border-ccr-ink/10 bg-white p-6 text-left transition-transform hover:-translate-y-1 hover:shadow-md">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full ${accent.bg} ${accent.text}`}
                    >
                      <Icon name={pilier.icon} className="h-5 w-5" />
                    </div>
                    <h3 className={`mt-4 font-display text-xl font-bold ${accent.text}`}>
                      {pilier.nom}
                    </h3>
                    <p className="mt-2 text-sm text-ccr-ink/70">{pilier.texte}</p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ccr-ink/40">
                      {pilier.verset}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <Link
            href="/a-propos"
            className="mt-10 inline-block text-sm font-semibold text-ccr-magenta hover:underline"
          >
            En savoir plus sur notre vision &rarr;
          </Link>
        </section>
      </Reveal>

      <Reveal>
        <section id="prochaines-activites" className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-bold">Prochaines activites</h2>
          <div className="mt-6 flex flex-col gap-4 overflow-hidden rounded-2xl border border-ccr-ink/10 bg-white transition-shadow hover:shadow-md sm:flex-row">
            <div className="flex shrink-0 flex-col items-center justify-center bg-ccr-gold/10 px-8 py-6 text-center">
              <span className="text-xs font-semibold uppercase tracking-wide text-ccr-gold">
                Dim
              </span>
              <span className="font-display text-4xl font-black text-ccr-ink">
                01
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-ccr-ink/60">
                Nov 2026
              </span>
            </div>
            <div className="flex-1 px-6 py-6">
              <h3 className="font-display text-xl font-bold">
                Sunday Service : rassemblement de famille
              </h3>
              <p className="mt-2 text-sm text-ccr-ink/70">
                10h30 - 13h30 &middot; Salle de reunion CCR Casablanca
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section id="departements" className="bg-ccr-ink/5 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-2xl font-bold">Nos departements</h2>
            <p className="mt-2 max-w-xl text-sm text-ccr-ink/70">
              Louange, communication, finance, coiffure, informatique,
              infographie et bien d&rsquo;autres poles de competences.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {DEPARTEMENTS_APERCU.map((pole, index) => {
                const accent =
                  pole.categorie === "Ministere" ? "magenta" : ("blue" as const);
                const style = ACCENTS[accent];
                return (
                  <Reveal key={pole.nom} delay={index * 80}>
                    <div className="h-full rounded-xl border border-ccr-ink/10 bg-white p-5 transition-transform hover:-translate-y-1 hover:shadow-md">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full ${style.bg} ${style.text}`}
                      >
                        <Icon
                          name={pole.categorie === "Ministere" ? "heart" : "spark"}
                          className="h-4 w-4"
                        />
                      </div>
                      <p className="mt-3 font-display text-base font-bold">
                        {pole.nom}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <Link
              href="/departements"
              className="mt-8 inline-block text-sm font-semibold text-ccr-magenta hover:underline"
            >
              Decouvrir tous les departements &rarr;
            </Link>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section id="actualites" className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-bold">Actualites</h2>
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ccr-ink/15 bg-ccr-ink/5 px-6 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ccr-blue/10 text-ccr-blue">
              <Icon name="book" className="h-6 w-6" />
            </span>
            <p className="text-sm text-ccr-ink/60">
              Aucune actualite publiee pour l&rsquo;instant. Revenez bientot.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section id="temoignages" className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-bold">Temoignages</h2>
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ccr-ink/15 bg-ccr-ink/5 px-6 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ccr-magenta/10 text-ccr-magenta">
              <Icon name="heart" className="h-6 w-6" />
            </span>
            <p className="text-sm text-ccr-ink/60">
              Les temoignages de la famille CCR seront publies ici.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section id="contact" className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-bold">Nous contacter</h2>
          <p className="mt-2 text-sm text-ccr-ink/70">
            44 Rue de Bazas, Gironde, Casablanca.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-block text-sm font-semibold text-ccr-magenta hover:underline"
          >
            Voir la carte et nous ecrire &rarr;
          </Link>
        </section>
      </Reveal>
    </main>
  );
}
