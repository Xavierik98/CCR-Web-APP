import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Actualites",
  description: "Annonces et actualites de CCR Famille Casablanca.",
};

// Section 1.G du cahier des charges. Les articles sont rediges et publies
// exclusivement par les administrateurs depuis l'intranet (photo + texte,
// confirme le 25/11), via le workflow de statuts de la section 6. Rien n'est
// affiche tant qu'aucun article n'est publie : pas de contenu invente ici.
export default function ActualitesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h1 className="font-display text-4xl font-black">Actualites</h1>
      <p className="mt-3 text-ccr-ink/70">
        Aucune actualite publiee pour l&rsquo;instant. Revenez bientot.
      </p>
    </main>
  );
}
