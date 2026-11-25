import type { Metadata } from "next";

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
  },
  {
    jour: "Lundi",
    titre: "Cours d'affermissement",
    horaire: "20h30 - 21h30",
  },
  {
    jour: "Mardi",
    titre: "Intercession",
    horaire: "19h30 - 21h30",
  },
  {
    jour: "Mercredi",
    titre: "Eglise de maison",
    horaire: "19h30 - 21h00",
    description:
      "Rassemblement dans vos quartiers respectifs, dans une maison choisie au prealable, en communion fraternelle autour de la Parole de Dieu.",
  },
  {
    jour: "Vendredi",
    titre: "Culte de delivrance",
    horaire: "19h30 - 21h30",
  },
  {
    jour: "Samedi",
    titre: "Priere de la jeunesse",
    horaire: "21h00 - 21h30",
    description: "30 minutes de priere.",
  },
  {
    jour: "Dimanche",
    titre: "Rassemblement dominical",
    horaire: "10h30 - 13h30",
  },
];

export default function CultesEtProgrammesPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl font-black">Cultes et programmes</h1>
      <p className="mt-3 text-ccr-ink/70">
        Toute la semaine, il y a un moment pour se rassembler, prier et
        grandir ensemble.
      </p>

      <ol className="mt-10 divide-y divide-ccr-ink/10 border-y border-ccr-ink/10">
        {PROGRAMME.map((item) => (
          <li key={item.titre} className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:gap-6">
            <span className="shrink-0 text-sm font-semibold uppercase tracking-wide text-ccr-magenta sm:w-40">
              {item.jour}
            </span>
            <div>
              <p className="font-display text-lg font-bold">
                {item.titre}
                <span className="ml-3 font-body text-sm font-semibold text-ccr-blue">
                  {item.horaire}
                </span>
              </p>
              {item.description ? (
                <p className="mt-1 text-sm text-ccr-ink/70">{item.description}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
