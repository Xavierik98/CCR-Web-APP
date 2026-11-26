import Image from "next/image";
import type { Actualite } from "../_data/actualites";

// Visuel d'une actualité : la vidéo (avec son image d'aperçu) quand il y en a
// une, sinon l'affiche.
export function ActualiteMedia({ article, sizes }: { article: Actualite; sizes: string }) {
  if (article.video) {
    return (
      <video
        controls
        playsInline
        preload="none"
        poster={article.image}
        className="absolute inset-0 h-full w-full bg-ccr-ink object-cover"
      >
        <source src={article.video} type="video/mp4" />
      </video>
    );
  }
  return <Image src={article.image} alt={article.titre} fill sizes={sizes} className="object-cover" />;
}
