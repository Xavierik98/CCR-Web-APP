import Image from "next/image";
import Link from "next/link";
import { HeroSlideshow } from "./_components/hero-slideshow";
import { Icon } from "./_components/icon";
import { Marquee } from "./_components/marquee";
import { ActualiteMedia } from "./_components/actualite-media";
import { NextActivity } from "./_components/next-activity";
import { Reveal } from "./_components/reveal";
import { RevealText } from "./_components/reveal-text";
import { TypeOnce } from "./_components/type-once";
import { TypewriterWords } from "./_components/typewriter-words";
import { VisionIcon } from "./_components/vision-icons";
import { YoutubeBackground } from "./_components/youtube-background";
import { ACTUALITES, formatDateActualite } from "./_data/actualites";
import { ADRESSE } from "./_data/contact";
import { RIB, RIB_DISPONIBLE } from "./_data/dons";
import { PHOTOS } from "./_data/galerie";
import { PILIERS } from "./_data/piliers";
import { buildWhatsAppLink } from "./_data/whatsapp";

// Structure de la page d'accueil (section 1.A du cahier des charges). Les sections
// sans donnée officielle (actualités, témoignages) restent honnêtes : aucun
// contenu générique ou inventé n'est publié à leur place.

// Couleur du trait de chaque icône de la vision, reprise du logo.
const VISION_COLORS = {
  gold: "text-ccr-gold-light",
  magenta: "text-ccr-magenta",
  blue: "text-[#6f9fe0]",
};

// Numéro WhatsApp réel à fournir : tant que la variable n'est pas définie
// (Vercel > Project Settings > Environment Variables), le bouton ne s'affiche
// pas plutôt que de pointer vers un faux numéro.
const WHATSAPP_URL = buildWhatsAppLink(
  "Bonjour CCR Famille, j'aimerais avoir des informations.",
);

const RIB_WHATSAPP_URL = buildWhatsAppLink(
  "Bonjour, je souhaite participer à la collecte par virement. Pouvez-vous m'envoyer le RIB de l'église ?",
);

