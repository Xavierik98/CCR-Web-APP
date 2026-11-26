import type { Metadata } from "next";
import { ActualiteMedia } from "../_components/actualite-media";
import { ACTUALITES, formatDateActualite } from "../_data/actualites";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Annonces et actualités de CCR Famille Casablanca.",
};

// Section 1.G du cahier des charges. A terme, les articles viendront de
// l'intranet (module Actualités) ; en attendant, ils viennent de
// _data/actualites.ts, de la plus récente à la plus ancienne.
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
                <ActualiteMedia article={article} sizes="(min-width: 768px) 672px, 100vw" />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-ccr-magenta">
                  {formatDateActualite(article.date)}
                </p>
                <h2 className="mt-1 font-display text-xl font-bold">
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
