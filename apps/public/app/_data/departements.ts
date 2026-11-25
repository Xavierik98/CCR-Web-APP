// Liste mise a jour le 25/11 : Coiffure, Couture et stylisme et Patisserie
// retires. Finance + Tresorerie fusionnes en "Finances". Communication +
// Media + Infographie + Informatique fusionnes en "Communication & Digital".
export type Departement = {
  nom: string;
  description: string;
  categorie: "Ministere" | "Formation et metier";
};

export const DEPARTEMENTS: Departement[] = [
  {
    nom: "Louange",
    description: "Conduite de la louange et de l'adoration pendant les cultes.",
    categorie: "Ministere",
  },
  {
    nom: "Communication & Digital",
    description:
      "Annonces, reseaux sociaux, conception graphique, son et image des cultes, informatique : tout ce qui fait rayonner et fonctionner techniquement l'eglise.",
    categorie: "Ministere",
  },
  {
    nom: "Finances",
    description:
      "Gestion financiere et suivi budgetaire de l'eglise, collecte et suivi des offrandes et engagements.",
    categorie: "Ministere",
  },
  {
    nom: "Social",
    description: "Accompagnement et soutien social des membres.",
    categorie: "Ministere",
  },
];