export default function HomePage() {
  return (
    <main>
      <section className="relative isolate flex min-h-[520px] items-center overflow-hidden md:min-h-[640px]">
        <div className="absolute inset-0 -z-10">
          <HeroSlideshow
            images={[
              { src: "/images/hero-1.jpg", position: "center 65%" },
              { src: "/images/hero-2.jpg", position: "center 35%" },
            ]}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ccr-ink via-ccr-ink/75 to-ccr-ink/40" />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-16">
          <h1 className="animate-fade-in-up font-display text-5xl font-black leading-[1.05] tracking-tight text-ccr-cream md:text-6xl">
            La famille
            <br />
            <TypeOnce
              loop
              segments={[
                { text: "CCR", className: "text-ccr-magenta" },
                { text: " à Casablanca", className: "text-ccr-gold-light" },
              ]}
            />
          </h1>
          <p
            className="animate-fade-in-up mt-6 max-w-md text-lg text-ccr-cream/80"
            style={{ animationDelay: "150ms" }}
          >
            Une église qui accueille, qui forme et qui envoie, en plein cœur
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
              Découvrir l&rsquo;église
            </Link>
            <Link
              href="/cultes-et-programmes"
              className="rounded-full bg-ccr-gold px-6 py-3 text-sm font-semibold text-ccr-ink transition-transform hover:scale-105 hover:bg-ccr-gold-light"
            >
              Participer à un culte
            </Link>
            <a
              href={WHATSAPP_URL ?? "/contact"}
              target={WHATSAPP_URL ? "_blank" : undefined}
              rel={WHATSAPP_URL ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-ccr-ink transition-transform hover:scale-105"
            >
              <Icon name="chat" className="h-4 w-4" />
              Nous écrire sur WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Notre vision, juste après le hero : bande sombre, grandes icônes au
          trait qui se dessinent, titres en capitales (inspiration
          impactcentrechretien.com, aux couleurs CCR). */}
      <section className="relative bg-ccr-ink pb-24 pt-16 text-center text-ccr-cream">
        <div className="mx-auto max-w-6xl px-6">
          <RevealText
            as="p"
            text="Notre vision"
            className="text-xs font-semibold uppercase tracking-[0.3em] text-ccr-gold-light"
          />
          <RevealText
            as="h2"
            text="Le chemin de chaque personne qui franchit nos portes"
            className="mx-auto mt-3 max-w-2xl font-display text-3xl font-black md:text-4xl"
          />

          <div className="mt-14 grid gap-14 md:grid-cols-3 md:gap-10">
            {PILIERS.map((pilier, index) => (
              <Reveal key={pilier.nom} delay={index * 200}>
                <article className="group flex flex-col items-center">
                  <VisionIcon
                    name={pilier.nom as "Rassembler" | "Former" | "Envoyer"}
                    className={`h-24 w-24 transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105 ${VISION_COLORS[pilier.accent]}`}
                  />
                  <h3 className="mt-6 text-xl font-bold uppercase tracking-[0.15em]">
                    {pilier.nom}
                  </h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-ccr-cream/75">
                    {pilier.texte}
                  </p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ccr-cream/40">
                    {pilier.verset}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          <Link
            href="/a-propos"
            className="mt-14 inline-block rounded-full border border-ccr-cream/30 px-6 py-3 text-sm font-semibold transition-colors hover:border-ccr-gold-light hover:text-ccr-gold-light"
          >
            En savoir plus sur notre vision &rarr;
          </Link>
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
            d="M0,0 C360,60 1080,-30 1440,20 L1440,0 L0,0 Z"
            fill="currentColor"
          />
        </svg>
      </section>

      <Reveal>
        <section id="prochaines-activites" className="mx-auto max-w-6xl px-6 pb-16 pt-24">
          <RevealText as="h2" text="Prochaines activités" className="font-display text-2xl font-bold" />
          <NextActivity />
        </section>
      </Reveal>

      <Reveal>
        <section
          id="departements"
          className="relative isolate flex min-h-[420px] items-center justify-center overflow-hidden text-center"
        >
          <YoutubeBackground videoId="0INBD8VtAX0" />
          <div className="absolute inset-0 bg-ccr-ink/70" />
          <div className="relative px-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-ccr-gold-light">
              Un style de vie
            </p>
            <h2 className="mt-3 font-display text-4xl font-black text-ccr-cream md:text-5xl">
              <TypewriterWords words={["Intercession", "Prière", "Adoration", "Louange"]} />
            </h2>
            <p className="mx-auto mt-4 max-w-md text-ccr-cream/70">
              Ce que nous vivons dans nos cultes et nos réunions, porté par
              nos départements.
            </p>
            <Link
              href="/departements"
              className="mt-6 inline-block rounded-full border border-ccr-cream/40 px-6 py-3 text-sm font-semibold text-ccr-cream transition-colors hover:bg-ccr-cream/10"
            >
              Découvrir nos départements &rarr;
            </Link>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section id="galerie" className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ccr-magenta">Galerie</p>
            <RevealText
              as="h2"
              text="Une jeunesse qui vit sa foi"
              className="mt-2 font-display text-3xl font-black md:text-4xl"
            />
            <Reveal delay={200}>
              <p className="mt-3 max-w-2xl text-ccr-ink/70">
                Avec la JCCR, nos jeunes louent, servent, se forment et
                partagent de vrais moments de famille. Ils portent
                l&rsquo;église d&rsquo;aujourd&rsquo;hui et celle de demain.
              </p>
            </Reveal>
          </div>

          <div className="mt-6">
            <Marquee shuffle>
              {PHOTOS.map((photo) => (
                <div
                  key={photo.src}
                  className="relative h-48 w-48 shrink-0 overflow-hidden rounded-xl sm:h-56 sm:w-56"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="224px"
                    className="object-cover"
                  />
                </div>
              ))}
            </Marquee>
          </div>

          <Link
            href="/galerie"
            className="mt-6 inline-block px-6 text-sm font-semibold text-ccr-magenta hover:underline"
          >
            En savoir plus &rarr;
          </Link>
        </section>
      </Reveal>

      <Reveal>
        <section id="actualites" className="mx-auto max-w-6xl px-6 py-16">
          <RevealText as="h2" text="Actualités" className="font-display text-2xl font-bold" />

          {ACTUALITES.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ccr-ink/15 bg-ccr-ink/5 px-6 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ccr-blue/10 text-ccr-blue">
                <Icon name="book" className="h-6 w-6" />
              </span>
              <p className="text-sm text-ccr-ink/60">
                Aucune actualité publiée pour l&rsquo;instant. Revenez bientôt.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {ACTUALITES.slice(0, 3).map((article) => (
                  <article
                    key={article.slug}
                    className="overflow-hidden rounded-2xl border border-ccr-ink/10 bg-white transition-transform hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="relative aspect-[16/9]">
                      <ActualiteMedia
                        article={article}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ccr-magenta">
                        {formatDateActualite(article.date)}
                      </p>
                      <h3 className="mt-1 font-display text-lg font-bold">
                        {article.titre}
                      </h3>
                      <p className="mt-1 text-sm text-ccr-ink/70">
                        {article.texte}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
              <Link
                href="/actualites"
                className="mt-6 inline-block text-sm font-semibold text-ccr-magenta hover:underline"
              >
                En savoir plus &rarr;
              </Link>
            </>
          )}
        </section>
      </Reveal>

      {/* Dons et collectes par virement : le RIB n'est affiché que s'il a été
          fourni (voir _data/dons.ts), sinon on invite à le demander. */}
      <Reveal>
        <section id="soutenir" className="mx-auto max-w-6xl px-6 pb-16">
          <div className="relative overflow-hidden rounded-3xl border border-ccr-gold/30 bg-gradient-to-br from-ccr-gold/15 via-ccr-cream to-ccr-magenta/10 px-8 py-10 md:px-12">
            <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ccr-gold">Soutenir l&rsquo;œuvre</p>
                <RevealText
                  as="h2"
                  text="Participer aux collectes, aussi par virement"
                  className="mt-2 font-display text-3xl font-black"
                />
                <p className="mt-3 max-w-lg text-ccr-ink/70">
                  Dîmes, offrandes et collectes peuvent se faire sur place
                  pendant le culte ou par virement bancaire.
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 p-6 shadow-sm backdrop-blur">
                {RIB_DISPONIBLE ? (
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-ccr-ink/50">Titulaire</dt>
                      <dd className="font-semibold">{RIB.titulaire}</dd>
                    </div>
                    {RIB.banque ? (
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-ccr-ink/50">Banque</dt>
                        <dd className="font-semibold">{RIB.banque}</dd>
                      </div>
                    ) : null}
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-ccr-ink/50">RIB</dt>
                      <dd className="break-all font-mono font-semibold">{RIB.numero}</dd>
                    </div>
                  </dl>
                ) : (
                  <>
                    <p className="text-sm text-ccr-ink/70">
                      Pour recevoir les coordonnées bancaires (RIB) de
                      l&rsquo;église, écrivez-nous.
                    </p>
                    <a
                      href={RIB_WHATSAPP_URL ?? "/contact"}
                      target={RIB_WHATSAPP_URL ? "_blank" : undefined}
                      rel={RIB_WHATSAPP_URL ? "noopener noreferrer" : undefined}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-ccr-gold px-5 py-3 text-sm font-semibold text-ccr-ink transition-colors hover:bg-ccr-gold-light"
                    >
                      <Icon name="whatsapp" className="h-4 w-4" />
                      Demander le RIB
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Bloc d'appel à l'action avant le footer, juste avant de quitter la page. */}
      <Reveal>
        <section id="contact" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="rounded-3xl bg-ccr-ink px-8 py-12 text-ccr-cream md:flex md:items-center md:justify-between md:gap-10 md:px-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ccr-gold">
                Première visite ?
              </p>
              <RevealText
                as="h2"
                text="Vous êtes les bienvenus ce dimanche"
                className="mt-2 font-display text-3xl font-black md:text-4xl"
              />
              <p className="mt-3 max-w-lg text-sm text-ccr-cream/70">
                Retrouvez-nous au {ADRESSE}, ou écrivez-nous pour préparer
                votre venue ou proposer votre aide dans un département.
              </p>
            </div>
            <div className="mt-6 flex shrink-0 flex-wrap gap-3 md:mt-0">
              <Link
                href="/contact"
                className="rounded-full bg-ccr-gold px-6 py-3 text-sm font-semibold text-ccr-ink transition-colors hover:bg-ccr-gold-light"
              >
                Nous contacter
              </Link>
              <Link
                href="/departements"
                className="rounded-full border border-ccr-cream/40 px-6 py-3 text-sm font-semibold transition-colors hover:border-ccr-cream"
              >
                Servir à l&rsquo;église
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </main>
  );
}
