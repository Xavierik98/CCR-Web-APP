import type { Metadata } from "next";
import Image from "next/image";
import { ACTUALITES } from "../_data/actualites";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Annonces et actualités de CCR Famille Casablanca.",
};

// Section 1.G du cahier des charges. A terme, les articles seront rédigés et
// publiés depuis l'intranet (photo + texte, confirmé le 25/11), via le
// workflow de statuts de la section 6 ; en attendant ce module, les annonces
// viennent de _data/actualites.ts. Rien n'est inventé : l'état vide reste
// honnête tant que la liste est effectivement vide.
export default function ActualitesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-center font-display text-4xl font-black">
        Actualités
      </h1>

      {ACTUALITES.length === 0 ? (
        <p className="mt-3 text-center text-ccr-ink/70">
          Aucune actualité publiée pour l&rsquo;instant. Revenez bientôt.
        </p>
      ) : (
        <div className="mt-10 flex flex-col gap-8">
          {ACTUALITES.map((article) => (
            <article
              key={article.slug}
              className="overflow-hidden rounded-2xl border border-ccr-ink/10 bg-white"
            >
              <div className="relative aspect-[16/9]">
                <Image
                  src={article.image}
                  alt={article.titre}
                  fill
                  sizes="(min-width: 768px) 672px, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h2 className="font-display text-xl font-bold">
                  {article.titre}
                </h2>
                <p className="mt-2 text-sm text-ccr-ink/70">{article.texte}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
