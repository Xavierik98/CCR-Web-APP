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
import { formatDateActualite, getActualites } from "./_data/actualites";
import { getCampagnes, periode } from "./_data/engagements";
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

export default async function HomePage() {
  const [ACTUALITES, CAMPAGNES] = await Promise.all([getActualites(), getCampagnes()]);
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
            className="animate-fade-in-up mt-8 grid gap-3 sm:flex sm:flex-wrap sm:gap-4"
            style={{ animationDelay: "300ms" }}
          >
            <Link
              href="/a-propos"
              className="order-2 rounded-2xl border border-ccr-cream/40 bg-ccr-cream/10 px-6 py-3.5 text-center text-[15px] font-semibold text-ccr-cream backdrop-blur-md transition-colors hover:bg-ccr-cream/15 active:scale-[0.98] sm:order-none sm:rounded-full sm:py-3 sm:text-sm"
            >
              Découvrir l&rsquo;église
            </Link>
            <Link
              href="/cultes-et-programmes"
              className="order-1 rounded-2xl bg-ccr-gold px-6 py-3.5 text-center text-[15px] font-semibold text-ccr-ink shadow-[0_10px_24px_-12px_rgba(227,166,56,0.9)] transition-transform hover:scale-105 hover:bg-ccr-gold-light active:scale-[0.98] sm:order-none sm:rounded-full sm:py-3 sm:text-sm"
            >
              Participer à un culte
            </Link>
            <a
              href={WHATSAPP_URL ?? "/contact"}
              target={WHATSAPP_URL ? "_blank" : undefined}
              rel={WHATSAPP_URL ? "noopener noreferrer" : undefined}
              className="order-3 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-6 py-3.5 text-[15px] font-semibold text-ccr-ink transition-transform hover:scale-105 active:scale-[0.98] sm:order-none sm:rounded-full sm:py-3 sm:text-sm"
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
      <section className="relative bg-ccr-ink pb-20 pt-14 text-center text-ccr-cream md:pb-24 md:pt-16">
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

          {/* Trois colonnes côte à côte, aussi sur mobile (en plus petit). */}
          <div className="-mx-2 mt-8 grid grid-cols-3 gap-2 md:mx-0 md:mt-14 md:gap-10">
            {PILIERS.map((pilier, index) => (
              <Reveal key={pilier.nom} delay={index * 200}>
                <article className="group flex h-full flex-col items-center rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] px-2 pb-3 pt-4 md:rounded-none md:border-0 md:bg-none md:p-0">
                  <VisionIcon
                    name={pilier.nom as "Rassembler" | "Former" | "Envoyer"}
                    className={`h-10 w-10 transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105 md:h-24 md:w-24 ${VISION_COLORS[pilier.accent]}`}
                  />
                  <h3 className="mt-2.5 text-[10px] font-bold uppercase tracking-[0.1em] md:mt-6 md:text-xl md:tracking-[0.15em]">
                    {pilier.nom}
                  </h3>
                  <p className="mt-1.5 text-[10px] leading-snug text-ccr-cream/70 md:hidden">{pilier.court}</p>
                  <p className="mt-3 hidden max-w-xs text-sm leading-relaxed text-ccr-cream/75 md:block">
                    {pilier.texte}
                  </p>
                  <p className="mt-auto pt-2 text-[8.5px] font-semibold uppercase tracking-wide text-ccr-cream/40 md:mt-3 md:pt-0 md:text-xs">
                    {pilier.verset}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          <Link
            href="/a-propos"
            className="mt-8 inline-block rounded-full border border-ccr-cream/30 md:mt-14 px-6 py-3 text-sm font-semibold transition-colors hover:border-ccr-gold-light hover:text-ccr-gold-light"
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
        <section id="prochaines-activites" className="mx-auto max-w-6xl px-5 pb-12 pt-20 sm:px-6 md:pb-16 md:pt-24">
          <RevealText as="h2" text="Prochaines activités" className="font-display text-2xl font-bold" />
          <NextActivity />
        </section>
      </Reveal>

      <Reveal>
        <section
          id="departements"
          className="relative isolate flex min-h-[320px] items-center justify-center overflow-hidden py-12 text-center md:min-h-[420px] md:py-0"
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
        <section id="galerie" className="py-12 md:py-16">
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
                    loading="eager"
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
        <section id="actualites" className="mx-auto max-w-6xl px-5 py-12 sm:px-6 md:py-16">
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
              {/* Deux colonnes côte à côte sur mobile (cartes réduites), trois sur grand écran. */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-6 lg:grid-cols-3">
                {ACTUALITES.slice(0, 3).map((article, i) => (
                  <article
                    key={article.slug}
                    className={`overflow-hidden rounded-2xl border border-ccr-ink/10 bg-white shadow-[0_10px_30px_-18px_rgba(32,28,22,0.35)] transition-transform hover:-translate-y-1 hover:shadow-md ${i === 2 ? "hidden lg:block" : ""}`}
                  >
                    <div className="relative aspect-[16/9]">
                      <ActualiteMedia
                        article={article}
                        sizes="(min-width: 1024px) 33vw, 50vw"
                      />
                    </div>
                    <div className="p-3 sm:p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-ccr-magenta sm:text-xs">
                        {article.evenement ? "Événement, " : ""}
                        {formatDateActualite(article.date)}
                      </p>
                      <h3 className="mt-1 line-clamp-2 font-display text-sm font-bold leading-snug sm:text-lg">
                        {article.titre}
                      </h3>
                      {/* Texte limité à trois lignes : les cartes gardent la même hauteur. */}
                      <p className="mt-1 line-clamp-3 text-xs text-ccr-ink/70 sm:text-sm">
                        {article.texte}
                      </p>
                      <Link href={`/actualites#${article.slug}`} className="mt-2 inline-block text-xs font-semibold text-ccr-magenta hover:underline sm:text-sm">
                        Lire la suite
                      </Link>
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

      {/* Demande de soutien mise en avant : toute personne dans le besoin doit
          trouver tout de suite comment demander de l'aide. */}
      <Reveal>
        <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 md:pb-12">
          <Link
            href="/demande-de-soutien"
            className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-white/70 bg-white/60 p-5 shadow-[0_20px_50px_-30px_rgba(218,41,121,0.45),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition-transform hover:-translate-y-0.5 sm:gap-6 sm:p-7"
          >
            <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-ccr-magenta/15 blur-3xl" />
            {/* Symbole de l'Association Cœur Solidaire, qui accompagne les demandes de soutien. */}
            <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-lg shadow-ccr-magenta/20 ring-1 ring-ccr-magenta/10 sm:h-20 sm:w-20 sm:p-2.5">
              <Image src="/images/partenaires/coeur-solidaire-symbole.png" alt="Association Cœur Solidaire" width={80} height={74} className="h-full w-full object-contain" />
            </span>
            <span className="relative min-w-0 flex-1">
              <span className="block font-display text-lg font-bold leading-tight sm:text-2xl">Vous traversez une période difficile ?</span>
              <span className="mt-1 block text-xs text-ccr-ink/70 sm:text-sm">
                L&rsquo;accompagnement social de l&rsquo;église peut vous aider (denrées alimentaires, produits de première nécessité). Faites une demande en toute discrétion.
              </span>
            </span>
            <span className="relative hidden shrink-0 rounded-full bg-ccr-ink px-5 py-2.5 text-sm font-semibold text-ccr-cream transition-colors group-hover:bg-ccr-magenta sm:inline-block">
              Demander un soutien
            </span>
            <span aria-hidden="true" className="relative text-xl text-ccr-magenta sm:hidden">&rarr;</span>
          </Link>
        </section>
      </Reveal>

      {/* Dons et collectes par virement : le RIB n'est affiché que s'il a été
          fourni (voir _data/dons.ts), sinon on invite à le demander. */}
      <Reveal>
        <section id="soutenir" className="mx-auto max-w-6xl scroll-mt-32 px-4 pb-10 sm:px-6 md:pb-16">
          <div className="relative overflow-hidden rounded-3xl border border-ccr-gold/30 bg-gradient-to-br from-ccr-gold/15 via-ccr-cream to-ccr-magenta/10 px-5 py-6 sm:px-8 sm:py-10 md:px-12">
            <div className="grid gap-5 sm:gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ccr-gold">Soutenir l&rsquo;œuvre</p>
                <RevealText
                  as="h2"
                  text="Participer aux collectes, aussi par virement"
                  className="mt-2 font-display text-2xl font-black sm:text-3xl"
                />
                <p className="mt-2 max-w-lg text-sm text-ccr-ink/70 sm:mt-3 sm:text-base">
                  Dîmes, offrandes et collectes peuvent se faire sur place
                  pendant le culte ou par virement bancaire.
                </p>
                <Link
                  href="/engagement"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-ccr-ink/20 bg-white/70 px-5 py-2.5 text-sm font-semibold backdrop-blur transition-colors hover:border-ccr-ink"
                >
                  Prendre un engagement (loyer, campagnes) &rarr;
                </Link>
              </div>
              <div className="rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6">
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
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ccr-gold px-5 py-3 text-sm font-semibold text-ccr-ink transition-colors hover:bg-ccr-gold-light sm:mt-4 sm:w-auto sm:rounded-full"
                    >
                      <Icon name="whatsapp" className="h-4 w-4" />
                      Demander le RIB
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Campagnes ouvertes aux engagements, gérées par la trésorerie dans l'intranet. */}
            {CAMPAGNES.length ? (
              <div className="mt-6 border-t border-ccr-ink/10 pt-5 sm:mt-8 sm:pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ccr-magenta">Campagnes en cours</p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                  {CAMPAGNES.slice(0, 3).map((c) => (
                    <Link key={c.id} href={`/engagement/${c.id}`} className="group overflow-hidden rounded-2xl bg-white/85 shadow-sm ring-1 ring-ccr-ink/5 backdrop-blur transition-transform hover:-translate-y-0.5">
                      {c.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.image} alt="" className="aspect-[16/9] w-full object-cover" />
                      ) : (
                        <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-ccr-gold to-ccr-magenta p-3 text-center font-display text-sm font-black text-white sm:text-lg">{c.nom}</div>
                      )}
                      <div className="p-3">
                        <p className="line-clamp-1 text-sm font-bold">{c.nom}</p>
                        <p className="line-clamp-1 text-[11px] text-ccr-ink/60">{c.mensuel ? "Chaque mois" : periode(c)}</p>
                        <p className="mt-1 text-xs font-semibold text-ccr-magenta group-hover:underline">Je m&rsquo;engage &rarr;</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </Reveal>

      {/* Bloc d'appel à l'action avant le footer, juste avant de quitter la page. */}
      <Reveal>
        <section id="contact" className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 md:pb-20">
          <div className="rounded-3xl bg-ccr-ink px-5 py-7 text-ccr-cream sm:px-8 sm:py-12 md:flex md:items-center md:justify-between md:gap-10 md:px-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ccr-gold">
                Première visite ?
              </p>
              <RevealText
                as="h2"
                text="Vous êtes les bienvenus ce dimanche"
                className="mt-2 font-display text-2xl font-black sm:text-3xl md:text-4xl"
              />
              <p className="mt-3 max-w-lg text-sm text-ccr-cream/70">
                Retrouvez-nous au {ADRESSE}, ou écrivez-nous pour préparer
                votre venue ou proposer votre aide dans un département.
              </p>
            </div>
            <div className="mt-5 grid shrink-0 grid-cols-2 gap-2 sm:mt-6 sm:flex sm:flex-wrap sm:gap-3 md:mt-0">
              <Link
                href="/contact"
                className="rounded-2xl bg-ccr-gold px-4 py-3 text-center text-sm font-semibold text-ccr-ink transition-colors hover:bg-ccr-gold-light sm:rounded-full sm:px-6"
              >
                Nous contacter
              </Link>
              <Link
                href="/departements"
                className="rounded-2xl border border-ccr-cream/40 px-4 py-3 text-center text-sm font-semibold transition-colors hover:border-ccr-cream sm:rounded-full sm:px-6"
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
