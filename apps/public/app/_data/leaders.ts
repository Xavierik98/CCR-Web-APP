// Source unique pour les responsables, réutilisée par /a-propos et /equipe.
// Textes fournis par le client (25/11), orthographe et accents corrigés.
export type Leader = {
  slug: string;
  nom: string;
  titre: string;
  texte: string;
  photo: string;
};

export const LEADERS: Leader[] = [
  {
    slug: "apotre-gel-eba-gatse",
    nom: "Apôtre Gel EBA GATSE",
    titre: "Père de la maison",
    texte:
      "Il porte la vision des églises CCR. Sous sa conduite spirituelle, des petites assemblées de maison sont devenues une famille d'églises unie autour d'un même appel : rassembler, former et envoyer.",
    photo: "/images/about/apotre-gel-eba-gatse.jpg",
  },
  {
    slug: "pasteur-gliblas-tchounand",
    nom: "Pasteur Gliblas TCHOUNAND",
    titre: "Pasteur principal des églises CCR Maroc",
    texte:
      "Il conduit l'œuvre au Maroc, veille sur les assemblées et accompagne les fidèles dans leur marche avec Dieu, fidèle à la vision reçue.",
    photo: "/images/about/pasteur-gliblas-tchounand.jpg",
  },
];
