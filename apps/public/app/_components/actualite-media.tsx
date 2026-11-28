import Image from "next/image";
import type { Actualite } from "../_data/actualites";

// Lien de vidéo d'une plateforme (YouTube, Facebook, Instagram, TikTok, Vimeo)
// transformé en lecteur intégré ; null pour un fichier vidéo direct.
export function videoEmbed(url: string): string | null {
  try {
    const u = new URL(url, "https://ccr-famille-public.vercel.app");
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (host.endsWith("youtube.com")) {
      const id = u.searchParams.get("v") ?? u.pathname.match(/\/(shorts|embed|live)\/([^/?]+)/)?.[2];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host.endsWith("facebook.com") || host === "fb.watch")
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
    if (host.endsWith("instagram.com")) {
      const m = u.pathname.match(/\/(p|reel|tv)\/([^/?]+)/);
      return m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed` : null;
    }
    if (host.endsWith("tiktok.com")) {
      const id = u.pathname.match(/\/video\/(\d+)/)?.[1];
      return id ? `https://www.tiktok.com/embed/v2/${id}` : null;
    }
    if (host.endsWith("vimeo.com")) {
      const id = u.pathname.match(/\/(\d+)/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

// Visuel d'une actualité : la vidéo (fichier ou lien de plateforme) quand il
// y en a une, sinon l'affiche, sinon une carte titrée.
export function ActualiteMedia({ article, sizes }: { article: Actualite; sizes: string }) {
  if (article.video) {
    const embed = videoEmbed(article.video);
    if (embed) {
      return (
        <iframe
          src={embed}
          title={article.titre}
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0 bg-ccr-ink"
        />
      );
    }
    return (
      <video controls playsInline preload="metadata" poster={article.image ?? undefined} className="absolute inset-0 h-full w-full bg-ccr-ink object-cover">
        <source src={article.video} />
      </video>
    );
  }
  if (!article.image && article.slug.startsWith("appel-aux-dons")) {
    // Appel aux dons du social : visuel propre, sans photo à fournir.
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden bg-gradient-to-br from-ccr-magenta via-[#b8235f] to-ccr-gold p-4 text-center text-white sm:gap-3">
        <span aria-hidden="true" className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <span aria-hidden="true" className="absolute -bottom-12 -right-8 h-44 w-44 rounded-full bg-ccr-gold/40 blur-2xl" />
        <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur sm:h-14 sm:w-14">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 sm:h-7 sm:w-7" aria-hidden="true">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </span>
        <span className="relative text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80 sm:text-xs">Accompagnement social</span>
        <span className="relative font-display text-lg font-black leading-tight sm:text-3xl">Appel aux dons</span>
      </div>
    );
  }
  if (!article.image) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-ccr-ink via-[#2a2118] to-ccr-magenta/60 p-4 text-center">
        <span className="font-display text-base font-black leading-tight text-ccr-cream sm:text-2xl">{article.titre}</span>
      </div>
    );
  }
  // Images venant de l'intranet (autre domaine) : affichées telles quelles.
  const remote = !article.image.startsWith("/");
  if (article.portrait) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-ccr-ink">
        <Image src={article.image} alt="" aria-hidden="true" fill sizes="200px" unoptimized={remote} className="scale-125 object-cover opacity-70 blur-2xl" />
        <Image src={article.image} alt={article.titre} fill sizes={sizes} unoptimized={remote} className="object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)]" />
      </div>
    );
  }
  return <Image src={article.image} alt={article.titre} fill sizes={sizes} unoptimized={remote} className="object-cover" />;
}
