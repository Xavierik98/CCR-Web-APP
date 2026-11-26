import type { Metadata } from "next";
import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import { FlipPhotos } from "../_components/flip-photos";
import { HeroSlideshow } from "../_components/hero-slideshow";
import { ImageSlot } from "../_components/image-slot";
import { Reveal } from "../_components/reveal";
import { RevealText } from "../_components/reveal-text";
import { VisionIcon } from "../_components/vision-icons";
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
    nom: "Rassembler" as const,
    couleur: "text-ccr-gold",
    texte:
      "Nous sommes nés dans des maisons, et nous gardons cet esprit. Chacun est le bienvenu, quelle que soit son histoire. Comme les premiers chrétiens, nous voulons vivre ensemble la prière, la Parole et la communion fraternelle.",
    verset: "Actes 2:42",
  },
  {
    nom: "Former" as const,
    couleur: "text-ccr-magenta",
    texte:
      "Venir ne suffit pas, il faut grandir. Par l'enseignement de la Parole, l'accompagnement et le service, nous aidons chaque croyant à devenir un disciple solide et mûr dans sa foi.",
    verset: "Éphésiens 4:12-13",
  },
  {
    nom: "Envoyer" as const,
    couleur: "text-ccr-blue",
    texte:
      "Une vie restaurée est faite pour en restaurer d'autres. Nous préparons chacun à porter l'Évangile là où Dieu l'a placé : sa famille, son travail, sa ville et au-delà.",
    verset: "Matthieu 28:19-20",
  },
];

const HISTOIRE = [
  "Le Centre Chrétien de Restauration fait partie d’une famille d’églises née de la vision de l’apôtre Gel EBA GATSE. Au Maroc, l’histoire commence à la fin des années 1990, avec quelques croyants qui se retrouvaient chez eux pour prier, lire la Parole et partager leur foi. Dans chaque quartier, une « famille d’église » se formait autour d’un salon, d’une table, d’une Bible ouverte.",
  "Avec les années, ces petites assemblées ont grandi. Les salons sont devenus trop étroits, et le désir de se réunir comme un seul corps est devenu une évidence. L’église a alors loué ses premières salles pour rassembler tous les frères et sœurs, pendant les réunions de la semaine comme au culte du dimanche.",
  "Aujourd’hui, l’église est une association officiellement reconnue. Plus de vingt-cinq ans après les premières réunions de maison, l’esprit reste le même : être une famille avant d’être une institution.",
];

// Photo de l'apôtre (recto) ; la photo avec son épouse s'ajoute au verso dès
// que le fichier est déposé, sans emplacement vide entre-temps.
const PHOTO_COUPLE = "/images/about/apotre-et-epouse-1.jpg";

