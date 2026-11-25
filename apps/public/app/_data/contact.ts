// Adresse fournie par le client (25/11), source unique pour le footer et la
// page Contact afin d'éviter toute divergence entre les deux.
export const ADRESSE = "44 Rue de Bazas, Quartier Gironde, Casablanca, Maroc";

// "Quartier" précède "Gironde" pour éviter que Google ne géocode l'adresse
// vers le département français du même nom ; zoom resserré pour plus de
// précision sur la carte intégrée.
export const MAPS_EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(
  ADRESSE,
)}&output=embed&z=16`;
