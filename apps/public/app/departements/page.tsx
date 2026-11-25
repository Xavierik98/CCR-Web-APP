import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Departements",
  description: "Les poles de competences de CCR Famille Casablanca.",
};

// Section 1.E du cahier des charges. Poles confirmes par le client (25/11) :
// Coiffure, Informatique, Infographie. Deux poles complementaires sont proposes
// ci-dessous (Couture & Stylisme, Patisserie) : a valider ou retirer avant publication.
const POLES = [
  {
    nom: "Coiffure",
    description: "Formation et pratique aux metiers de la coiffure.",
  },
  {
    nom: "Informatique",
    description: "Initiation et perfectionnement en informatique.",
  },
  {
    nom: "Infographie",
    description: "Conception graphique et outils de creation visuelle.",
  },
  {
    nom: "Couture et stylisme",
    description: "Techniques de couture et creation de vetements.",
  },
  {
    nom: "Patisserie",
    description: "Initiation aux techniques de patisserie.",
  },
];

export default function DepartementsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl font-black">Nos departements</h1>
      <p className="mt-3 max-w-2xl text-ccr-ink/70">
        Des poles de competences ou chacun peut apprendre, se former et
        mettre son savoir-faire au service des autres.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {POLES.map((pole) => (
          <article
            key={pole.nom}
            className="rounded-2xl border border-ccr-ink/10 bg-white/60 p-6"
          >
            <h2 className="font-display text-xl font-bold">{pole.nom}</h2>
            <p className="mt-2 text-sm text-ccr-ink/70">{pole.description}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
