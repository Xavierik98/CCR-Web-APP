import type { Metadata } from "next";
import { DEPARTEMENTS } from "../_data/departements";

export const metadata: Metadata = {
  title: "L'eglise a un besoin",
  description: "Proposez votre savoir-faire ou votre disponibilite a CCR Famille Casablanca.",
};

// Inspire de servir.egliseicc.com/mon-eglise-a-un-besoin/. Formulaire statique
// pour l'instant : la reception des demandes (e-mail ou module intranot dedie)
// reste a cabler une fois le canal choisi.
export default function MonEgliseAUnBesoinPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-4xl font-black">L&rsquo;eglise a un besoin</h1>
      <p className="mt-3 text-ccr-ink/70">
        Vous avez un savoir-faire, du temps ou une envie de servir ?
        Dites-nous ou vous pourriez etre utile, un responsable de departement
        vous recontactera.
      </p>

      <form className="mt-10 flex flex-col gap-4">
        <div>
          <label htmlFor="nom" className="text-sm font-semibold">
            Nom
          </label>
          <input
            id="nom"
            name="nom"
            type="text"
            required
            className="mt-1 w-full rounded-lg border border-ccr-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="contact" className="text-sm font-semibold">
            Telephone ou e-mail
          </label>
          <input
            id="contact"
            name="contact"
            type="text"
            required
            className="mt-1 w-full rounded-lg border border-ccr-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="departement" className="text-sm font-semibold">
            Departement qui vous interesse
          </label>
          <select
            id="departement"
            name="departement"
            className="mt-1 w-full rounded-lg border border-ccr-ink/20 bg-white px-3 py-2 text-sm"
          >
            {DEPARTEMENTS.map((pole) => (
              <option key={pole.nom}>{pole.nom}</option>
            ))}
            <option>Autre</option>
          </select>
        </div>
        <div>
          <label htmlFor="message" className="text-sm font-semibold">
            Votre savoir-faire ou votre disponibilite
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            className="mt-1 w-full rounded-lg border border-ccr-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="mt-2 rounded-full bg-ccr-gold px-6 py-3 text-sm font-semibold text-ccr-ink transition-colors hover:bg-ccr-gold-light"
        >
          Envoyer
        </button>
      </form>
    </main>
  );
}
