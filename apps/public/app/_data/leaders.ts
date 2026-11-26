// Source unique pour les responsables, réutilisée par /a-propos et /equipe.
// Textes fournis par le client (25/11), orthographe et accents corrigés.
// Aucun texte n'est inventé : sans présentation fournie, la fiche n'affiche
// que le nom et la fonction.
export type Leader = {
  slug: string;
  nom: string;
  titre: string;
  texte?: string;
  photo: string;
  // Responsable de l'église locale, affiché dans "Nos responsables" sur
  // /a-propos (l'apôtre y est déjà présenté dans "Notre histoire").
  local: boolean;
};

export const LEADERS: Leader[] = [
  {
    slug: "apotre-gel-eba-gatse",
    nom: "Apôtre Gel EBA GATSE",
    titre: "Père de la maison",
    texte:
      "Il porte la vision des églises CCR. Sous sa conduite spirituelle, des petites assemblées de maison sont devenues une famille d'églises unie autour d'un même appel : rassembler, former et envoyer.",
    photo: "/images/about/apotre-gel-eba-gatse.jpg",
    local: false,
  },
  {
    slug: "pasteur-gliblas-tchounand",
    nom: "Pasteur Gliblas TCHOUNAND",
    titre: "Pasteur principal",
    texte:
      "Il conduit l'œuvre au Maroc, veille sur les assemblées et accompagne les fidèles dans leur marche avec Dieu, fidèle à la vision reçue.",
    photo: "/images/about/pasteur-gliblas-tchounand.jpg",
    local: true,
  },
  {
    slug: "arsene-kifila",
    nom: "Arsène KIFILA",
    titre: "Assistant pasteur",
    photo: "/images/about/arsene-kifila.jpg",
    local: true,
  },
];
