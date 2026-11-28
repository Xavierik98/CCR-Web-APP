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

      {/* Côte à côte sur tous les écrans : informations à gauche (version
          compacte sur téléphone), formulaire à droite. Sur ordinateur, le plan
          complète la colonne de gauche pour qu'elle ait la hauteur du formulaire. */}
      <section className="mx-auto -mt-10 grid max-w-6xl grid-cols-[0.8fr_1.2fr] items-stretch gap-2 px-3 pb-10 sm:gap-8 sm:px-6 sm:pb-16 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal className="flex flex-col gap-2 sm:gap-6">
          <div className="animate-swell rounded-2xl bg-white p-3 shadow-[0_20px_50px_-25px_rgba(32,28,22,0.35)] sm:rounded-3xl sm:p-7">
            {[
              {
                icon: "map" as const,
                color: "bg-ccr-gold text-ccr-ink",
                titre: "Adresse",
                body: (
                  <>
                    <span className="hidden sm:inline">CCR Famille, Centre Chrétien de Restauration<br /></span>
                    {ADRESSE}
                  </>
                ),
              },
              {
                icon: "clock" as const,
                color: "bg-ccr-magenta text-ccr-cream",
                titre: "Cultes",
                body: (
                  <>
                    {HORAIRES.map((item) => (
                      <span key={item.titre} className="block">
                        <span className="font-semibold text-ccr-ink">{item.jour.slice(0, 3)}.</span> {item.horaire.replace(" - ", "-")}
                        <span className="hidden sm:inline"> ({item.titre})</span>
                      </span>
                    ))}
                    <Link href="/cultes-et-programmes" className="mt-1 inline-block font-semibold text-ccr-magenta hover:underline">
                      Programme &rarr;
                    </Link>
                  </>
                ),
              },
              {
                icon: "tram" as const,
                color: "bg-ccr-blue text-ccr-cream",
                titre: "Accès",
                body: ACCES_TRAM,
              },
              {
                icon: "mail" as const,
                color: "bg-ccr-ink text-ccr-cream",
                titre: "Coordonnées",
                body: "À venir. Écrivez-nous avec le formulaire.",
              },
            ].map((row, i) => (
              <div key={row.titre} className={i ? "mt-3 border-t border-ccr-ink/10 pt-3 sm:mt-5 sm:pt-5" : ""}>
                <div className="flex items-center gap-2 sm:items-start sm:gap-4">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${row.color}`}>
                    <Icon name={row.icon} className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                  </span>
                  <h2 className="font-display text-sm font-bold sm:hidden">{row.titre}</h2>
                  <div className="hidden min-w-0 sm:block">
                    <h2 className="font-display text-lg font-bold">{row.titre}</h2>
                    <div className="mt-0.5 text-sm leading-relaxed text-ccr-ink/70">{row.body}</div>
                  </div>
                </div>
                <div className="mt-1 text-[11px] leading-snug text-ccr-ink/70 sm:hidden">{row.body}</div>
              </div>
            ))}
          </div>

          {/* Le plan remplit l'espace restant sous les informations (téléphone et ordinateur). */}
          <div className="relative min-h-[180px] flex-1 overflow-hidden rounded-2xl ring-1 ring-ccr-ink/10 sm:min-h-[240px] sm:rounded-3xl">
            <iframe
              title={`Plan d'accès CCR Famille - ${ADRESSE}`}
              src={MAPS_EMBED_SRC}
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              href={MAPS_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-ccr-ink/90 px-3 py-1.5 text-xs font-semibold text-ccr-cream shadow-lg backdrop-blur hover:bg-ccr-ink sm:bottom-3 sm:left-3 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
            >
              <Icon name="route" className="h-3.5 w-3.5 text-ccr-gold-light sm:h-4 sm:w-4" />
              Itinéraire
            </a>
          </div>
        </Reveal>

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

    </main>
  );
}
