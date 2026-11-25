import type { Metadata } from "next";
import Image from "next/image";
import { PHOTOS } from "../_data/galerie";

export const metadata: Metadata = {
  title: "Galerie",
  description: "Photos et videos des cultes et evenements de CCR Famille Casablanca.",
};

// Section 1.F du cahier des charges. D'autres photos et videos seront
// ajoutees depuis l'intranet une fois le stockage Supabase cable (section 7).
export default function GaleriePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl font-black">Galerie</h1>
      <p className="mt-3 max-w-xl text-ccr-ink/70">
        Quelques moments de la vie de l&rsquo;eglise. D&rsquo;autres photos et
        videos seront ajoutees prochainement.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {PHOTOS.map((photo) => (
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
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`placeholder-${index}`}
            className="aspect-square rounded-xl border border-dashed border-ccr-ink/15 bg-ccr-ink/5"
          />
        ))}
      </div>
    </main>
  );
}
