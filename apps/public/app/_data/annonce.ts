// Annonce défilante en haut du site, avec compte à rebours. Elle disparaît
// seule à la fin de l'événement. Pour une prochaine annonce, il suffit de
// changer ce fichier (textes repris de l'affiche fournie par le client).
export const ANNONCE = {
  titre: "Nuit de prière Traversée",
  lien: "/actualites",
  // Heures de Casablanca, écrites avec le décalage UTC en vigueur ce jour-là
  // (UTC+0 fin décembre selon la base officielle des fuseaux horaires).
  debut: "2026-12-31T20:00:00+00:00",
  fin: "2027-01-01T02:00:00+00:00",
  messages: [
    "Nuit de prière Traversée",
    "Banquet de la nouvelle saison 2026-2027",
    "Jeudi 31 décembre, de 20h à 2h",
    "44 Rue de Bazas, Quartier Gironde, Casablanca",
    "Dress code : rouge, doré, blanc",
    "Ne viens pas seul(e) !",
    "« Passons à l'autre bord. » Marc 4:35",
  ],
};
