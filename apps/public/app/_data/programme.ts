// Section 1.D du cahier des charges. Horaires fournis par le client (25/11) ;
// éditables depuis l'intranet une fois le CMS câblé (section 6), sans toucher au code.
export const PROGRAMME = [
  {
    jour: "Lundi à vendredi",
    titre: "Prière de minuit",
    image: "/images/programme/priere-de-minuit.jpg",
    horaire: "00h00 - 00h30",
    description: "30 minutes de prière chaque nuit.",
    icon: "clock",
    accent: "gold",
  },
  {
    jour: "Lundi",
    titre: "Cours d'affermissement",
    image: "/images/about/photo-3.jpg",
    horaire: "20h30 - 21h30",
    icon: "book",
    accent: "blue",
  },
  {
    jour: "Mardi",
    titre: "Intercession",
    image: "/images/galerie/photo-4.jpg",
    horaire: "19h30 - 21h30",
    icon: "spark",
    accent: "magenta",
  },
  {
    jour: "Mercredi",
    titre: "Église de maison",
    image: "/images/galerie/photo-1.jpg",
    horaire: "19h30 - 21h00",
    description:
      "Rassemblement dans vos quartiers respectifs, dans une maison choisie au préalable, en communion fraternelle autour de la Parole de Dieu.",
    icon: "home",
    accent: "gold",
    span: true,
  },
  {
    jour: "Vendredi",
    titre: "Culte de délivrance",
    image: "/images/hero-1.jpg",
    horaire: "19h30 - 21h30",
    icon: "bolt",
    accent: "magenta",
  },
  {
    jour: "Samedi",
    titre: "Prière de la jeunesse",
    image: "/images/galerie/photo-3.jpg",
    horaire: "21h00 - 21h30",
    description: "30 minutes de prière.",
    icon: "star",
    accent: "blue",
  },
  {
    jour: "Dimanche",
    titre: "Rassemblement dominical",
    image: "/images/about/photo-2.jpg",
    horaire: "10h30 - 13h30",
    icon: "users",
    accent: "gold",
    featured: true,
  },
] as const;

export type ProgrammeItem = (typeof PROGRAMME)[number];

export const ACCENTS = {
  gold: { text: "text-ccr-gold", bg: "bg-ccr-gold/10" },
  magenta: { text: "text-ccr-magenta", bg: "bg-ccr-magenta/10" },
  blue: { text: "text-ccr-blue", bg: "bg-ccr-blue/10" },
};

// Jours de la semaine au sens de Date.getDay() (0 = dimanche).
const JOURS: Record<string, number[]> = {
  Dimanche: [0],
  Lundi: [1],
  Mardi: [2],
  Mercredi: [3],
  Jeudi: [4],
  Vendredi: [5],
  Samedi: [6],
  "Lundi à vendredi": [1, 2, 3, 4, 5],
};

// Calcule la prochaine occurrence (date + heure) d'un élément du programme
// hebdomadaire à partir d'une date de référence, pour que "Prochaines
// activités" bascule automatiquement sans intervention manuelle. Une
// modification ponctuelle par un administrateur (via le futur CMS) restera
// prioritaire une fois ce module câblé.
export function getNextOccurrence(item: ProgrammeItem, from: Date): Date {
  const [heureDebut] = item.horaire.split(" - ");
  const [heures, minutes] = heureDebut.split("h").map(Number);
  const jours = JOURS[item.jour] ?? [];

  let meilleure: Date | null = null;
  for (const jour of jours) {
    const candidate = new Date(from);
    const decalage = (jour - from.getDay() + 7) % 7;
    candidate.setDate(from.getDate() + decalage);
    candidate.setHours(heures, minutes, 0, 0);
    if (candidate <= from) {
      candidate.setDate(candidate.getDate() + 7);
    }
    if (!meilleure || candidate < meilleure) {
      meilleure = candidate;
    }
  }

  return meilleure ?? from;
}

export function getNextActivity(
  programme: readonly ProgrammeItem[],
  from: Date,
): { item: ProgrammeItem; date: Date } {
  let meilleur = { item: programme[0], date: getNextOccurrence(programme[0], from) };
  for (const item of programme) {
    const date = getNextOccurrence(item, from);
    if (date < meilleur.date) {
      meilleur = { item, date };
    }
  }
  return meilleur;
}
