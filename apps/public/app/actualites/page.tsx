import type { Metadata } from "next";
import { ActualiteMedia } from "../_components/actualite-media";
import { formatDateActualite, getActualites } from "../_data/actualites";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Annonces et actualités de CCR Famille Casablanca.",
};

// Section 1.G du cahier des charges. A terme, les articles viendront de
// l'intranet (module Actualités) ; en attendant, ils viennent de
// _data/actualites.ts, de la plus récente à la plus ancienne.
export default async function ActualitesPage() {
  const ACTUALITES = await getActualites();
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
              id={article.slug}
              className="scroll-mt-32 overflow-hidden rounded-2xl border border-ccr-ink/10 bg-white"
            >
              <div className="relative aspect-[16/9]">
                <ActualiteMedia article={article} sizes="(min-width: 768px) 672px, 100vw" />
              </div>
              <div className="p-6">
                <p className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ccr-magenta">
                  {article.evenement ? (
                    <span className="rounded-full bg-ccr-gold/20 px-2 py-0.5 text-[10px] tracking-wider text-ccr-ink">Événement</span>
                  ) : null}
                  {formatDateActualite(article.date)}
                  {article.heure ? ` à ${article.heure}` : ""}
                </p>
                <h2 className="mt-1 font-display text-xl font-bold">
                  {article.titre}
                </h2>
                {article.lieu ? <p className="mt-1 text-sm font-medium text-ccr-ink/80">{article.lieu}</p> : null}
                <p className="mt-2 whitespace-pre-line text-sm text-ccr-ink/70">{article.texte}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
