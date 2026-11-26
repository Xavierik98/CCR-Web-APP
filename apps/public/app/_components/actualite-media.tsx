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
  if (article.portrait) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-ccr-ink">
        <Image src={article.image} alt="" aria-hidden="true" fill sizes="200px" className="scale-125 object-cover opacity-70 blur-2xl" />
        <Image src={article.image} alt={article.titre} fill sizes={sizes} className="object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)]" />
      </div>
    );
  }
  return <Image src={article.image} alt={article.titre} fill sizes={sizes} className="object-cover" />;
}
