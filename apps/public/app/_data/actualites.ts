// En attendant que le site public lise les actualités gérées dans l'intranet,
// les annonces sont ajoutées ici à la main. Chaque entrée reprend uniquement
// ce qui figure sur le visuel fourni par le client, sans information ajoutée.
export type Actualite = {
  slug: string;
  titre: string;
  texte: string;
  date: string; // AAAA-MM-JJ, date de l'événement
  image: string;
  video?: string;
};

const LISTE: Actualite[] = [
  {
    slug: "21-jours-de-jeune-et-prieres",
    titre: "21 jours de jeûnes et prières",
    texte:
      "En décembre 2026, de 00h à 18h. Lieu de rassemblement : CCR Casablanca.",
    date: "2026-12-01",
    image: "/images/actualites/21-jours-jeune-et-priere.jpg",
  },
  {
    slug: "gospel-culture-day",
    titre: "Gospel Culture Day",
    texte: "Retour en vidéo sur la journée du 12 septembre 2026.",
    date: "2026-09-12",
    image: "/images/actualites/gospel-culture-day.jpg",
    video: "/videos/gospel-culture-day.mp4",
  },
];

export const ACTUALITES = [...LISTE].sort((a, b) => b.date.localeCompare(a.date));

export function formatDateActualite(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
