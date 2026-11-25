// Version courte des trois piliers de la vision, pour la page d'accueil.
// Le texte integral et verbatim (fourni par le client) vit sur /a-propos.
export const PILIERS = [
  {
    nom: "Rassembler",
    texte:
      "Chacun est le bienvenu, quelle que soit son histoire : priere, Parole et communion fraternelle vecues ensemble.",
    verset: "Actes 2:42",
    icon: "users" as const,
    accent: "gold" as const,
  },
  {
    nom: "Former",
    texte:
      "Par l'enseignement, l'accompagnement et le service, nous aidons chaque croyant a devenir un disciple solide.",
    verset: "Ephesiens 4:12-13",
    icon: "book" as const,
    accent: "magenta" as const,
  },
  {
    nom: "Envoyer",
    texte:
      "Une vie restauree est faite pour en restaurer d'autres : nous preparons chacun a porter l'Evangile la ou Dieu l'a place.",
    verset: "Matthieu 28:19-20",
    icon: "spark" as const,
    accent: "blue" as const,
  },
];
