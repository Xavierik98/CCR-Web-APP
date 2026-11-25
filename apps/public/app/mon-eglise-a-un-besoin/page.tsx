import type { Metadata } from "next";
import { Suspense } from "react";
import { DEPARTEMENTS } from "../_data/departements";
import { BesoinForm } from "./_components/besoin-form";

export const metadata: Metadata = {
  title: "L'église a un besoin",
  description:
    "Proposez votre savoir-faire, votre disponibilité ou une solution à CCR Famille Casablanca.",
};

// Inspiré de servir.egliseicc.com/mon-eglise-a-un-besoin/. Formulaire statique
// pour l'instant : la réception des demandes (e-mail ou module intranet dédié)
// reste à câbler une fois le canal choisi. Sert à la fois à rejoindre un
// département (présélectionné via ?departement=) et à proposer une solution
// ou une aide plus générale que vous identifiez.
export default function MonEgliseAUnBesoinPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-4xl font-black">L&rsquo;église a un besoin</h1>
      <p className="mt-3 text-ccr-ink/70">
        Vous avez un savoir-faire, une ressource ou une solution à proposer ?
        Que ce soit pour rejoindre un département ou pour répondre à un besoin
        que vous avez identifié, dites-le-nous : un responsable vous
        recontactera.
      </p>

      <Suspense fallback={null}>
        <BesoinForm departements={DEPARTEMENTS} />
      </Suspense>
    </main>
  );
}
