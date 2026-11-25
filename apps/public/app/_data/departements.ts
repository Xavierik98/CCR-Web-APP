// Poles confirmes par le client (25/11) : Coiffure, Informatique, Infographie,
// Finance, Media, Communication, Louange, Tresorerie, Social. Couture et
// stylisme / Patisserie sont des propositions a valider ou retirer.
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
    nom: "Communication",
    description: "Annonces, reseaux sociaux et supports de communication de l'eglise.",
    categorie: "Ministere",
  },
  {
    nom: "Media",
    description: "Son, image et diffusion des cultes et evenements.",
    categorie: "Ministere",
  },
  {
    nom: "Finance",
    description: "Gestion financiere et suivi budgetaire de l'eglise.",
    categorie: "Ministere",
  },
  {
    nom: "Tresorerie",
    description: "Collecte et suivi des offrandes et engagements.",
    categorie: "Ministere",
  },
  {
    nom: "Social",
    description: "Accompagnement et soutien social des membres.",
    categorie: "Ministere",
  },
  {
    nom: "Coiffure",
    description: "Formation et pratique aux metiers de la coiffure.",
    categorie: "Formation et metier",
  },
  {
    nom: "Informatique",
    description: "Initiation et perfectionnement en informatique.",
    categorie: "Formation et metier",
  },
  {
    nom: "Infographie",
    description: "Conception graphique et outils de creation visuelle.",
    categorie: "Formation et metier",
  },
  {
    nom: "Couture et stylisme",
    description: "Techniques de couture et creation de vetements.",
    categorie: "Formation et metier",
  },
  {
    nom: "Patisserie",
    description: "Initiation aux techniques de patisserie.",
    categorie: "Formation et metier",
  },
];
