import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "./_components/contact-form";
import { Icon } from "../_components/icon";
import { Reveal } from "../_components/reveal";
import { RevealText } from "../_components/reveal-text";
import { ACCES_TRAM, ADRESSE, MAPS_DIRECTIONS_URL, MAPS_EMBED_SRC } from "../_data/contact";
import { PROGRAMME } from "../_data/programme";

export const metadata: Metadata = {
  title: "Nous trouver et contact",
  description: "Adresse, accès en tramway, horaires des cultes et formulaire de contact de CCR Famille Casablanca.",
};

// Rendez-vous qui ont lieu à l'église même (l'église de maison se tient dans
// les quartiers et la prière de minuit chaque nuit, ils ne sont pas listés ici).
const HORAIRES = PROGRAMME.filter((item) =>
  ["Dimanche", "Mardi", "Vendredi"].includes(item.jour),
).sort((a, b) => (a.jour === "Dimanche" ? -1 : b.jour === "Dimanche" ? 1 : 0));

const SUJETS = [
  "Préparer ma première visite",
  "Demande d'information",
  "Demande de prière",
  "Rejoindre un département",
  "Autre",
];

export default function ContactPage() {
  return (
    <main>
      {/* Bandeau photo (l'assemblée réunie) assombri pour la lisibilité, qui se
          fond vers le contenu clair par une vague en mouvement doux. */}
      <section className="relative overflow-hidden bg-ccr-ink pb-32 pt-20 text-ccr-cream md:pt-28">
        <Image
          src="/images/galerie/photo-22.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="animate-slow-zoom object-cover object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ccr-ink via-ccr-ink/85 to-ccr-ink/40" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ccr-ink/70 via-transparent to-ccr-ink/30" />
        <div className="relative mx-auto max-w-6xl px-6">
          <RevealText
            as="h1"
            text="Nous trouver & Contact"
            className="font-display text-5xl font-black md:text-6xl"
          />
          <Reveal delay={250}>
            <p className="mt-4 max-w-xl text-ccr-cream/80">
              Vous préparez votre première visite à Casablanca ou souhaitez
              échanger avec notre équipe ? Nous serons heureux de vous
              accueillir.
            </p>
          </Reveal>
        </div>
        {/* Deux vagues superposées qui glissent à des vitesses différentes. */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-20 overflow-hidden">
          <svg viewBox="0 0 2880 80" preserveAspectRatio="none" className="animate-wave-slide-slow absolute bottom-0 left-0 h-full w-[200%] text-ccr-cream/40">
            <path d="M0,45 C360,10 720,80 1440,45 C1800,10 2160,80 2880,45 L2880,80 L0,80 Z" fill="currentColor" />
          </svg>
          <svg viewBox="0 0 2880 80" preserveAspectRatio="none" className="animate-wave-slide absolute bottom-0 left-0 h-full w-[200%] text-ccr-cream">
            <path d="M0,50 C360,80 1080,20 1440,50 C1800,80 2520,20 2880,50 L2880,80 L0,80 Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* Côte à côte sur tous les écrans, comme sur ordinateur : informations à
          gauche (version compacte sur téléphone), formulaire à droite. */}
      <section className="mx-auto -mt-10 grid max-w-6xl grid-cols-[0.82fr_1.18fr] items-start gap-2.5 px-3 pb-12 sm:gap-8 sm:px-6 sm:pb-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-2.5 sm:space-y-6">
          <Reveal>
            <div className="animate-swell rounded-2xl bg-white p-3 shadow-[0_20px_50px_-25px_rgba(32,28,22,0.35)] sm:rounded-3xl sm:p-8">
              <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 bg-ccr-gold text-ccr-ink">
                  <Icon name="map" className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <div>
                  <h2 className="font-display text-sm font-bold sm:text-xl">Adresse</h2>
                  <p className="mt-1 text-[11px] leading-snug text-ccr-ink/70 sm:text-sm">
                    CCR Famille, Centre Chrétien de Restauration
                    <br />
                    {ADRESSE}
                  </p>
                </div>
              </div>

              <div className="my-3 h-px bg-ccr-ink/10 sm:my-6" />

              <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 bg-ccr-magenta text-ccr-cream">
                  <Icon name="clock" className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <div>
                  <h2 className="font-display text-sm font-bold sm:text-xl">Horaires des cultes</h2>
                  <ul className="mt-1 space-y-1 text-[11px] leading-snug text-ccr-ink/70 sm:text-sm">
                    {HORAIRES.map((item) => (
                      <li key={item.titre}>
                        <span className="font-semibold text-ccr-ink">{item.jour}</span> :{" "}
                        {item.horaire.replace(" - ", " à ")} ({item.titre})
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/cultes-et-programmes"
                    className="mt-2 inline-block text-[11px] font-semibold text-ccr-magenta hover:underline sm:text-sm"
                  >
                    Tout le programme &rarr;
                  </Link>
                </div>
              </div>

              <div className="my-3 h-px bg-ccr-ink/10 sm:my-6" />

              <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 bg-ccr-blue text-ccr-cream">
                  <Icon name="mail" className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <div>
                  <h2 className="font-display text-sm font-bold sm:text-xl">Coordonnées</h2>
                  <p className="mt-1 text-[11px] leading-snug text-ccr-ink/70 sm:text-sm">
                    Téléphone et e-mail à venir. En attendant, écrivez-nous
                    avec le formulaire.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="flex flex-col gap-1.5 rounded-2xl bg-ccr-gold/15 p-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ccr-gold/30 text-ccr-ink sm:h-10 sm:w-10">
                <Icon name="tram" className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <p className="text-[11px] leading-snug text-ccr-ink/80 sm:text-sm">{ACCES_TRAM}</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={100}>
          <div className="animate-swell-late h-full rounded-2xl border-2 border-ccr-gold/40 bg-white p-3 shadow-[0_20px_50px_-25px_rgba(32,28,22,0.35)] sm:rounded-3xl sm:p-8">
            <h2 className="font-display text-base font-bold sm:text-2xl">Écrire à l&rsquo;équipe</h2>
            <p className="mt-1 hidden text-sm text-ccr-ink/60 sm:block">
              Une question, une demande de prière ou l&rsquo;envie de rejoindre
              un département ? Laissez-nous un message.
            </p>
            {/* Le message arrive dans l'intranet, rubrique « Messages du site ». */}
            <ContactForm sujets={SUJETS} />
          </div>
        </Reveal>
      </section>

      {/* Carte pleine largeur, avec une carte d'accès posée dessus. */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl ring-1 ring-ccr-ink/10">
            <iframe
              title={`Localisation CCR Famille - ${ADRESSE}`}
              src={MAPS_EMBED_SRC}
              className="block h-[300px] w-full sm:h-[420px] md:h-[480px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            {/* Sur téléphone, la carte d'accès passe sous le plan pour ne pas le masquer. */}
            <div className="md:pointer-events-none md:absolute md:left-6 md:top-6 md:max-w-xs">
              <div className="bg-ccr-ink p-5 text-ccr-cream md:pointer-events-auto md:rounded-2xl md:bg-ccr-ink/90 md:shadow-xl md:backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ccr-gold-light">
                  Nous trouver
                </p>
                <p className="mt-2 text-sm">{ADRESSE}</p>
                <p className="mt-2 flex items-start gap-2 text-sm text-ccr-cream/70">
                  <Icon name="tram" className="mt-0.5 h-4 w-4 shrink-0 text-ccr-gold-light" />
                  {ACCES_TRAM}
                </p>
                <a
                  href={MAPS_DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-ccr-gold px-5 py-2 text-sm font-semibold text-ccr-ink transition-colors hover:bg-ccr-gold-light"
                >
                  <Icon name="route" className="h-4 w-4" />
                  Itinéraire
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
