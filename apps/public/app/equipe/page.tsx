import type { Metadata } from "next";
import { ImageSlot } from "../_components/image-slot";
import { LEADERS, RESPONSABLES_MINISTERES } from "../_data/leaders";

export const metadata: Metadata = {
  title: "L'équipe",
  description:
    "Le pasteur, les responsables et dirigeants de CCR Famille Casablanca.",
};

// Section 1.C du cahier des charges. Mêmes responsables que /a-propos
// (voir app/_data/leaders.ts) ; les autres fiches (responsables de
// département) seront ajoutées au fur et à mesure des informations fournies.
export default function EquipePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl font-black">L&rsquo;équipe</h1>
      <p className="mt-3 text-ccr-ink/70">
        Le pasteur, les responsables spirituels et les dirigeants de CCR
        Famille.
      </p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {LEADERS.map((leader) => (
          <article key={leader.slug} className="overflow-hidden rounded-2xl border border-ccr-ink/10">
            <div className="relative aspect-[4/5]">
              <ImageSlot src={leader.photo} alt={leader.nom} className={leader.cadrage} />
            </div>
            <div className="p-6">
              <h2 className="font-display text-xl font-bold">{leader.nom}</h2>
              <p className="text-sm font-semibold text-ccr-magenta">{leader.titre}</p>
              {leader.texte ? <p className="mt-3 text-sm text-ccr-ink/70">{leader.texte}</p> : null}
            </div>
          </article>
        ))}
      </div>

      <h2 className="mt-14 font-display text-2xl font-bold">Responsables de ministère</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {RESPONSABLES_MINISTERES.map((r) => (
          <article key={r.nom} className="flex items-center gap-4 rounded-2xl border border-ccr-ink/10 bg-white p-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ccr-gold/20 font-display text-lg font-black text-[#9a6a0c]">{r.initiales}</span>
            <div>
              <h3 className="font-display text-lg font-bold">{r.nom}</h3>
              <p className="text-xs font-semibold text-ccr-magenta">{r.titre}</p>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-10 text-sm text-ccr-ink/50">
        Les fiches des responsables de département seront ajoutées ici dès
        réception des informations et photos officielles.
      </p>
    </main>
  );
}
