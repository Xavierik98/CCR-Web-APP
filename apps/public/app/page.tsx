import Image from "next/image";
import Link from "next/link";

// Structure de la page d'accueil (section 1.A du cahier des charges). Les sections
// "a venir" attendent le contenu officiel (textes, photos, video) avant d'etre
// remplies depuis le CMS : aucun contenu generique n'est publie a leur place.

function PlaceholderSection({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <p className="mt-3 text-sm text-ccr-ink/60">Contenu a venir.</p>
    </section>
  );
}

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

      <PlaceholderSection id="prochaines-activites" title="Prochaines activites" />
      <PlaceholderSection id="actualites" title="Actualites" />
      <PlaceholderSection id="temoignages" title="Temoignages" />

      <section id="departements" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl font-bold">Nos departements</h2>
        <p className="mt-2 text-sm text-ccr-ink/70">
          Coiffure, informatique, infographie, couture et bien d&rsquo;autres
          poles de competences.
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
