import type { Metadata } from "next";
import Link from "next/link";
import { FlipPhotos } from "../_components/flip-photos";
import { HeroSlideshow } from "../_components/hero-slideshow";
import { ImageSlot } from "../_components/image-slot";
import { A_PROPOS_PHOTOS } from "../_data/a-propos-photos";
import { LEADERS } from "../_data/leaders";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Histoire, responsables et vision du Centre Chrétien de Restauration (CCR), Casablanca.",
};

const FRISE = [
  {
    periode: "Fin des années 1990",
    texte: "Les premières réunions de maison, par quartier.",
  },
  {
    periode: "Les années de croissance",
    texte: "Location des premières salles pour se réunir tous ensemble.",
  },
  {
    periode: "Aujourd'hui",
    texte: "Une association officiellement reconnue.",
  },
];

const PILIERS = [
  {
    nom: "Rassembler",
    texte:
      "Nous sommes nés dans des maisons, et nous gardons cet esprit. Chacun est le bienvenu, quelle que soit son histoire. Comme les premiers chrétiens, nous voulons vivre ensemble la prière, la Parole et la communion fraternelle.",
    verset: "Actes 2:42",
  },
  {
    nom: "Former",
    texte:
      "Venir ne suffit pas, il faut grandir. Par l'enseignement de la Parole, l'accompagnement et le service, nous aidons chaque croyant à devenir un disciple solide et mûr dans sa foi.",
    verset: "Éphésiens 4:12-13",
  },
  {
    nom: "Envoyer",
    texte:
      "Une vie restaurée est faite pour en restaurer d'autres. Nous préparons chacun à porter l'Évangile là où Dieu l'a placé : sa famille, son travail, sa ville et au-delà.",
    verset: "Matthieu 28:19-20",
  },
];

export default function AProposPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative aspect-[16/7] w-full md:aspect-[21/7]">
          <HeroSlideshow
            images={A_PROPOS_PHOTOS.map((photo) => ({ src: photo.src }))}
          />
        </div>
        <div className="mx-auto max-w-4xl px-6 py-10 text-center">
          <h1 className="font-display text-4xl font-black md:text-5xl">
            Centre Chrétien de Restauration
          </h1>
          <p className="mt-3 font-display text-lg font-semibold tracking-wide text-ccr-magenta">
            Rassembler &middot; Former &middot; Envoyer
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-ccr-ink/70">
            Une famille d&rsquo;églises où chaque vie peut être relevée,
            affermie et envoyée.
          </p>
        </div>
      </section>

      {/* Notre histoire : texte à gauche, photo 3D de l'apôtre et de son épouse à droite */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:gap-16">
        <div>
        <h2 className="font-display text-3xl font-bold">Notre histoire</h2>
        <div className="mt-6 space-y-4 text-ccr-ink/80">
          <p>
            Le Centre Chrétien de Restauration fait partie d&rsquo;une famille
            d&rsquo;églises née de la vision de l&rsquo;apôtre Gel EBA GATSE.
            Au Maroc, l&rsquo;histoire commence à la fin des années 1990, avec
            quelques croyants qui se retrouvaient chez eux pour prier, lire la
            Parole et partager leur foi. Dans chaque quartier, une &laquo;
            famille d&rsquo;église &raquo; se formait autour d&rsquo;un salon,
            d&rsquo;une table, d&rsquo;une Bible ouverte.
          </p>
          <p>
            Avec les années, ces petites assemblées ont grandi. Les salons
            sont devenus trop étroits, et le désir de se réunir comme un seul
            corps est devenu une évidence. L&rsquo;église a alors loué ses
            premières salles pour rassembler tous les frères et sœurs,
            pendant les réunions de la semaine comme au culte du dimanche.
          </p>
          <p>
            Aujourd&rsquo;hui, l&rsquo;église est une association
            officiellement reconnue. Plus de vingt-cinq ans après les
            premières réunions de maison, l&rsquo;esprit reste le même : être
            une famille avant d&rsquo;être une institution.
          </p>
        </div>

        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {FRISE.map((etape) => (
            <li
              key={etape.periode}
              className="border-t-2 border-ccr-gold pt-3"
            >
              <p className="font-display text-sm font-bold">{etape.periode}</p>
              <p className="mt-1 text-sm text-ccr-ink/70">{etape.texte}</p>
            </li>
          ))}
        </ol>
        </div>

        <figure className="relative mx-auto w-full max-w-md">
          <div
            aria-hidden="true"
            className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-ccr-gold/30 via-ccr-magenta/15 to-ccr-blue/20 blur-3xl"
          />
          <div className="relative">
            <FlipPhotos
              front={
                <ImageSlot
                  src="/images/about/apotre-et-epouse-1.jpg"
                  alt="L'apôtre Gel EBA GATSE et son épouse"
                />
              }
              back={
                <ImageSlot
                  src="/images/about/apotre-et-epouse-2.jpg"
                  alt="L'apôtre Gel EBA GATSE et son épouse"
                />
              }
            />
          </div>
          <figcaption className="relative mt-5 text-center text-sm text-ccr-ink/60">
            L&rsquo;apôtre Gel EBA GATSE et son épouse
          </figcaption>
        </figure>
      </section>

      {/* Nos responsables */}
      <section className="bg-ccr-ink/5 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="font-display text-3xl font-bold">Nos responsables</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {LEADERS.map((leader) => (
              <article
                key={leader.slug}
                className="overflow-hidden rounded-2xl bg-white"
              >
                <div className="relative aspect-[4/3]">
                  <ImageSlot src={leader.photo} alt={leader.nom} />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold">
                    {leader.nom}
                  </h3>
                  <p className="text-sm font-semibold text-ccr-magenta">
                    {leader.titre}
                  </p>
                  <p className="mt-3 text-sm text-ccr-ink/70">{leader.texte}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Notre vision */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="font-display text-3xl font-bold">Notre vision</h2>
        <p className="mt-4 max-w-2xl text-ccr-ink/80">
          Nous croyons que Dieu relève ce qui est tombé et rebâtit ce qui a
          été détruit (Ésaïe 61:4). Notre vision tient en trois mots, qui
          décrivent le chemin de chaque personne qui franchit nos portes.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PILIERS.map((pilier) => (
            <article
              key={pilier.nom}
              className="rounded-2xl border border-ccr-ink/10 p-6"
            >
              <h3 className="font-display text-xl font-bold text-ccr-blue">
                {pilier.nom}
              </h3>
              <p className="mt-3 text-sm text-ccr-ink/70">{pilier.texte}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ccr-ink/40">
                {pilier.verset}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Conclusion */}
      <section className="bg-ccr-ink py-16 text-center text-ccr-cream">
        <div className="mx-auto max-w-2xl px-6">
          <blockquote className="font-display text-2xl font-bold leading-snug md:text-3xl">
            &laquo; Rassembler ceux qui cherchent, former des disciples,
            envoyer des témoins : c&rsquo;est l&rsquo;appel que nous avons
            reçu, et l&rsquo;invitation que nous vous faisons. &raquo;
          </blockquote>
          <Link
            href="/cultes-et-programmes"
            className="mt-8 inline-block rounded-full bg-ccr-gold px-6 py-3 text-sm font-semibold text-ccr-ink transition-colors hover:bg-ccr-gold-light"
          >
            Nous rejoindre
          </Link>
        </div>
      </section>
    </main>
  );
}
