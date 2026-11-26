// Coordonnées bancaires pour les dons et collectes par virement. Aucune
// valeur inventée : tant que le RIB n'est pas fourni par l'église, le site
// invite à le demander. Renseignez ces champs (ou les variables
// d'environnement correspondantes) pour l'afficher directement.
export const RIB = {
  titulaire: process.env.NEXT_PUBLIC_RIB_TITULAIRE ?? null,
  banque: process.env.NEXT_PUBLIC_RIB_BANQUE ?? null,
  numero: process.env.NEXT_PUBLIC_RIB_NUMERO ?? null,
};

export const RIB_DISPONIBLE = Boolean(RIB.titulaire && RIB.numero);
