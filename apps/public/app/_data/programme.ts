// Section 1.D du cahier des charges. Horaires fournis par le client (25/11) ;
// éditables depuis l'intranet une fois le CMS câblé (section 6), sans toucher au code.
export const PROGRAMME = [
  {
    jour: "Lundi à vendredi",
    titre: "Prière de minuit",
    horaire: "00h00 - 00h30",
    description: "30 minutes de prière chaque nuit.",
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
    titre: "Église de maison",
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
    horaire: "19h30 - 21h30",
    icon: "bolt",
    accent: "magenta",
  },
  {
    jour: "Samedi",
    titre: "Prière de la jeunesse",
    horaire: "21h00 - 21h30",
    description: "30 minutes de prière.",
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

export type ProgrammeItem = (typeof PROGRAMME)[number];

export const ACCENTS = {
  gold: { text: "text-ccr-gold", bg: "bg-ccr-gold/10" },
  magenta: { text: "text-ccr-magenta", bg: "bg-ccr-magenta/10" },
  blue: { text: "text-ccr-blue", bg: "bg-ccr-blue/10" },
};
