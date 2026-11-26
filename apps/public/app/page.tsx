import Image from "next/image";
import Link from "next/link";
import { HeroSlideshow } from "./_components/hero-slideshow";
import { Icon } from "./_components/icon";
import { Marquee } from "./_components/marquee";
import { NextActivity } from "./_components/next-activity";
import { Reveal } from "./_components/reveal";
import { TypeOnce } from "./_components/type-once";
import { TypewriterWords } from "./_components/typewriter-words";
import { YoutubeBackground } from "./_components/youtube-background";
import { ACTUALITES } from "./_data/actualites";
import { ADRESSE } from "./_data/contact";
import { PHOTOS } from "./_data/galerie";
import { PILIERS } from "./_data/piliers";
import { buildWhatsAppLink } from "./_data/whatsapp";

// Structure de la page d'accueil (section 1.A du cahier des charges). Les sections
// sans donnée officielle (actualités, témoignages) restent honnêtes : aucun
// contenu générique ou inventé n'est publié à leur place.

const LIENS_RAPIDES = [
  { href: "/departements", label: "Nos départements", icon: "spark" as const },
  { href: "/cultes-et-programmes", label: "Cultes et programmes", icon: "clock" as const },
  { href: "/departements", label: "Servir", icon: "heart" as const },
  { href: "/contact", label: "Nous trouver", icon: "map" as const },
];

const ACCENTS = {
  gold: { text: "text-ccr-gold", bg: "bg-ccr-gold/10" },
  magenta: { text: "text-ccr-magenta", bg: "bg-ccr-magenta/10" },
  blue: { text: "text-ccr-blue", bg: "bg-ccr-blue/10" },
};

// Numéro WhatsApp réel à fournir : tant que la variable n'est pas définie
// (Vercel > Project Settings > Environment Variables), le bouton ne s'affiche
// pas plutôt que de pointer vers un faux numéro.
const WHATSAPP_URL = buildWhatsAppLink(
  "Bonjour CCR Famille, j'aimerais avoir des informations.",
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

      {/* Bande de liens rapides, inspirée de la bande d'icônes d'impactcentrechretien.com */}
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
            décrivent le chemin de chaque personne qui franchit nos portes.
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
          <h2 className="font-display text-2xl font-bold">Prochaines activités</h2>
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
            <h2 className="font-display text-2xl font-bold">Galerie</h2>
            <p className="mt-2 max-w-xl text-sm text-ccr-ink/70">
              Quelques images et vidéos de la vie de l&rsquo;église.
            </p>
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
          <h2 className="font-display text-2xl font-bold">Actualités</h2>

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
                      <Image
                        src={article.image}
                        alt={article.titre}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg font-bold">
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

      {/* Bloc d'appel à l'action avant le footer, juste avant de quitter la page. */}
      <Reveal>
        <section id="contact" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="rounded-3xl bg-ccr-ink px-8 py-12 text-ccr-cream md:flex md:items-center md:justify-between md:gap-10 md:px-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ccr-gold">
                Première visite ?
              </p>
              <h2 className="mt-2 font-display text-3xl font-black md:text-4xl">
                Vous êtes les bienvenus ce dimanche
              </h2>
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