export default function AProposPage() {
  const responsables = LEADERS.filter((leader) => leader.local);
  const avecCouple = fs.existsSync(path.join(process.cwd(), "public", PHOTO_COUPLE));

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
          <RevealText
            as="h1"
            text="Centre Chrétien de Restauration"
            className="font-display text-4xl font-black md:text-5xl"
          />
          <Reveal delay={300}>
            <p className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-1 font-display text-lg font-semibold tracking-wide">
              <span className="text-ccr-gold">Rassembler</span>
              <span className="text-ccr-magenta">Former</span>
              <span className="text-ccr-blue">Envoyer</span>
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-ccr-ink/70">
              Une famille d&rsquo;églises où chaque vie peut être relevée,
              affermie et envoyée.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Notre histoire : texte à gauche, photo 3D de l'apôtre et de son épouse à droite */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:gap-16">
        <div>
          <RevealText as="h2" text="Notre histoire" className="font-display text-3xl font-bold" />
          <div className="mt-6 space-y-4 text-ccr-ink/80">
            {HISTOIRE.map((paragraphe, i) => (
              <Reveal key={i} delay={i * 150}>
                <p>{paragraphe}</p>
              </Reveal>
            ))}
          </div>

          <ol className="mt-10 grid gap-6 sm:grid-cols-3">
            {FRISE.map((etape, i) => (
              <Reveal key={etape.periode} delay={i * 150}>
                <li className="border-t-2 border-ccr-gold pt-3">
                  <p className="font-display text-sm font-bold">{etape.periode}</p>
                  <p className="mt-1 text-sm text-ccr-ink/70">{etape.texte}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal delay={200}>
          <figure className="relative mx-auto w-full max-w-md">
            <div
              aria-hidden="true"
              className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-ccr-gold/30 via-ccr-magenta/15 to-ccr-blue/20 blur-3xl"
            />
            <div className="relative">
              <FlipPhotos
                front={
                  <ImageSlot
                    src="/images/about/apotre-gel-eba-gatse.jpg"
                    alt="L'apôtre Gel EBA GATSE"
                    className="object-[50%_12%]"
                  />
                }
                back={
                  avecCouple ? (
                    <ImageSlot src={PHOTO_COUPLE} alt="L'apôtre Gel EBA GATSE et son épouse" />
                  ) : null
                }
              />
            </div>
            <figcaption className="relative mt-5 text-center text-sm text-ccr-ink/60">
              {avecCouple ? "L’apôtre Gel EBA GATSE et son épouse" : "L’apôtre Gel EBA GATSE, père de la maison"}
            </figcaption>
          </figure>
        </Reveal>
      </section>

      {/* Nos responsables : pasteur principal et assistant pasteur */}
      <section className="bg-ccr-ink/5 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <RevealText as="h2" text="Nos responsables" className="font-display text-3xl font-bold" />
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {responsables.map((leader, i) => (
              <Reveal key={leader.slug} delay={i * 150}>
                <article className="h-full overflow-hidden rounded-2xl bg-white transition-transform hover:-translate-y-1 hover:shadow-md">
                  <div className="relative aspect-[4/5]">
                    <ImageSlot src={leader.photo} alt={leader.nom} className={leader.cadrage} />
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ccr-magenta">
                      {leader.titre}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-bold">{leader.nom}</h3>
                    {leader.texte ? (
                      <p className="mt-3 text-sm text-ccr-ink/70">{leader.texte}</p>
                    ) : null}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Notre vision */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <RevealText as="h2" text="Notre vision" className="font-display text-3xl font-bold" />
        <Reveal delay={150}>
          <p className="mt-4 max-w-2xl text-ccr-ink/80">
            Nous croyons que Dieu relève ce qui est tombé et rebâtit ce qui a
            été détruit (Ésaïe 61:4). Notre vision tient en trois mots, qui
            décrivent le chemin de chaque personne qui franchit nos portes.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PILIERS.map((pilier, i) => (
            <Reveal key={pilier.nom} delay={i * 180}>
              <article className="h-full rounded-2xl border border-ccr-ink/10 p-6 transition-transform hover:-translate-y-1 hover:shadow-md">
                <VisionIcon name={pilier.nom} className={`h-14 w-14 ${pilier.couleur}`} />
                <h3 className={`mt-4 text-lg font-bold uppercase tracking-[0.15em] ${pilier.couleur}`}>
                  {pilier.nom}
                </h3>
                <p className="mt-3 text-sm text-ccr-ink/70">{pilier.texte}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ccr-ink/40">
                  {pilier.verset}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Conclusion */}
      <section className="bg-ccr-ink py-16 text-center text-ccr-cream">
        <div className="mx-auto max-w-2xl px-6">
          <RevealText
            as="blockquote"
            stagger={45}
            text="« Rassembler ceux qui cherchent, former des disciples, envoyer des témoins : c’est l’appel que nous avons reçu, et l’invitation que nous vous faisons. »"
            className="font-display text-2xl font-bold leading-snug md:text-3xl"
          />
          <Reveal delay={600}>
            <Link
              href="/cultes-et-programmes"
              className="mt-8 inline-block rounded-full bg-ccr-gold px-6 py-3 text-sm font-semibold text-ccr-ink transition-colors hover:bg-ccr-gold-light"
            >
              Nous rejoindre
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
