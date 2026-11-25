// Adresse fournie par le client (25/11), source unique pour le footer et la
// page Contact afin d'eviter toute divergence entre les deux.
export const ADRESSE = "44 Rue de Bazas, Gironde, Casablanca, Maroc";

export const MAPS_EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(
  ADRESSE,
)}&output=embed`;
