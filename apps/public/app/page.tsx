import Image from "next/image";
import Link from "next/link";
import { Icon } from "./_components/icon";

// Structure de la page d'accueil (section 1.A du cahier des charges). Les sections
// sans donnee officielle (actualites, temoignages) restent honnetes : aucun
// contenu generique ou invente n'est publie a leur place.

const LIENS_RAPIDES = [
  { href: "/departements", label: "Nos departements", icon: "spark" as const },
  { href: "/cultes-et-programmes", label: "Cultes et programmes", icon: "clock" as const },
  { href: "/mon-eglise-a-un-besoin", label: "Servir", icon: "heart" as const },
  { href: "/contact", label: "Nous trouver", icon: "map" as const },
];

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
          <h1 className="font-display text-5xl font-black leading-[1.05] tracking-tight text-ccr-cream md:text-6xl">
            La famille
            <br />
            <span className="text-ccr-magenta">CCR</span>{" "}
            <span className="text-ccr-gold-light">a Casablanca</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-ccr-cream/80">
            Une eglise qui accueille, qui forme et qui envoie, en plein coeur
            de Casablanca.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/a-propos"
              className="rounded-full border border-ccr-cream/50 px-6 py-3 text-sm font-semibold text-ccr-cream transition-colors hover:bg-ccr-cream/10"
            >
              Decouvrir l&rsquo;eglise
            </Link>
            <Link
              href="/cultes-et-programmes"
              className="rounded-full bg-ccr-gold px-6 py-3 text-sm font-semibold text-ccr-ink transition-colors hover:bg-ccr-gold-light"
            >
              Participer a un culte
            </Link>
          </div>
        </div>
      </section>

      {/* Bande de liens rapides, inspiree de la bande d'icones d'impactcentrechretien.com */}
      <section className="bg-ccr-ink py-10 text-ccr-cream">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
          {LIENS_RAPIDES.map((lien) => (
            <Link
              key={lien.href}
              href={lien.href}
              className="group flex items-center gap-3"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ccr-cream/20 text-ccr-gold-light transition-colors group-hover:border-ccr-gold-light">
                <Icon name={lien.icon} className="h-5 w-5" />
              </span>
              <span className="font-display text-base font-semibold">
                {lien.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="prochaines-activites" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl font-bold">Prochaines activites</h2>
        <div className="mt-6 flex flex-col gap-4 overflow-hidden rounded-2xl border border-ccr-ink/10 bg-white sm:flex-row">
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

      <section id="departements" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl font-bold">Nos departements</h2>
        <p className="mt-2 text-sm text-ccr-ink/70">
          Louange, communication, finance, coiffure, informatique,
          infographie et bien d&rsquo;autres poles de competences.
        </p>
        <Link
          href="/departements"
          className="mt-4 inline-block text-sm font-semibold text-ccr-magenta hover:underline"
        >
          Decouvrir tous les departements &rarr;
        </Link>
      </section>

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
    </main>
  );
}
