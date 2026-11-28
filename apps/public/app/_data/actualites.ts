// En attendant que le site public lise les actualités gérées dans l'intranet,
// les annonces sont ajoutées ici à la main. Chaque entrée reprend uniquement
// ce qui figure sur le visuel fourni par le client, sans information ajoutée.
export type Actualite = {
  slug: string;
  titre: string;
  texte: string;
  date: string; // AAAA-MM-JJ, date de l'événement
  image: string | null;
  video?: string | null;
  // Événement exceptionnel publié depuis l'intranet : heure et lieu.
  evenement?: boolean;
  heure?: string | null;
  lieu?: string | null;
  // Affiche verticale : montrée en entier dans le cadre, sur un fond flouté
  // tiré de l'affiche elle-même, au lieu d'être rognée.
  portrait?: boolean;
};

const LISTE: Actualite[] = [
  {
    slug: "nuit-de-priere-traversee-2026-2027",
    titre: "Nuit de prière Traversée",
    texte:
      "Banquet de la nouvelle saison. Jeudi 31 décembre, de 20h à 2h, au CCR Casablanca. Dress code : rouge, doré, blanc.",
    date: "2026-12-31",
    image: "/images/actualites/traversee-2026-2027-affiche.webp",
  },
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

const INTRANET_URL = process.env.NEXT_PUBLIC_INTRANET_URL ?? "https://ccr-famille-intranet.vercel.app";

// Actualités du site : celles publiées depuis l'intranet (dont les appels aux
// dons du social), triées par date. Si l'intranet ne répond pas, la liste
// de secours ci-dessus s'affiche.
export async function getActualites(): Promise<Actualite[]> {
  try {
    const res = await fetch(`${INTRANET_URL}/api/actualites`, { next: { revalidate: 300 } });
    if (!res.ok) return ACTUALITES;
    // Toutes les actualités sont gérées dans l'intranet (modifiables et
    // supprimables là-bas). La liste écrite ici ne sert que si l'intranet ne répond pas.
    const local = (u: string | null | undefined) => u?.replace(/^https?:\/\/ccr-famille-public\.vercel\.app/, "") || null;
    const live = ((await res.json()) as Actualite[]).map((a) => ({ ...a, image: local(a.image), video: local(a.video) }));
    return live.sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return ACTUALITES;
  }
}

export function formatDateActualite(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
