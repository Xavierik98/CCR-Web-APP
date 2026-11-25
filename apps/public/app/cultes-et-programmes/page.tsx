import type { Metadata } from "next";
import { Icon } from "../_components/icon";

export const metadata: Metadata = {
  title: "Cultes et programmes",
  description:
    "Horaires des cultes, prieres et reunions de la semaine a CCR Famille, Casablanca.",
};

// Section 1.D du cahier des charges. Horaires fournis par le client (25/11) ;
// editables depuis l'intranet une fois le CMS cable (section 6), sans toucher au code.
const PROGRAMME = [
  {
    jour: "Lundi a vendredi",
    titre: "Priere de minuit",
    horaire: "00h00 - 00h30",
    description: "30 minutes de priere chaque nuit.",
    icon: "clock",
    accent: "gold",
  },
  {
    jour: "Lundi",
    titre: "Cours d'affermissement",
    horaire: "20h30 - 21h30",
    icon: "book",
    accent: "blue",
  },
  {
    jour: "Mardi",
    titre: "Intercession",
    horaire: "19h30 - 21h30",
    icon: "spark",
    accent: "magenta",
  },
  {
    jour: "Mercredi",
    titre: "Eglise de maison",
    horaire: "19h30 - 21h00",
    description:
      "Rassemblement dans vos quartiers respectifs, dans une maison choisie au prealable, en communion fraternelle autour de la Parole de Dieu.",
    icon: "home",
    accent: "gold",
    span: true,
  },
  {
    jour: "Vendredi",
    titre: "Culte de delivrance",
    horaire: "19h30 - 21h30",
    icon: "bolt",
    accent: "magenta",
  },
  {
    jour: "Samedi",
    titre: "Priere de la jeunesse",
    horaire: "21h00 - 21h30",
    description: "30 minutes de priere.",
    icon: "star",
    accent: "blue",
  },
  {
    jour: "Dimanche",
    titre: "Rassemblement dominical",
    horaire: "10h30 - 13h30",
    icon: "users",
    accent: "gold",
    featured: true,
  },
] as const;

const ACCENTS = {
  gold: { text: "text-ccr-gold", bg: "bg-ccr-gold/10" },
  magenta: { text: "text-ccr-magenta", bg: "bg-ccr-magenta/10" },
  blue: { text: "text-ccr-blue", bg: "bg-ccr-blue/10" },
};

export default function CultesEtProgrammesPage() {
  return (
    <main>
      {/* Hero sombre : met en valeur le programme de la semaine, inspire du
          genre de benjamindeleuzetrading.com (fond sombre, halos de couleur,
          badge, grand titre centre). */}
      <section className="relative overflow-hidden bg-ccr-ink py-20 text-center text-ccr-cream">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-ccr-magenta/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-ccr-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-6rem] left-1/3 h-72 w-72 rounded-full bg-ccr-blue/20 blur-3xl" />

        <div className="relative mx-auto max-w-2xl px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-ccr-cream/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-ccr-gold-light">
            <span className="h-1.5 w-1.5 rounded-full bg-ccr-gold-light" />
            Cultes &amp; programmes
          </span>
          <h1 className="mt-5 font-display text-4xl font-black leading-tight md:text-5xl">
            Toute la semaine, un temps pour grandir ensemble
          </h1>
          <p className="mt-4 text-ccr-cream/70">
            Priere, enseignement, communion fraternelle : chaque jour a son
            rendez-vous.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAMME.map((item) => {
            const accent = ACCENTS[item.accent];
            return (
              <article
                key={item.titre}
                className={`rounded-2xl border border-ccr-ink/10 p-6 ${
                  "featured" in item && item.featured
                    ? "bg-ccr-ink text-ccr-cream sm:col-span-2 lg:col-span-1"
                    : "bg-white"
                } ${"span" in item && item.span ? "sm:col-span-2" : ""}`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    "featured" in item && item.featured
                      ? "bg-ccr-cream/10 text-ccr-gold-light"
                      : `${accent.bg} ${accent.text}`
                  }`}
                >
                  <Icon name={item.icon} className="h-5 w-5" />
                </div>

                <p
                  className={`mt-4 text-xs font-semibold uppercase tracking-wide ${
                    "featured" in item && item.featured
                      ? "text-ccr-gold-light"
                      : accent.text
                  }`}
                >
                  {item.jour}
                </p>
                <h2 className="mt-1 font-display text-xl font-bold">
                  {item.titre}
                </h2>
                <p
                  className={`mt-1 text-sm font-semibold ${
                    "featured" in item && item.featured
                      ? "text-ccr-cream/80"
                      : "text-ccr-ink/60"
                  }`}
                >
                  {item.horaire}
                </p>
                {"description" in item ? (
                  <p
                    className={`mt-3 text-sm ${
                      "featured" in item && item.featured
                        ? "text-ccr-cream/70"
                        : "text-ccr-ink/60"
                    }`}
                  >
                    {item.description}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
