// Vidéo YouTube en arrière-plan : muette, en boucle, sans contrôles. Le
// conteneur parent doit être position relative + overflow hidden + une
// hauteur définie ; domaine youtube-nocookie.com pour limiter les cookies
// tant que personne n'interagit avec la vidéo.
export function YoutubeBackground({ videoId }: { videoId: string }) {
  const src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1&playsinline=1&rel=0&disablekb=1&iv_load_policy=3`;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <iframe
        src={src}
        title=""
        allow="autoplay; encrypted-media"
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
}
