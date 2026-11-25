// Liste mise à jour le 25/11 : Coiffure, Couture et stylisme et Patisserie
// retirés. Finance + Trésorerie fusionnés en "Finances". Communication +
// Média + Infographie + Informatique fusionnés en "Communication & Digital".
// Ajout de "Service d'ordre" (accueil, protocole) le 26/11.
export type Departement = {
  nom: string;
  description: string;
  categorie: "Ministère" | "Formation et métier";
};

export const DEPARTEMENTS: Departement[] = [
  {
    nom: "Louange",
    description: "Conduite de la louange et de l'adoration pendant les cultes.",
    categorie: "Ministère",
  },
  {
    nom: "Communication & Digital",
    description:
      "Annonces, réseaux sociaux, conception graphique, son et image des cultes, informatique : tout ce qui fait rayonner et fonctionner techniquement l'église.",
    categorie: "Ministère",
  },
  {
    nom: "Finances",
    description:
      "Gestion financière et suivi budgétaire de l'église, collecte et suivi des offrandes et engagements.",
    categorie: "Ministère",
  },
  {
    nom: "Social",
    description: "Accompagnement et soutien social des membres.",
    categorie: "Ministère",
  },
  {
    nom: "Service d'ordre",
    description:
      "Accueil, orientation et protocole lors des cultes et événements, pour un déroulement serein.",
    categorie: "Ministère",
  },
];
