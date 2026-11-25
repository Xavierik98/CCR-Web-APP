import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galerie",
  description: "Photos et videos des cultes et evenements de CCR Famille Casablanca.",
};

// Section 1.F du cahier des charges. Photos/videos officielles a fournir ;
// alimentation reelle depuis l'intranet une fois le stockage Supabase cable (section 7).
export default function GaleriePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl font-black">Galerie</h1>
      <p className="mt-3 max-w-xl text-ccr-ink/70">
        Les photos et videos de nos cultes et evenements seront bientot
        disponibles ici.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square rounded-xl border border-dashed border-ccr-ink/15 bg-ccr-ink/5"
          />
        ))}
      </div>
    </main>
  );
}
