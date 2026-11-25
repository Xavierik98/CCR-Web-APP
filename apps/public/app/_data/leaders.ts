// Source unique pour les responsables, reutilisee par /a-propos et /equipe.
// Textes fournis par le client (25/11), reproduits mot pour mot.
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
    nom: "Apotre Gel EBA GATSE",
    titre: "Pere de la maison",
    texte:
      "Il porte la vision des eglises CCR. Sous sa conduite spirituelle, des petites assemblees de maison sont devenues une famille d'eglises unie autour d'un meme appel : rassembler, former et envoyer.",
    photo: "/images/about/apotre-gel-eba-gatse.jpg",
  },
  {
    slug: "pasteur-gliblas-tchounand",
    nom: "Pasteur Gliblas TCHOUNAND",
    titre: "Pasteur principal des eglises CCR Maroc",
    texte:
      "Il conduit l'oeuvre au Maroc, veille sur les assemblees et accompagne les fideles dans leur marche avec Dieu, fidele a la vision recue.",
    photo: "/images/about/pasteur-gliblas-tchounand.jpg",
  },
];
