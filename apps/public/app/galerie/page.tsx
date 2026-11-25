import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PHOTOS, shuffle } from "../_data/galerie";

export const metadata: Metadata = {
  title: "Galerie",
  description:
    "Photos et vidéos des cultes et événements de CCR Famille Casablanca.",
};

// Section 1.F du cahier des charges. D'autres photos et vidéos seront
// ajoutées depuis l'intranet une fois le stockage Supabase câblé (section 7).
// Rendu dynamique pour mélanger l'ordre des photos à chaque visite.
export const dynamic = "force-dynamic";

export default function GaleriePage() {
  const photos = shuffle(PHOTOS);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-ccr-ink/60 transition-colors hover:text-ccr-magenta"
      >
        <span aria-hidden="true">&larr;</span> Retour à l&rsquo;accueil
      </Link>

      <h1 className="mt-6 font-display text-4xl font-black">Galerie</h1>
      <p className="mt-3 max-w-xl text-ccr-ink/70">
        Quelques moments de la vie de l&rsquo;église. D&rsquo;autres photos et
        vidéos seront ajoutées prochainement.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((photo) => (
          <div
            key={photo.src}
            className="relative aspect-square overflow-hidden rounded-xl"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
        ))}
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`placeholder-${index}`}
            className="aspect-square rounded-xl border border-dashed border-ccr-ink/15 bg-ccr-ink/5"
          />
        ))}
      </div>
    </main>
  );
}
