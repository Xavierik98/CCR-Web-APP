import type { Metadata } from "next";
import { ImageSlot } from "../_components/image-slot";
import { LEADERS } from "../_data/leaders";

export const metadata: Metadata = {
  title: "L'equipe",
  description: "Le pasteur, les responsables et dirigeants de CCR Famille Casablanca.",
};

// Section 1.C du cahier des charges. Memes responsables que /a-propos
// (voir app/_data/leaders.ts) ; les autres fiches (responsables de
// departement) seront ajoutees au fur et a mesure des informations fournies.
export default function EquipePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl font-black">L&rsquo;equipe</h1>
      <p className="mt-3 text-ccr-ink/70">
        Le pasteur, les responsables spirituels et les dirigeants de CCR
        Famille.
      </p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        {LEADERS.map((leader) => (
          <article key={leader.slug} className="overflow-hidden rounded-2xl border border-ccr-ink/10">
            <div className="relative aspect-[4/3]">
              <ImageSlot src={leader.photo} alt={leader.nom} />
            </div>
            <div className="p-6">
              <h2 className="font-display text-xl font-bold">{leader.nom}</h2>
              <p className="text-sm font-semibold text-ccr-magenta">{leader.titre}</p>
              <p className="mt-3 text-sm text-ccr-ink/70">{leader.texte}</p>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-10 text-sm text-ccr-ink/50">
        Les fiches des responsables de departement seront ajoutees ici des
        reception des informations et photos officielles.
      </p>
    </main>
  );
}
