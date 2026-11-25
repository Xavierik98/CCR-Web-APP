import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Adresse, localisation et formulaire de contact de CCR Famille Casablanca.",
};

// Adresse fournie par le client (25/11). Telephone et e-mail officiels restent
// a fournir (section 10 du cahier des charges) : aucune coordonnee inventee ici.
const ADRESSE = "44 Rue de Bazas, Gironde, Casablanca, Maroc";
const MAPS_EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(
  ADRESSE,
)}&output=embed`;

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl font-black">Nous contacter</h1>
      <p className="mt-3 text-ccr-ink/70">
        Une question, une demande de visite ? Ecrivez-nous ou venez nous
        rencontrer.
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="font-display text-xl font-bold">Adresse</h2>
          <p className="mt-2 text-ccr-ink/80">
            CCR - Centre Chretien de Restauration
            <br />
            {ADRESSE}
          </p>

          <h2 className="mt-8 font-display text-xl font-bold">Autres moyens</h2>
          <p className="mt-2 text-sm text-ccr-ink/60">
            Telephone et e-mail a venir.
          </p>

          <div className="mt-8 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-ccr-ink/10">
            <iframe
              title={`Localisation CCR Famille - ${ADRESSE}`}
              src={MAPS_EMBED_SRC}
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <form className="flex flex-col gap-4">
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
            <label htmlFor="email" className="text-sm font-semibold">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-ccr-ink/20 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="sujet" className="text-sm font-semibold">
              Sujet
            </label>
            <select
              id="sujet"
              name="sujet"
              className="mt-1 w-full rounded-lg border border-ccr-ink/20 bg-white px-3 py-2 text-sm"
            >
              <option>Demande d&rsquo;information</option>
              <option>Demande de visite</option>
              <option>Demande de priere</option>
              <option>Autre</option>
            </select>
          </div>
          <div>
            <label htmlFor="message" className="text-sm font-semibold">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="mt-1 w-full rounded-lg border border-ccr-ink/20 bg-white px-3 py-2 text-sm"
            />
          </div>
          {/* Envoi reel du formulaire a cabler une fois le canal de reception
              (e-mail ou intranet) choisi : pas de traitement cote client pour l'instant. */}
          <button
            type="submit"
            className="mt-2 rounded-full bg-ccr-gold px-6 py-3 text-sm font-semibold text-ccr-ink transition-colors hover:bg-ccr-gold-light"
          >
            Envoyer
          </button>
        </form>
      </div>
    </main>
  );
}
