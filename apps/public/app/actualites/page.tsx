import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Annonces et actualités de CCR Famille Casablanca.",
};

// Section 1.G du cahier des charges. Les articles sont rédigés et publiés
// exclusivement par les administrateurs depuis l'intranet (photo + texte,
// confirmé le 25/11), via le workflow de statuts de la section 6. Rien n'est
// affiché tant qu'aucun article n'est publié : pas de contenu inventé ici.
export default function ActualitesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h1 className="font-display text-4xl font-black">Actualités</h1>
      <p className="mt-3 text-ccr-ink/70">
        Aucune actualité publiée pour l&rsquo;instant. Revenez bientôt.
      </p>
    </main>
  );
}
