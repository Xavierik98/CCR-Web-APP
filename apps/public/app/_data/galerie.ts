// Photos fournies par le client (25/11). D'autres seront ajoutées depuis
// l'intranet une fois le stockage Supabase câblé (section 7 du cahier des charges).
export const PHOTOS = [
  { src: "/images/galerie/photo-1.jpg", alt: "Moment de communion en famille" },
  { src: "/images/galerie/photo-2.jpg", alt: "Sortie en famille" },
  { src: "/images/galerie/photo-3.jpg", alt: "Moment de communion en famille" },
  { src: "/images/galerie/photo-4.jpg", alt: "Temps de louange" },
  { src: "/images/galerie/photo-5.jpg", alt: "Rencontre et remise de livres" },
  { src: "/images/galerie/photo-6.jpg", alt: "Dédicace de livres" },
  { src: "/images/galerie/photo-7.jpg", alt: "Dédicace de livres" },
  { src: "/images/galerie/photo-8.jpg", alt: "Moment d'échange" },
  { src: "/images/galerie/photo-9.jpg", alt: "Photo de groupe" },
  // Photos ajoutées le 27/11 : sortie au parc, louange, Gospel Culture Day
  // (plaques d'immatriculation floutées).
  { src: "/images/galerie/photo-10.jpg", alt: "Pique-nique de la jeunesse au parc" },
  { src: "/images/galerie/photo-11.jpg", alt: "Sortie au parc" },
  { src: "/images/galerie/photo-12.jpg", alt: "Photo de groupe au parc" },
  { src: "/images/galerie/photo-13.jpg", alt: "Temps de louange et de prière" },
  { src: "/images/galerie/photo-14.jpg", alt: "La famille CCR réunie au parc" },
  { src: "/images/galerie/photo-15.jpg", alt: "Gospel Culture Day : tenues traditionnelles" },
  { src: "/images/galerie/photo-16.jpg", alt: "Gospel Culture Day : la joie du trophée" },
  { src: "/images/galerie/photo-17.jpg", alt: "Gospel Culture Day : tenue traditionnelle" },
  { src: "/images/galerie/photo-18.jpg", alt: "Gospel Culture Day : célébration" },
  { src: "/images/galerie/photo-19.jpg", alt: "Gospel Culture Day : remise du trophée" },
];

// Mélange Fisher-Yates : utilisé pour afficher les photos dans un ordre
// différent à chaque visite plutôt que toujours le même ordre d'ajout.
export function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
