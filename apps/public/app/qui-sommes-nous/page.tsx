import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Qui sommes-nous",
  description: "Histoire, vision, mission et valeurs de CCR Famille Casablanca.",
};

// Section 1.B du cahier des charges. Textes (histoire, vision, mission, valeurs,
// declaration de foi) a fournir : aucun contenu invente a leur place.
const SECTIONS = [
  "Notre histoire",
  "Notre vision",
  "Notre mission",
  "Nos valeurs",
  "Notre declaration de foi",
];

export default function QuiSommesNousPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-black">Qui sommes-nous</h1>
      <p className="mt-3 text-ccr-ink/70">
        Decouvrez l&rsquo;histoire et l&rsquo;identite de CCR Famille.
      </p>

      <div className="mt-10 divide-y divide-ccr-ink/10 border-y border-ccr-ink/10">
        {SECTIONS.map((titre) => (
          <section key={titre} className="py-6">
            <h2 className="font-display text-xl font-bold">{titre}</h2>
            <p className="mt-2 text-sm text-ccr-ink/50">Contenu a venir.</p>
          </section>
        ))}
      </div>
    </main>
  );
}
