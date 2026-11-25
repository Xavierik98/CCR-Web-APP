import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "L'equipe",
  description: "Le pasteur, les responsables et dirigeants de CCR Famille Casablanca.",
};

// Section 1.C du cahier des charges. Noms et photos a fournir par le client et
// publies uniquement apres validation (section 6) : aucune fiche inventee.
export default function EquipePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h1 className="font-display text-4xl font-black">L&rsquo;equipe</h1>
      <p className="mt-3 text-ccr-ink/70">
        Les fiches du pasteur, des responsables spirituels et des dirigeants
        seront publiees ici des reception des informations et photos
        officielles.
      </p>
    </main>
  );
}
