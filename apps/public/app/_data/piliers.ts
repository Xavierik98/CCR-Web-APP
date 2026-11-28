// Version courte des trois piliers de la vision, pour la page d'accueil.
// Le texte intégral et verbatim (fourni par le client) vit sur /a-propos.
export const PILIERS = [
  {
    nom: "Rassembler",
    texte:
      "Chacun est le bienvenu, quelle que soit son histoire : prière, Parole et communion fraternelle vécues ensemble.",
    // Version très courte (mobile), reprise du texte ci-dessus.
    court: "Chacun est le bienvenu, quelle que soit son histoire.",
    verset: "Actes 2:42",
    icon: "users" as const,
    accent: "gold" as const,
  },
  {
    nom: "Former",
    texte:
      "Par l'enseignement, l'accompagnement et le service, nous aidons chaque croyant à devenir un disciple solide.",
    court: "Aider chaque croyant à devenir un disciple solide.",
    verset: "Éphésiens 4:12-13",
    icon: "book" as const,
    accent: "magenta" as const,
  },
  {
    nom: "Envoyer",
    texte:
      "Une vie restaurée est faite pour en restaurer d'autres : nous préparons chacun à porter l'Évangile là où Dieu l'a placé.",
    court: "Porter l'Évangile là où Dieu nous a placés.",
    verset: "Matthieu 28:19-20",
    icon: "spark" as const,
    accent: "blue" as const,
  },
];
