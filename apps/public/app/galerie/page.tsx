import type { Metadata } from "next";
import Link from "next/link";
import { PHOTOS, shuffle } from "../_data/galerie";
import { GalleryGrid } from "./_components/gallery-grid";

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
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-ccr-ink/60 transition-colors hover:text-ccr-magenta"
      >
        <span aria-hidden="true">&larr;</span> Retour à l&rsquo;accueil
      </Link>

      <h1 className="mt-6 font-display text-4xl font-black">Galerie</h1>
      <p className="mt-3 max-w-xl text-ccr-ink/70">
        La vie de l&rsquo;église, portée par une jeunesse qui loue, sert et
        grandit dans la foi. Touchez une photo pour l&rsquo;agrandir.
      </p>

      <GalleryGrid photos={photos} />
    </main>
  );
}
